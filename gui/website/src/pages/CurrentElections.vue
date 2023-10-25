<template>
  <div>
    <q-btn class="q-mt-md q-ml-md" :label="$t('ComponentCurrentElections.clear_configs')" color="grey" @click="clearBallotForms()"/>
    <div class="q-ma-sm row items-center q-gutter-sm">
      <q-card class="col-md-auto">
        <q-card-section>
          {{ $t('ComponentCurrentElections.bb_server') }}
        </q-card-section>
      </q-card>
      <q-card class="col-md-auto" v-for="(ids, bb_server) in getBulletinBoardsDict()" :key="ids">
        <q-card-section>
          {{ bb_server }}, <b>IDs:</b> {{ ids }}
        </q-card-section>
      </q-card>
    </div>
    <q-page class="flex flex-center">
      <div>
        <div class="text-h7 row justify-end items-center">
          <div class="col-md-auto">{{ $t('ComponentCurrentElections.load_election_template') }}
          </div>
          <div class="col-md-auto">
            <q-btn class="q-ma-sm" round color="indigo" icon="add"/>
          </div>
          <q-popup-edit auto-save>
            <q-file
            accept=".json"
            max-total-size="4096000"
            v-model="saveForm.file"
            @update:model-value="loadElectionTemplate"
            @rejected="onFileRejected"
            outlined
            bottom-slots
            :label="$t('ComponentSave.upload')"
            counter
            style="padding-bottom: 4em"
            >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" @click.stop />
            </template>
            <template v-slot:append>
              <q-icon
              name="close"
              @click.stop="saveForm.file = null"
              class="cursor-pointer"
              />
            </template>
            <template v-slot:hint>
              {{ $t("ComponentSave.uploadhint") }}
            </template>
          </q-file>
          <q-btn class="q-mb-sm" color="grey" @click="addLoadedElectionTemplate()" icon="add" v-close-popup/>
        </q-popup-edit>
      </div>
      <div class="row justify-end items-center">
        <div class="text-h7 col-md-auto">{{ $t('ComponentCurrentElections.bb_server') }}</div>
        <div class="col-md-auto">
          <q-btn class="q-ma-sm" round color="blue" icon="add"/>
        </div>
        <q-popup-edit auto-save>
          <q-input v-model="bulletinBoardToAdd" dense autofocus counter @keyup.enter="addCurrentElection()" prefix="https://" :label="$t('ComponentCurrentElections.bb_server')"/>
          <q-input v-model.number="bulletinBoardIdToAdd" dense autofocus counter @keyup.enter="addCurrentElection()" type="number" :label="$t('ComponentCurrentElections.board_id')"/>
        </q-popup-edit>
      </div>
    </div>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card v-for="(ballotForm, index) in getBallotFormsSlice" @click="openElectionOverview(index)" :key="index">
        <q-card-section>
          <q-icon v-if="electionTerminated(ballotForm.election_settings.election.due)" :name="roundDoneAll" class="float-right"/>
          <q-icon v-else :name="roundSchedule" class="float-right"/>
          <div v-if="ballotForm.template != null" class="text-h7">{{ $t('ComponentCurrentElections.template') }}</div>
          <div class="text-h6">{{ ballotForm.election_settings.election.title }}</div>
          <div class="text-subtitle2">ID: {{ ballotForm.election_settings.election.id }}</div>
          <div class="text-subtitle2">{{ $t('ComponentCurrentElections.bb_server') }}:
            <div><i>{{ ballotForm.election_settings.communication.bulletinBoardServerIP }}</i></div>
          </div>
          <div class="text-subtitle2">{{ $t('ComponentCurrentElections.start') }}{{formatDateToDisplayMask(ballotForm.election_settings.election.start) }}</div>
          <div class="text-subtitle2">{{ $t('ComponentCurrentElections.due') }}{{ formatDateToDisplayMask(ballotForm.election_settings.election.due) }}</div>
        </q-card-section>

        <q-separator />
      </q-card>

      <q-dialog v-model="verifyElectionDeletion" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-icon :name="roundDelete" size="2em"/>
            <span class="q-ml-sm">{{ $t('ComponentCurrentElections.delete_confirmation') }}</span>
          </q-card-section>

          <q-card-actions align="around">
            <q-btn flat :label="$t('ComponentCurrentElections.cancel')" color="primary" v-close-popup />
            <q-btn flat :label="$t('ComponentCurrentElections.delete')" color="red" @click="deleteCurrentElection()" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="electionOverview">
        <q-card class="election-card">
          <q-card-section>
            <div class="text-h6">{{ ballotForms[currentElectionIndex].election_settings.election.title }}</div>
          </q-card-section>

          <q-card-section>
            <q-icon v-if="electionTerminated(ballotForms[currentElectionIndex].election_settings.election.due)" :name="roundDoneAll" class="float-right" size="3em"/>
            <q-icon v-else :name="roundSchedule" class="float-right" size="3em"/>
            <div class="text-subtitle2">ID: {{ ballotForms[currentElectionIndex].election_settings.election.id }}</div>
            <div class="text-subtitle2">{{ $t('ComponentCurrentElections.bb_server') }}:
              <div><i>{{ ballotForms[currentElectionIndex].election_settings.communication.bulletinBoardServerIP }}</i></div>
            </div>
            <div class="text-subtitle2">{{ $t('ComponentCurrentElections.start') }}{{ formatDateToDisplayMask(ballotForms[currentElectionIndex].election_settings.election.start) }}</div>
            <div class="text-subtitle2">{{ $t('ComponentCurrentElections.due') }}{{ formatDateToDisplayMask(ballotForms[currentElectionIndex].election_settings.election.due) }}</div>
            <div v-if="electionTerminated(ballotForms[currentElectionIndex].election_settings.election.due)" class="text-subtitle2">{{ $t('ComponentCurrentElections.status') }}{{ $t('ComponentCurrentElections.done') }}</div>
            <div v-else class="text-subtitle2">{{ $t('ComponentCurrentElections.status') }}{{ $t('ComponentCurrentElections.in_progress') }}</div>
          </q-card-section>

          <q-card-section class="row justify-between">
            <div class="col-md-auto">
              <q-btn
              :icon="roundContentCopy"
              :label="$t('ComponentCurrentElections.duplicate')"
              @click="duplicateCurrentElection()"
              />
            </div>
            <div class="col-md-auto">
              <q-btn
              :icon="roundFileDownload"
              :label="$t('ComponentSave.download')"
              @click="downloadCurrentElection()"
              />
            </div>
            <div class="col-auto">
              <q-btn
              :icon="roundDelete"
              :label="$t('ComponentCurrentElections.delete')"
              color="red"
              @click="verifyElectionDeletion = true"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="row justify-between" v-if="ballotForms[currentElectionIndex].template == null">
            <div class="col-md-auto">
              <q-btn
              :icon="roundArrowCircleRight"
              :label="$t('ComponentForm.evaluation')"
              @click="triggerEvaluation()"
              />
            </div>
          </q-card-section>

          <q-card-section>
            <q-btn
            round
            flat
            dense
            :icon="expandedElectionDetails ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
            label="Creation parameters"
            @click="expandedElectionDetails = !expandedElectionDetails"
            />

            <div v-show="expandedElectionDetails">
              <q-separator />
              <ElectionForm
              :ballot_form="ballotForms[currentElectionIndex].election_settings"
              :extra_options="ballotForms[currentElectionIndex].extra_options"
              />
            </div>
          </q-card-section>

          <q-card-section>
            <q-btn
            round
            flat
            dense
            :icon="expandedQRCodes ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
            label="QR codes"
            @click="expandedQRCodes = !expandedQRCodes"
            />

            <div v-show="expandedQRCodes">
              <q-separator />
              <q-card-section>
                TODO: Put generated QR codes here.
              </q-card-section>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />

          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <div class="q-pa-lg flex flex-center">
      <q-pagination
      v-model="currentPage"
      :min="1"
      :max="getMaxPage"
      input
      />
    </div>
  </q-page>
