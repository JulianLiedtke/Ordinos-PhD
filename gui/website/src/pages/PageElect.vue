<template>
  <q-page class="q-ma-md">
    <!-- Popup when page loads: Welcome message -->
    <q-dialog v-if="firstVisit" v-model="tutorialData.dialog" persistent @hide="disableFirstVisit()">
      <q-card v-if="showIntro">
        <q-card-section>
          <div class="text-h6">{{ $t('PageElect.welcome') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('PageElect.participate_in_election') }}
          <br /> {{ $t('PageElect.preconditions_for_participation') }}
          <br />
          <br /> {{ $t('PageElect.read_instructions') }}
          <br />  {{ $t('PageElect.start_voting') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('PageElect.close')" color="primary" @click="closeIntro()" />
          <q-btn
            :label="$t('PageElect.instructions')"
            color="positive"
            @click="showTutorial()"
          />
        </q-card-actions>
      </q-card>
      <ComponentTutorial
        v-if="tutorialData.showTutorial"
        :data="tutorialData"
      ></ComponentTutorial>
    </q-dialog>

    <!-- State: Load config file -->
    <ComponentLoadConfigFile
      v-if="state == STATES.START"
      v-on:load="onFileLoaded"
    />

    <!-- State: Show QR code -->
    <ComponentShowQrCode
      v-else-if="state == STATES.SHOW_QR_CODE"
      v-bind:peerToPeerId="this.comInterface.getId()"
    />

    <!-- State: Vote -->
    <ComponentBallot
      v-else-if="state == STATES.VOTE"
      @voted="onVoted"
    ></ComponentBallot>

    <!-- State: Compute Encryption -->
    <ComponentEncryption
      v-else-if="state == STATES.COMPUTE_BALLOT_ENCRYPTION"
      v-on:done="flowControl"
    ></ComponentEncryption>

    <!-- State: Choice audit or submit -->
    <ComponentAuditOrSubmit
      v-else-if="state == STATES.CHOICE_AUDIT_OR_SUBMIT"
      v-on:audit="onAudit"
      v-on:submit="onSubmit"
    />

    <!-- State: Audit -->
    <q-card v-else-if="state == STATES.AUDIT" class="card-middle">
      <q-card-section class="bg-accent"
        >{{ $t('PageElect.waiting_for_verification') }}</q-card-section
      >
      <q-card-section>
        {{ $t('PageElect.take_phone_and_follow_steps') }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <center>
          <q-icon name="smartphone" size="100px" />
        </center>
      </q-card-section>
    </q-card>

    <!-- State: Submitted, wait for reply from AS -->
    <q-card
      v-else-if="state == STATES.SUBMIT_WAIT_FOR_REPLY_FROM_AS"
      class="card-middle"
    >
      <q-card-section class="bg-accent">{{ $t('PageElect.please_wait') }}</q-card-section>
      <q-card-section align="center"
        >{{ $t('PageElect.waiting_for_confirmation') }}</q-card-section
      >
      <q-card-section>
        <center>
          <q-spinner-hourglass color="primary" size="10em" />
        </center>
      </q-card-section>
    </q-card>

    <!-- State: Submit successful - DemoMode Off -->
    <q-card
      v-else-if="state == STATES.SUBMIT_SUCCESSFUL && demoMode == false"
      class="card-middle"
    >
      <q-card-section class="bg-accent">{{ $t('PageElect.voting') }}</q-card-section>
      <q-card-section align="center">
        <q-icon name="thumb_up" size="100px" class="text-positive" />
      </q-card-section>
      <q-card-section align="center">
        {{ $t('PageElect.you_are_voting_for') }} {{ timesVoted }}. {{ $t('PageElect.time') }}
      </q-card-section>
      <q-card-section v-if="timesVoted > 1" align="center">
        Bei der Auswertung wird nur Ihre aktuelle Stimme gezählt.
      </q-card-section>
      <q-card-section align="center">
        {{ $t('PageElect.casted_vote_successfully') }}
        <br />
        <br />
        {{ $t('PageElect.voting_done') }}
        {{ getDueDate() }} {{ $t('PageElect.view') }}
      </q-card-section>
      <q-card-section align="center">
         <q-btn v-on:click="flowControl" :label="$t('PageElect.back_to_start')" /> <!-- Warum auskommentiert?-->
      </q-card-section>
    </q-card>

    <!-- State: Submit successful - DemoMode On -->
    <q-card
      v-else-if="state == STATES.SUBMIT_SUCCESSFUL && demoMode == true"
      class="card-middle"
    >
      <q-card-section class="bg-accent">{{ $t('PageElect.voting') }}</q-card-section>
      <q-card-section align="center">
        <q-icon name="thumb_up" size="100px" class="text-positive" />
      </q-card-section>
      <q-card-section align="center">
        {{ $t('PageElect.demo_success') }}
        <br />
        <br />
        {{ $t('PageElect.voting_done_details') }}
      </q-card-section>
      <q-card-section align="center">
        <q-btn
          :label="$t('PageElect.end_demo')"
          icon="close"
          v-on:click="exitDemoMode"
        ></q-btn>
        <!-- <q-btn v-on:click="flowControl" :label="$t('PageElect.back_to_start')" disable /> -->
      </q-card-section>
    </q-card>

    <!-- State: VVD Disconnected -->
    <q-card v-else-if="state == STATES.VVD_DISCONNECTED" class="card-middle">
      <q-card-section align="center">
        <q-icon name="report_problem" size="100px" class="text-negative" />
      </q-card-section>
      <q-card-section align="center"
        >{{ $t('PageElect.verification_device_disconnected') }}</q-card-section
      >
      <q-card-section align="center">
        <q-btn v-on:click="flowControl" :label="$t('PageElect.back_to_start')" />
      </q-card-section>
    </q-card>

    <!-- State: Audit failed -->
    <q-card v-else-if="state == STATES.AUDIT_FAILED" class="card-middle">
      <q-card-section align="center">
        <q-icon name="report_problem" size="100px" class="text-negative" />
      </q-card-section>
      <q-card-section align="center">
        {{ $t('PageElect.verification_failed') }}
        <br /> {{ $t('PageElect.manipulation_possibility') }}
        <br /> {{ $t('PageElect.vote_not_sent') }}
      </q-card-section>
      <q-card-section align="center">
        <q-btn v-on:click="flowControl(true)" :label="$t('PageElect.back_to_start')" />
      </q-card-section>
    </q-card>

    <q-card v-else-if="state == STATES.ERROR" class="card-middle">
      <q-card-section align="center">
        <q-icon name="warning" size="100px" color="negative" />
      </q-card-section>
      <q-card-section align="center">
        {{ $t('PageElect.general_error_condition') }}
        <br />
        <br />
        {{ $t('PageElect.error') }}
        <br />
        {{ $t('PageElect.send_developer_text') }}
        <br />
        {{ errorMessage }}
        <br />
        <br />
        {{ $t('PageElect.reload_and_retry') }}
      </q-card-section>
    </q-card>

    <!-- Footer Info for DemoMode -->
    <q-footer elevated class="bg-warning text-black" v-if="demoMode">
      <center>
        <q-toolbar>
          <q-toolbar-title>DEMO MODUS</q-toolbar-title>
          <q-btn
            :label="$t('PageElect.end_demo')"
            class="bg-secondary"
            icon="close"
            v-on:click="dialogConfirmExitDemo = true"
          ></q-btn>
        </q-toolbar>
        {{ $t('PageElect.demo_is_for_trying_out') }}
      </center>
    </q-footer>

    <!-- Confirmation dialog to leave Demo Mode -->
    <q-dialog v-model="dialogConfirmExitDemo">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="exit_to_app" color="primary" text-color="white" />
          <span class="q-ml-sm">
            {{ $t('PageElect.question_leave_demo') }}
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('PageElect.continue_demo')" color="primary" v-close-popup />
          <q-btn
            v-close-popup
            v-on:click="exitDemoMode"
            :label="$t('PageElect.leave')"
            color="primary"
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
// Vue Components
import { mapActions, mapGetters } from "vuex";
import ComponentLoadConfigFile from "components/PageElect/ComponentJsonFileLoader";
import ComponentShowQrCode from "components/PageElect/ComponentShowQrCode";
import ComponentAuditOrSubmit from "components/PageElect/ComponentAuditOrSubmit";
import ComponentBallot from "components/PageElect/ComponentBallot";
import ComponentTutorial from "components/PageElect/ComponentTutorial";
import ComponentEncryption from "components/PageElect/ComponentEncryption";

// Javascript Libraries
import CommunicationInterface from "components/CommunicationInterface";
import Encryptor from "components/Encryptor";
import Diagnose from "components/Diagnose";
import ControlState from "components/PageElect/ControlStateEnumeration";

// Extern Javascript Libraries
import axios from "axios";
import { date } from "quasar";
import CryptoJS from "crypto-js";

export default {
  name: "PageElect",
  data() {
    return {
      STATES: ControlState.ControlState, // neccessary to have ControlState reachable in the template part above
      showIntro: true, // Show intro popup message
      dialogConfirmExitDemo: false, // Show confirmation dialog for leaving the demo mode
      tutorialData: {
        showTutorial: false,
        dialog: true
      },
      state: ControlState.ControlState.START, // Current State
      comInterface: new CommunicationInterface(), // Communication Interface for Peer2Peer
      nonce: "", // Nonce for authenticated communication with VVD. It's transmitted via QRCode
      loadingTotal: 0, // For loading demonstration, max steps
      loadingCurrent: 0, // For loading demonstration current step
      errorMessage: "", // Error message to show when error accurs,
      demoModeOn: false,
      //isFirstVote: true,
      timesVoted: 0,
      timestamp: null
    };
  },
  components: {
    ComponentLoadConfigFile,
    ComponentShowQrCode,
    ComponentAuditOrSubmit,
    ComponentBallot,
    ComponentEncryption,
    ComponentTutorial
  },
  computed: {
    demoMode() {
      var nowOn = this.getDemoMode();
      if (this.demoModeOn == false && nowOn == true) {
        // Demo Mode has been enabled!
        this.reset();
      }
      this.demoModeOn = nowOn;
      return nowOn;
    },
    firstVisit() {
      return this.getFirstVisit();
    }
  },
  methods: {
    ...mapActions("storeConfig", [
      "setVvdSecurity",
      "clearStore",
      "setStep",
      "setDemoMode",
      "setFirstVisit"
    ]),
    ...mapGetters("storeConfig", [
      "getCommunication",
      "getElection",
      "getCandidates",
      "getDemoMode",
      "getFirstVisit",
      "getEvaluation"
    ]),

    /**
     * State control management.
     * Is executed at the end of a state at transition to next
     *
     * @param {Object} payload optional
     */
    flowControl(payload = {}) {
      switch (this.state) {
        case this.STATES.LOAD_FILE:
          // Pre: Select File
          // Post: File has been selected
          this.securityInit(); // Init variables for a secure connection
          this.startPeer(); // Start a local Peer
          this.state++;
          Diagnose.startTimer("Connecting Device");
          break;
        case this.STATES.START_PEER:
          // Pre: Peer has been started
          // Post: Peer is ready
          this.state++;
          break;
        case this.STATES.SHOW_QR_CODE:
          // Pre: Show QR-Code and wait for connection
          // Post: Device has been connected
          this.state++;
          break;
        case this.STATES.WAIT_FOR_NONCE:
          // Pre: Device has been connected; Wait for nonce
          // Post: Correct VVD connected
          // Payload: {object} {nonce: string}
          if (payload.nonce != null && payload.nonce == this.nonce) {
            // If nonce is correct
            this.state++;
          } else {
            this.errorMessage =
              this.$t('PageElect.wrong_device_no_authentification');
            this.state = this.STATES.ERROR;
          }
          Diagnose.endTimer();
          Diagnose.startTimer("Reading InfoBox");
          break;
        case this.STATES.VOTE:
          // User is voting
          // User has voted; Start computation
          this.state++;
          Diagnose.endTimer();
          Diagnose.startTimer("Encrypting");
          break;
        case this.STATES.COMPUTE_BALLOT_ENCRYPTION:
          // Pre: Computing
          // Post: Computation finished
          this.state++;
          Diagnose.endTimer();
          Diagnose.startTimer("Audit or submit");
          break;
        case this.STATES.CHOICE_AUDIT_OR_SUBMIT:
          // Pre: Show Audit/Submit option to user
          // Post: User clicked one of them
          Diagnose.endTimer();
          // Payload: {object} {audit: boolean, ballot: obj, bullet: obj, candidates: obj,
          //                    choices: Array, nonce: String, paillier: obj, voterId: String} (if audit == true)
          // Or: {object} {audit: boolean, bullet: obj} (if audit == false)
          if (payload.audit == true) {
            // Audit
            payload.nonce = this.nonce;
            this.comInterface.send(payload);
            this.state++;
            Diagnose.startTimer("Audit (in app)");
          } else {
            // Submit
            this.state = this.STATES.SUBMIT_WAIT_FOR_REPLY_FROM_AS;
            this.setStep("submit"); // Set step for tutorial
            this.submit(payload);
            Diagnose.submit(this.getElection().voterId);
          }
          break;
        case this.STATES.AUDIT:
          // Pre: Audit has been sent
          // Post: Audit has been received
          // Payload: {object} {audit: boolean, nonce: String}
          if (payload.audit != null && payload.audit == true) {
            this.$q.notify({
              type: "positive",
              position: "top",
              message: this.$t('PageElect.test_successful'),
              timeout: 8000
            });
            this.state = this.STATES.VOTE; // Go back to state: voting
            Diagnose.endTimer();
            Diagnose.startTimer("Reading InfoBox");
          } else {
            this.$q.notify({
              type: "negative",
              position: "top",
              message: this.$t('PageElect.test_failed')
            });
            this.state = this.STATES.AUDIT_FAILED; // Go to state: audit failed
            Diagnose.endTimer();
            Diagnose.submit(this.getElection().voterId);
          }
          break;
        case this.STATES.SUBMIT_WAIT_FOR_REPLY_FROM_AS:
          // Waiting for AS; No state control needed
          break;
        case this.STATES.SUBMIT_SUCCESSFUL:
          // Pre: Submit has been sent
          // Post: Go back to start
          this.reset();
          break;
        case this.STATES.VVD_DISCONNECTED:
          // Pre: VVD Disconnect, show gui
          // Post: Go back to start
          this.reset();
          break;
        case this.STATES.AUDIT_FAILED:
          // Pre: Audit failed
          // Post: Go to start
          this.reset();
          break;
        //DEPRECATED
        /*case this.STATES.USER_HAD_ALREADY_VOTED:
          // Pre: User has voted before
          // Post: Go to start
          this.reset();
          break;*/
      }
    },

    /**
     * Reset to starte (file load)
     * Disconnect from Peer and clear storage (especially choices of ballot, key and nonce)
     */
    reset() {
      this.comInterface.disconnect();
      this.clearStore();
      this.state = this.STATES.LOAD_FILE;
      Diagnose.reset();
    },

    /**
     * Emitted when Config file has been loaded
     *
     * @event
     */
    onFileLoaded() {
      this.flowControl();
    },

    /**
     * Generate and store key and nonce for communication with VVD
     */
    securityInit() {
      var payload = {
        key: Encryptor.randomGen(),
        nonce: Encryptor.randomGen()
      };
      this.nonce = payload.nonce;
      this.setVvdSecurity(payload); // store data in store
      this.comInterface.setKey(payload.key); // Tell communication interface what key to use
    },

    /**
     * Start local Peer
     */
    startPeer() {
      this.comInterface.startPeer(
        this.getCommunication().peerServerIP,
        this.callbackPeerReady,
        this.callbackVvdConnected,
        this.callbackConnectionClosed,
        this.callbackVvdMessageReceived
      );
    },

    /**
     * Called when Peer is ready
     *
     * @callback
     */
    callbackPeerReady() {
      this.flowControl();
    },

    /**
     * Called when VVD is connected.
     *
     * @callback
     */
    callbackVvdConnected() {
      this.flowControl();
    },

    /**
     * Called when connection (to VVD) is closed
     *
     * @callback
     */
    callbackConnectionClosed() {
      if (
        this.state != this.STATES.SUBMIT_SUCCESSFUL &&
        this.state != this.STATES.AUDIT_FAILED
        // DEPRECATED &&        this.state != this.STATES.USER_HAD_ALREADY_VOTED
      ) {
        // Only if not in a state like "submitted" because disconnect is intended there.
        this.$q.notify({
          type: "negative",
          position: "top",
          message: this.$t('PageElect.connection_to_device_disconnected')
        });
        this.state = this.STATES.VVD_DISCONNECTED; // Go to state: connection lost
      }
    },

    /**
     * Called when message from VVD received
     *
     * @callback
     * @param {Object} payload
     */
    callbackVvdMessageReceived(payload) {
      if (payload.nonce == this.nonce) {
        // Check is message is from correct VVD
        if (
          this.state == this.STATES.WAIT_FOR_NONCE ||
          this.state == this.STATES.AUDIT
        ) {
          // If state is "Waiting for nonce" or "Waiting for Auditresult"
          this.flowControl(payload);
        }
      }
    },

    /**
     *
     */
    disableFirstVisit() {
      this.setFirstVisit(false);
    },

    /**
     * Initiate Submit
     * Forward response to VVD
     */
    submit(payload) {
      if (this.getDemoMode()) {
        this.sendAckToVvd(payload, null, 0, null);
        this.state = this.STATES.SUBMIT_SUCCESSFUL;
      } else {
        this.sendSubmitToAs(payload);
      }
    },

    /**
     * Send submit to AS
     */
    sendSubmitToAs(payload) {

      axios({
        method: "POST",
	      url: this.getCommunication().authenticationServerIP + "/api/addBallot",
        headers: { "Content-Type": "application/json" },
        data: {
          "ballot": {
            "electionId": this.getElection().id,
            "voterId": this.getElection().voterId,
            "secret": this.getElection().secret,
            "bullet": payload.bullet
          }
        }
      	})
        .then(response => {
          if (response.data.errorcode == 0) {
          //if (response.data.ack != null) {
            // If ack received

            /* TODO Check if ACK is correct */

            this.state = this.STATES.SUBMIT_SUCCESSFUL;
            //this.isFirstVote = response.data.firstTime
            this.timesVoted = response.data.timesVoted
            //if (response.data.firstTime == true)
              //this.state = this.STATES.SUBMIT_SUCCESSFUL;
              //this.isFirstVote = true
            // If user has voted for the first time
            //else
              //this.isFirstVote = false
              //this.state = this.STATES.USER_HAD_ALREADY_VOTED;
            // Else user has voted/submitted at some point before

            // Send ACK to VVD
            this.sendAckToVvd(
              payload,
              response.data.ack,
              response.data.timesVoted,
              response.data.timestamp
            );
          } else {
            // Something went wrong on AS. Goto error state
            this.state = this.STATES.ERROR;
            // If there is gonne be more different errors, we might need a switch case here.
            // For now:
            // -10 = Date of ballot was not send during the time interval of the election
            // -20 = The user is rejected, because his hash secret is not on the BB
            if (response.data.errorcode == -10) {
              this.errorMessage =
              this.$t('PageElect.vote_outside_polling_place');
            } else {
              this.errorMessage =
              this.$t('PageElect.not_eligible_to_vote');
            }

          }
        })
        .catch(error => {
          // Something went wrong. Goto error state
          this.state = this.STATES.ERROR;
          this.errorMessage = error.message;
        });
    },

    /**
     * Send Ack to VVD
     * The payload contains not only the ACK but also all the other information about the election
     */
    sendAckToVvd(payload, ack, timesVoted, timestamp) {
      payload.nonce = this.nonce; // Set nonce for authentication
      payload.election = {
        ack: ack, // Ack it self
        bulletinBoardServerIP: this.getCommunication().bulletinBoardServerIP, // IP of bulletin Board
        id: this.getElection().id, // Election ID
        voterId: this.getElection().voterId, // Voter ID
        title: this.getElection().title, // Title of the vote
        bullet: payload.bullet, // bullet containing choices and random numbers
        candidates: this.getCandidates(), // Candidates for result demonstration
        hash: this.hash(this.getElection().secret),
        start: this.getElection().start,
        due: this.getElection().due, // Time when result should be published (for notification)
        demo: this.getDemoMode(),
        timesVoted: timesVoted,
        dates: [],             //List of the dates on which the user voted
        timestamp: timestamp,
        evaluation: this.getEvaluation(),
      };
      payload.timesVoted = timesVoted; // If user has voted before (So VVD checks for that)
      delete payload.bullet; // Remove parameter from ealier
      this.comInterface.send(payload); // Send submit to VVD
    },

    hash(secret) {
      return CryptoJS.SHA512(CryptoJS.enc.Hex.parse(secret)).toString(CryptoJS.enc.Hex);
    },

    /**
     * Emitted when user has finished his ballot
     * @event
     */
    onVoted() {
      this.flowControl();
    },

    /**
     * Emitted when Audit has been chosen
     * @event
     */
    onAudit(payload) {
      this.flowControl(payload);
    },

    /**
     * Emitted when Submit has been chosen
     * @event
     */
    onSubmit(payload) {
      this.flowControl(payload);
    },

    /**
     * Close the PopUp Intro Box (Welcome message)
     */
    closeIntro() {
      this.tutorialData.dialog = false;
    },

    /**
     * Show the tutorial
     */
    showTutorial() {
      this.tutorialData.showTutorial = true;
      this.showIntro = false;
    },

    /**
     * Parse Due Date of the Election
     *
     * @return {String} Date
     */
    getDueDate() {
      return date.formatDate(this.getElection().due, "HH:mm DD.MM.YYYY");
    },

    /**
     * Exit the Demo Mode. This will reset the Application
     */
    exitDemoMode() {
      this.setDemoMode(false);
      this.reset();
    }
  }
};
</script>
