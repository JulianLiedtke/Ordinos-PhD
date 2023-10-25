<template>
  <q-page class="q-ma-sm">
    <!-- State: Scan QR-Code -->
    <ComponentScanQrCode v-if="state == STATES.START" v-on:decode="onQrCode" />

    <!-- State: Wait for Audit/Submit -->
    <q-card v-if="state == STATES.WAIT_FOR_AUDIT_OR_SUBMIT">
      <q-card-section class="bg-accent"> {{ $t('Verification.device_ready') }} </q-card-section>
      <q-card-section align="center">
        <q-icon name="desktop_windows" size="100px" />
      </q-card-section>
      <q-card-section align="center">
        {{ $t('Verification.next_steps_on_pc') }}
      </q-card-section>
    </q-card>

    <!-- State: Audit computation -->
    <ComponentEncryption
      v-else-if="state == STATES.AUDIT"
      v-on:done="flowControl"
    ></ComponentEncryption>

    <!-- State: Show user Ballot -->
    <q-card v-else-if="state == STATES.USER_VERIFICATION">
      <q-card-section class="bg-accent">
        {{ $t('Verification.fill_out_ballot_paper') }}
      </q-card-section>

      <q-separator />

      <q-card-section>
        <ComponentBallot> </ComponentBallot>
      </q-card-section>

      <q-separator />

      <q-card-actions align="center">
        <q-btn
          v-on:click="flowControl({ audit: false })"
          color="negative"
          :label="$t('Verification.false')"
          size="xl"
        />
        <q-btn
          v-on:click="flowControl({ audit: true })"
          color="positive"
          :label="$t('Verification.correct')"
          size="xl"
        />
      </q-card-actions>
    </q-card>

    <!-- State: Audit failed -->
    <q-card v-else-if="state == STATES.AUDIT_FAILED">
      <q-card-section align="center">
        <q-icon name="report_problem" size="100px" class="text-negative" />
      </q-card-section>
      <q-card-section align="center">
        {{ $t('Verification.verification_failed') }}
        <br />
        {{ $t('Verification.possibility_to_manipulate_voting') }}
        <br />
        {{ $t('Verification.ballot_not_sent') }}
      </q-card-section>
      <q-card-section align="center">
        <q-btn v-on:click="flowControl(true)" :label="$t('Verification.back_to_the_start')" />
      </q-card-section>
    </q-card>

    <!-- State: After succesful submit -->
    <q-card v-else-if="state == STATES.SUBMITTED">
      <q-card-section class="bg-accent"> {{ $t('Verification.voting') }} </q-card-section>
      <q-card-section align="center">
        <q-icon name="thumb_up" size="100px" class="text-positive" />
      </q-card-section>
      <q-card-section v-if="demo" align="center">
        {{ $t('Verification.demo_election_arrived') }}
      </q-card-section>
      <q-card-section v-else-if="!demo" align="center">
        {{ $t('Verification.voting_casted') }}
      </q-card-section>
      <q-card-section v-if="!isFirstVote" align="center">
        {{ $t('Verification.overwrite_voting') }}
      </q-card-section>
      <q-separator inset />
      <q-card-section align="center">
        {{ $t('Verification.color_of_election_results') }}
        <div
          style="border-radius: 5px; border: solid 3px grey"
          align="center"
          class="showcolor"
          v-bind:class="color"
        ></div>
      </q-card-section>
      <q-card-section v-if="!demo" align="center">
        {{ $t('Verification.results_will_be_notified') }}
      </q-card-section>
      <q-card-section align="center">
        <q-btn v-on:click="flowControl()" :label="$t('Verification.back_to_menu')" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
// Vue Components
import { mapGetters, mapActions } from "vuex";
import ComponentScanQrCode from "components/Verification/ComponentScanQrCode";
import ComponentEncryption from "components/Verification/ComponentEncryption";
import ComponentBallot from "components/Verification/ComponentBallot";
import ControlState from "components/Verification/ControlStateEnumeration";

// Javascript Libraries
import CommunicationInterface from "components/CommunicationInterface";
import Diagnose from "components/Diagnose";