</div>
</template>
<style scoped>
  .election-card {
    max-width: 1000px;
    padding: 20px;
    margin-top: 20px;
  }
</style>

<script>
  import axios from "axios";
  import { mapActions, mapGetters } from "vuex";
  import { date } from "quasar";
  import { roundSchedule, roundDoneAll, roundFileDownload, roundContentCopy, roundArrowCircleRight, roundDelete } from '@quasar/extras/material-icons-round';
  import ElectionForm from "../components/PageCreateElection/ComponentForm";
  import { ref } from 'vue';
  import allConfigs from "../../../../examples/configs/TestConfig.json"
  import _ from "lodash";

  const reader = new FileReader();

// Vue Components

// Javascript Libraries

// Extern Javascript Libraries

export default {
  name: "CurrentElections",
  components: {
    ElectionForm
  },
  data() {
    return {
      electionOverview: ref(false),
      expandedElectionDetails: ref(false),
      expandedQRCodes: ref(false),
      verifyElectionDeletion: ref(false),
      currentPage: ref(1),
      totalItemsPerPage: ref(5),
      bulletinBoardToAdd: "",
      bulletinBoardIdToAdd: 0,
      displayMask: "HH:mm     DD.MM.YYYY",
      storeMask: "YYYY-MM-DDTHH:mm:ssZ",
      ballotForms: Object.values(allConfigs),
      currentElectionIndex: 0,
      saveForm: {
        file: null,
        json: {},
      },
      defaultBallotForm: {
        election_settings: {
          candidates: [],
          ballot: {
            category: "Checkbox",
            settings: {
              minNumberOfChoices: null,
              maxNumberOfChoices: null,
              numberOfEqualRanks: null,
              numberOfCountingRanks: null,
              pointDistribution: [],
              points: null,
              allowDraw: false,
              spreadPointsAcross: false,
            }
          },
          election: {
          id: null, // this will be set in backend
          title: "",
          start: null,
          due: null,
          numberOfVoters: null,
        },
        communication: {
          peerServerIP: "https://localhost:9000",
          authenticationServerIP: "https://localhost:9001",
          bulletinBoardServerIP: "https://localhost:9002",
        },
        encryption: {
          ABB: "PaillierABB",
          protocolSuite: "SubLinearProtocolSuite",
          bits: 2048,
          numberShares: 2,
          threshold: 2,
        },
        evaluation: {
          type: "Borda",
          settings: {
            // for borda
            numWinners: 1,
            listOfWinnerPoints: [1],
            pointLimit: 0,
            // for condorcet
            evaluate_condorcet: true,
            additional_evaluators: [],
            leak_better_half: false,
            smith_leak_min_copeland: false,
            leak_min_copeland: false,
            leak_max_points: false,
            // for parliamentary
            n_seats: 0,
            clause: 0,
            secret_residual: false,
            //for instant runoff
            systemID: 0,
            bitsInt: 64
          }
        },
      },
      extra_options: {
        peerOptions: ["https://localhost:9000"],
        authenticationOptions: ["https://localhost:9001"],
        bulletinboardOptions: ["https://localhost:9002"],
        filterPeerOptions: ["https://localhost:9000"],
        filterAuthenticationOptions: ["https://localhost:9001"],
        filterBulletinBoardOptions: ["https://localhost:9002"],
      },
    },
  };
},
created () {
  this.roundSchedule = roundSchedule;
  this.roundDoneAll = roundDoneAll;
  this.roundFileDownload = roundFileDownload;
  this.roundContentCopy = roundContentCopy;
  this.roundDelete = roundDelete;
  this.roundArrowCircleRight = roundArrowCircleRight;
  this.collectBallotForms();
},
computed: {
  getBallotFormsSlice() {
    return this.ballotForms.slice((this.currentPage-1) * this.totalItemsPerPage, (this.currentPage-1) * this.totalItemsPerPage + this.totalItemsPerPage)
  },

  getMaxPage() {
    let max = Math.ceil(this.ballotForms.length / this.totalItemsPerPage);
    if (max > 0) {
      return max;
    }
    return 1;
  }
},
methods: {
  ...mapActions("storeConfig", [
    "addBulletinBoard",
    "deleteBulletinBoard",
    "clearBulletinBoards",
    "addElectionTemplate",
    "deleteElectionTemplate",
    "clearElectionTemplates"
    ]),
  ...mapGetters("storeConfig", [
    "getBulletinBoards",
    "getElectionTemplates"
    ]),

    /**
     * Opens election overview.
     */
     openElectionOverview(electionIndex) {
      if (this.ballotForms.length - 1 >= electionIndex) {
        this.electionOverview = true;
        this.currentElectionIndex = electionIndex;
      }
      else {
        this.$q.notify({
          type: "negative",
          message: this.$t('ComponentCurrentElections.bulletin_board_error'),
        });
      }
    },

    formatDateToDisplayMask(storeMaskDate) {
      return date.formatDate(storeMaskDate, this.displayMask);
    },

    electionTerminated(dueDate) {
      if (date.isBetweenDates(dueDate, new Date(0, 0, 0), Date.now())) {
        return true;
      }
      return false;
    },

    // Duplicates currently opened election to template.
    duplicateCurrentElection() {
      var currentBallot = this.ballotForms[this.currentElectionIndex];
      this.addElectionTemplate(currentBallot);
      this.collectBallotForms();
    },

    // Downloads currently opened election config.
    downloadCurrentElection() {
      var currentBallot = this.ballotForms[this.currentElectionIndex];

      var saveObj = {
        election_settings: currentBallot.election_settings,
        extra_options: currentBallot.election_settings,
      };

      var saveForm = {};
      saveForm[currentBallot.election_settings.election.title] = JSON.parse(JSON.stringify(saveObj));

      var a = document.createElement("a");
      var file = new Blob([JSON.stringify(saveForm)], {
        type: "application/json",
      });
      a.href = URL.createObjectURL(file);
      a.download = currentBallot.election_settings.election.title + ".json";
      a.click();
    },

    // Loads election template from config file.
    loadElectionTemplate() {
      reader.onload = e => {
        var result = JSON.parse(e.target.result);
        this.saveForm.json = Object.values(result)[0];
      }
      reader.readAsText(this.saveForm.file); // Read file
    },

    // When config file gets rejected by file picker notify user.
    onFileRejected(rejectedEntries) {
      this.$q.notify({
        type: "negative",
        message: this.$t('ComponentCurrentElections.file_upload_unsuccessful') + this.$t('ComponentSave.upload_hint'),
      });
    },

    // Adds template if .json file was correctly loaded.
    // TODO: More detailed check if .json datatype is correct.
    addLoadedElectionTemplate() {
      if (this.saveForm.json != null) {
        if (this.saveForm.json["election_settings"]["election"]["title"] != null) {
          this.addElectionTemplate(this.saveForm.json);
          this.collectBallotForms();
        }
        else {
          this.$q.notify({
            type: "negative",
            message: this.$t('ComponentCurrentElections.template_datatype_error'),
          });
        }        
      }
      else {
        this.$q.notify({
          type: "negative",
          message: this.$t('ComponentCurrentElections.no_template_uploaded'),
        });
      }
    },

    // Deletes currently opened election or election template from persistent store and closes election overview.
    deleteCurrentElection() {
      var currentBallot = this.ballotForms[this.currentElectionIndex];
      if (currentBallot.template != null) {
        this.deleteElectionTemplate(currentBallot);
      }
      else {
        this.deleteBulletinBoard([currentBallot.election_settings.communication.bulletinBoardServerIP, currentBallot.election_settings.election.id]);
      }
      this.electionOverview = false;
      this.currentElectionIndex = 0;
      this.collectBallotForms();
    },

    // Checks if bulletin board is available and adds it to persistent store if so.
    addCurrentElection() {
      axios.get(
        "https://" + this.bulletinBoardToAdd +
        "/api/getConfig?board_id=" + this.bulletinBoardIdToAdd
        )
      .then((response) => {
       this.$q.notify({
        color: "green-4",
        textColor: "white",
        icon: "cloud_done",
        position: "top",
        message: this.$t('ComponentCurrentElections.bulletin_board_is_reachable'),
      });
       this.addBulletinBoard(["https://" + this.bulletinBoardToAdd, this.bulletinBoardIdToAdd]);
       this.collectBallotForms();
     })
      .catch((error) => {
       this.$q.notify({
        type: "negative",
        position: "top",
        message: this.$t('ComponentCurrentElections.bulletin_board_error'),
      });
     });
    },

    // Queries a bulletin board by an id from a bulletin board server.
    queryBulletinBoard(bulletinBoard, boardId) {
      axios
      .get(
        bulletinBoard +
        "/api/getConfig?board_id=" + boardId
        )
      .then((response) => {
          // The extra_options are not contained in BB response, so it is readded as a quick fix.
          var additionalBulletinBoard = {
            election_settings: response.data,
            extra_options: {
              peerOptions: ["https://localhost:9000"],
              authenticationOptions: ["https://localhost:9001"],
              bulletinboardOptions: ["https://localhost:9002"],
              filterPeerOptions: ["https://localhost:9000"],
              filterAuthenticationOptions: ["https://localhost:9001"],
              filterBulletinBoardOptions: ["https://localhost:9002"],
            }
          };
          var mergedAdditionalBulletinBoard = this.mergeWithDefaultBallotForm(additionalBulletinBoard);
          this.ballotForms.push(mergedAdditionalBulletinBoard);
        })
      .catch((error) => {
        this.$q.notify({
          type: "negative",
          position: "top",
          message: this.$t('ComponentCurrentElections.bulletin_board_error') + " (" + bulletinBoard + ", " + boardId + ")",
          actions: [
          {
            label: this.$t('ComponentCurrentElections.delete') + " " + this.$t('ComponentCurrentElections.bb_server'), color: 'white', handler: () => { 
              this.deleteBulletinBoard([bulletinBoard, boardId]);
            }
          }
          ]
        });
      });
    },

    // Summarizes bulletin board servers and IDs.
    getBulletinBoardsDict() {
      let bulletinBoards = JSON.parse(JSON.stringify(this.getBulletinBoards()));
      let bulletinBoardsDict = {};
      while (bulletinBoards.length > 0) {
        let bulletinBoard = bulletinBoards.shift();
        bulletinBoardsDict[bulletinBoard[0]] = [bulletinBoard[1]];
        bulletinBoards = bulletinBoards.filter((element) => {
          if (element[0] == bulletinBoard[0]) {
            bulletinBoardsDict[element[0]].push(element[1]);
          }
          return element[0] != bulletinBoard[0];
        });
      }
      return bulletinBoardsDict;
    },

    // Refetches all election ballot forms from bulletin baord servers and store templates.
    collectBallotForms() {
      this.ballotForms = [];
      this.getBulletinBoards().forEach((element) => {
        var localElement = JSON.parse(JSON.stringify(element));
        this.queryBulletinBoard(localElement[0], localElement[1]);
      });
      this.getElectionTemplates().forEach((element) => {
        var localElement = JSON.parse(JSON.stringify(element));
        var mergedLocalElement = this.mergeWithDefaultBallotForm(localElement);
        mergedLocalElement.template = true;
        this.ballotForms.push(mergedLocalElement)
      });
    },

    // Merges queried ballot form or template with default ballot form to enable editable null fields in the interface.
    mergeWithDefaultBallotForm(element) {
      var element = JSON.parse(JSON.stringify(element));
      var localElement = JSON.parse(JSON.stringify(this.defaultBallotForm));
      var mergedLocalElement = _.merge(localElement, element);
      return mergedLocalElement;
    },

    // Clears all ballot form store artifacts and reloads overview.
    clearBallotForms() {
      this.clearBulletinBoards();
      this.clearElectionTemplates();
      this.collectBallotForms();
    },

    // Triggers evaluation of current election.
    triggerEvaluation() {
      this.loading = true;
      var currentBallot = this.ballotForms[this.currentElectionIndex];
      axios
      .post(
        currentBallot.election_settings.communication.authenticationServerIP +
        "/api/triggerEvaluation",
        {}
        )
      .then((res) => {
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "top",
          message: "Evaluation erfolgreich durchgeführt.",
        });
      })
      .catch((error) => {
        this.$q.notify({
          type: "negative",
          position: "top",
          message: "Fehler bei Evaluation",
        });
      })
      .finally(() => {
        this.loading = false;
      });
    },
  }    
};
</script>