export default {
  name: "PageVerification",
  data() {
    return {
      STATES: ControlState.ControlState, // neccessary to have ControlState reachable in the template part above
      state: ControlState.ControlState.START, // Current State
      hostId: "", // PeerID of host
      key: "", // Key for communication with host
      nonce: "", // Nonce for authentication with host
      comInterface: new CommunicationInterface(), // Communication Interface for Peer2Peer
      color: "", // Color of election
      demo: false, // If it is a demo vote
      isFirstVote: true,
    };
  },
  components: {
    ComponentScanQrCode,
    ComponentBallot,
    ComponentEncryption
  },
  /**
   * Before user is leaving site, ask if he is sure
   * because it will cancel the voting process
   */
  beforeRouteLeave(to, from, next) {
    if (
      this.state != this.STATES.START &&
      this.state != this.STATES.SUBMITTED
    ) {
      //Only if already started and not finished
      const answer = window.confirm(this.$t('Verification.cancel_election'));
      if (answer) {
        // Leave site
        this.comInterface.disconnect();
        next();
      } else {
        // Stay
        next(false);
      }
    } else {
      // Leave site
      next();
    }
  },
  methods: {
    ...mapActions("storeConfig", [
      "setSecurity",
      "setPeerServerIP",
      "setChoices",
      "setBallot",
      "setCandidates",
      "setBullet",
      "setPaillier",
      "clearStore",
      "setVoterId",
      "setVoterSecret",
      "setSecretRandomNumbers",
      "setPlainTrashValues"
    ]),
    ...mapGetters("storeConfig", [
      "getSecurity",
      "getPeerServerIP",
      "getChoices",
      "getBallot",
      "getCandidates"
    ]),

    /**
     * State control management
     * Is executed at the end of a state before transition to next
     *
     * @param {object} payload
     */
    flowControl(payload = {}) {
      switch (this.state) {
        case this.STATES.SCAN:
          // Pre: Show Scanner
          // Post: QR Code scanned
          // Payload: {String} decoded QR-String
          this.parseCode(payload); // Parse the scanned code
          var payload = {
            key: this.key,
            nonce: this.nonce
          };
          this.setSecurity(payload);
          this.startPeer();
          this.state++;
          break;
        case this.STATES.CONNECT:
          // Pre: Peer Started
          // Post: Connected to host
          this.state++;
          this.$q.notify({
            type: "positive",
            position: "top",
            message: this.$t('Verification.secure_connection')
          });
          break;
        case this.STATES.WAIT_FOR_AUDIT_OR_SUBMIT:
          // Pre: Waiting for audit/submit
          // Post: Message received
          // Payload: {object} {audit: bool, ballot: obj, bullet: obj, candidates: obj,
          //                    choices: Array, nonce: String, paillier: obj, voterId: Int} (if audit = true)
          // OR: {audit: bool, election: obj, firstTime: bool, nonce: String} (if audit = false)
          if (payload.audit == true) {
            // Audit
            this.setChoices(payload.choices); // Store choices (clear data)
            this.setBallot(payload.ballot); // Store ballot (for user verification purpose)
            this.setCandidates(payload.candidates); // Store candidates (for user verification purpose)
            this.setBullet(payload.bullet); // Store bullet (encrypted data)
            this.setSecretRandomNumbers(payload.secretRandomNumbers);
            this.setPaillier(payload.paillier); // Set paillier (key, etc)
            this.setVoterId(payload.voterId);
            this.setVoterSecret(payload.voterSecret);
            this.setPlainTrashValues(payload.plainTrashValues);
            this.state++; // Starts computation
            Diagnose.startTimer("Encrypting");
          } else {
            // Submit
            this.submit(payload);
          }
          break;
        case this.STATES.AUDIT:
          // Pre: Computing Audit
          // Post: Finished computation
          // Payload: {object} {audit: bool} (result of audit)
          if (payload != null && payload.audit != null) {
            if (payload.audit == true) {
              // Audit correct
              this.state++;
            } else {
              // Audit failed
              this.state = this.STATES.AUDIT_FAILED; // Goto state: audit failed
              payload.nonce = this.nonce;
              this.comInterface.send(payload); // Send audit result to host
            }
          }
          Diagnose.endTimer();
          Diagnose.startTimer("User ballot verification");
          break;
        case this.STATES.USER_VERIFICATION:
          // Pre: Audit is correct
          // Post: User Verification
          // Payload: {object} {audit: bool} (result of verification)
          if (payload.audit == true) {
            this.state = this.STATES.WAIT_FOR_AUDIT_OR_SUBMIT;
          } else {
            this.state = this.STATES.AUDIT_FAILED;
          }
          payload.nonce = this.nonce;
          this.comInterface.send(payload);
          this.setChoices([]); // Clear locally stored clear text choices

          Diagnose.endTimer();
          break;
        case this.STATES.USER_VERIFICATION:
          // Pre: Audit is false
          // Post: Go back to menu
          this.reset();
          this.$router.replace("/");
          break;
        case this.STATES.SUBMITTED:
          // Pre: ACK received and shown
          // Post: Go back to menu
          this.reset();
          this.$router.replace("/");
          break;
        case this.STATES.AUDIT_FAILED:
          // Pre: Audit failed
          // Post: Go to start
          this.reset();
          break;
      }
    },

    /**
     * Reset to start (file load)
     * Disconnect from Peer and clear storage (especially choices of ballot, key and nonce)
     */
    reset() {
      this.comInterface.disconnect();
      this.clearStore();
      this.state = this.STATES.START;
      Diagnose.reset();
    },

    /**
     * Emitted when QR-Code has been scanned.
     * Parse for JSON and save HostId
     *
     * @param {String} code
     * @event
     */
    onQrCode(code) {
      this.flowControl(code);
    },

    /**
     * Parse the scanned QR-code
     *  @param {String} payload code
     */
    parseCode(payload) {
      payload = JSON.parse(payload);
      this.hostId = payload.hostId;
      this.key = payload.key;
      this.nonce = payload.nonce;
      this.setPeerServerIP(payload.peerServerIP);
    },

    /**
     * Start a local Peer
     */
    startPeer() {
      this.comInterface.startPeer(
        this.getPeerServerIP(),
        this.callbackPeerReady,
        null,
        this.callbackConnectionClosed,
        this.callbackMessageReceived
      );
      this.comInterface.setKey(this.getSecurity().key);
    },

    /**
     * Called when local Peer is ready
     *
     * @callback
     */
    callbackPeerReady() {
      this.comInterface.connectTo(this.hostId, this.callbackConnectedToHost);
    },

    /**
     * Called when connected to host
     *
     * @callback
     */
    callbackConnectedToHost() {
      this.comInterface.send({ nonce: this.nonce });
      this.flowControl();
    },

    /**
     * Called when connection (to Host) is closed
     *
     * @callback
     */
    callbackConnectionClosed() {
      if (
        this.state != this.STATES.SUBMITTED 
        // DEPRECATED &&      this.state != this.USER_HAD_ALREADY_VOTED
      ) {
        this.$q.notify({
          type: "negative",
          position: "top",
          message: this.$t('Verification.device_disconnected')
        });
        this.reset();
      }
    },

    /**
     * Called when Message is received (Audit or Submit)
     *
     * @param {object} data
     * @callback
     */
    callbackMessageReceived(data) {
      //Audit or Submit
      if (data.nonce == this.nonce) {
        if (this.state == this.STATES.WAIT_FOR_AUDIT_OR_SUBMIT) {
          this.flowControl(data);
        }
      }
    },

    /**
     * Handle submit. Store election in local storage
     *
     * @param {object} payload
     */
    submit(payload) {
    var elections = this.$q.localStorage.getItem("election"); // Read elections from local storage

    /* TODO: Test signature of ACK */

    if (payload.election.demo) {
      payload.election.timestamp = new Date().toISOString();
      payload.election.dates = [payload.election.timestamp];
      payload.election.id = "demo_" + payload.election.id; //or just demo?
    }

    //check if same election (i.e same hash, same electionId and same bb Server) is in local storage
    var storedElectionIndex = -1
      if(elections != null) {
        for (var i=0; i<elections.length; i++){
            var el = elections[i];
          if(el.id == payload.election.id &&
              el.bulletinBoardServerIP == payload.election.bulletinBoardServerIP &&
              el.hash == payload.election.hash) {
                storedElectionIndex = i
          }
        }
      }

      if(storedElectionIndex == -1){
        // this election is not stored in the local storage

        payload.election.allVotesStored = (payload.timesVoted == 1)  //false if election should be in local storage but was deleted
        
        payload.election["dates"] = [payload.election.timestamp]
        this.isFirstVote = true;

        if (elections == null) {
          // If no elections are in local storage
          payload.election.color = this.getRandomColor(0); // Set a color
          this.color = payload.election.color; // Set color
          elections = [payload.election]; // Create array with current election as an item 
        } else {
          payload.election.color = this.getRandomColor(elections.length); // Set a color
          this.color = payload.election.color; // Set color
          elections.push(payload.election); // store election in array
        }

      } else {
        // same election is in local storage --> no new election is created but existing election is updated

        el = elections[storedElectionIndex]
        el.allVotesStored = (el.timesVoted +1 == payload.timesVoted)
        //update choices
        el.bullet = payload.election.bullet
        el.timestamp = payload.election.timestamp

        //add new timestamp to list
        el["dates"].push(payload.election.timestamp);
        this.color = el.color;
        this.isFirstVote = false;
      }

      this.$forceUpdate(); // Update gui
      this.$q.localStorage.set("election", elections); // Store array of elections in local storage
      this.demo = payload.election.demo; //if its a demo vote
      this.state = this.STATES.SUBMITTED; // Goto state: submitted
      this.setNotification(payload.election.due); // Set notification for result release
      Diagnose.submit(payload.election.voterId); // Send diagnostic data
    },

    /**
     * Check if election is already in local storage or not
     *
     * @param {string} id
     * @param {string} voterId
     * @return {boolean}
     */
    isAckInStorage(id, voterId) {
      var elections = this.$q.localStorage.getItem("election");
      var res = false;
      elections.forEach(election => {
        if (election.id == id && election.voterId == voterId) {
          res = true;
          return;
        }
      });
      return res;
    },

    /**
     * Retrieves election from local storage
     *
     * @param {string} id
     * @param {string} voterId
     * @return {object}
     */
    getElectionFromStorage(id, voterId) {
      var elections = this.$q.localStorage.getItem("election");
      var res = null;
      elections.forEach(election => {
        if (election.id == id && election.voterId == voterId) {
          res = election;
          return;
        }
      });
      return res;
    },

    /**
     * Get a color.
     * Currently implemented as RoundRobin with step
     *
     * @param {number} step
     * @return {string}
     */
    getRandomColor(step) {
      var c;
      step = step % 5;
      switch (step) {
        case 0:
          c = "bg-lime-2";
          break;
        case 1:
          c = "bg-purple-2";
          break;
        case 2:
          c = "bg-cyan-2";
          break;
        case 3:
          c = "bg-deep-purple-2";
          break;
        case 4:
          c = "bg-green-3";
          break;
      }
      return c;
    },

    /**
     * Set notification for election results.
     * Parameter date: [year, month, day, hour, minute]
     *
     * @param {Array} date
     */
    setNotification(date) {
      if (this.$q.platform.is.android && false) {
        // If platform is Android
        try {
          // cordova.plugins.notification.local.hasPermission(function(granted) {
          //   alert("Permission: " + granted);
          // });
          date = new Date(date[0], date[1] - 1, date[2], date[3], date[4]);

          cordova.plugins.notification.local.schedule({
            title: $t('Verification.election_results_published'),
            text: $t('Verification.check_now'),
            trigger: {
              at: date
            },
            smallIcon: "res://icon.png",
            icon: "res://icon.png"
          });
        } catch (error) {
          alert(error.message);
        }
      }
    },
  },
  computed: {}
};
</script>
<style lang="sass" scoped>
.showcolor
  width: 50px
  height: 50px
</style>
