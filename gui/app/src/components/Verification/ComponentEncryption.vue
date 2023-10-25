<template>
  <q-card class="card-middle">
    <q-card-section class="bg-accent">
      {{ $t('ComponentEncryption.verify_encryption') }}
    </q-card-section>

    <q-card-section align="center">
      <q-icon
        v-if="!done"
        name="verified_user"
        size="100px"
        class="text-grey"
      />
      <q-icon v-else name="verified_user" size="100px" class="text-positive" />
    </q-card-section>

    <q-separator />

    <q-card-section>
      {{ $t('ComponentEncryption.check_correctness') }}
      {{ $t('ComponentEncryption.may_take_a_few_seconds') }}i
      <br />
      <br />
      {{ $t('ComponentEncryption.already_checked') }}
      {{ (this.loadingCurrent / this.loadingTotal).toFixed(1) * 100 }} %<br />
    </q-card-section>

    <q-card-section>
      <center>
        <q-spinner-grid v-if="!done" color="primary" size="100px" class="" />
        <q-btn
          v-else
          v-on:click="$emit('done', { audit: result })"
          size="xl"
          color="positive"
          >{{ $t('ComponentEncryption.continue') }}</q-btn
        >
      </center>
    </q-card-section>

    <q-separator />
  </q-card>
</template>
<script>
import { mapGetters } from "vuex";
import ComputationWorker from "components/Verification/ChoicesHandler.worker.js";
import TrashValuesComputationWorker from "components/Verification/TrashValuesHandler.worker.js";
import ProofSumComputationWorker from "components/Verification/ProofSumHandler.worker.js";

import Diagnose from "components/Diagnose";

// import Paillier from "components/Paillier";
export default {
  name: "ComponentInfoBox",
  data() {
    return {
      loadingCurrent: 0, // Current steps in encryption (for gui)
      loadingCurrentTrashWorker: 0,
      loadingTotal: 0, // Total steps in encryption (for gui)
      done: false,
      doneTrashWorker: false,
      resultChoices: null,
      result: true,
      emit: false
    };
  },
  created() {
    // Reset numbers of loading animation
    this.loadingCurrent = 0;
    this.loadingTotal = 0;
    this.done = false;
    //TODO: Uncaught (in promise) TypeError: Cannot read properties of null (reading 'allowRecurse')
    //TODO: $forceUpdate() is not available in setup anymore (because of upgrade to vue3), do we really need it? (was not able to find a workaround)
    //this.$forceUpdate();
    this.startAudit();
  },
  emits: [
    "done"
  ],
  methods: {
    ...mapGetters("storeConfig", [
      "getChoices",
      "getPaillier",
      "getBullet",
      "getVoterId",
      "getVoterSecret",
      "getBallot",
      "getSecretRandomNumbers",
      "getPlainTrashValues",
      "getCandidates"
    ]),

    /**
     * Start Audit.
     * Recompute Paillier to check correctness
     *
     * @return {boolean}
     */
    startAudit() {
      var choices = this.getChoices();
      var paillier = this.getPaillier();
      var bullet = this.getBullet();
      var voterId = this.getVoterId();
      var voterSecret = this.getVoterSecret();
      var plainTrashValues = this.getPlainTrashValues();
      var ballot = this.getBallot();
      var candidates = this.getCandidates();
      var secretRandomNumbers = this.getSecretRandomNumbers();
      this.loadingTotal =
        choices.length + bullet.trashValues.ciphers.length + 1;

      var category = this.getBallot().category;
      // TODO (ZKP for other election modes)
      if (category != "Checkbox") {
        this.loadingTotal = choices.length;
      }

      var workerCount = 4;

      var data = {
        choices: choices,
        paillier: paillier,
        bullet: bullet,
        secretRandomNumbers: secretRandomNumbers,
        voterId: voterId,
        voterSecret: voterSecret,
        ballot: ballot,
        candidates: candidates,
        start: -1,
        end: -1,
        id: -1,
        category: this.getBallot().category,
        plainTrashValues: plainTrashValues
      };
      var step = (choices.length / workerCount) | 0;

      /**
       * Trash value worker
       */
      // TODO (ZKP for other election modes)
      if (category == "Checkbox") {
        var trashWorker = new TrashValuesComputationWorker();
        trashWorker.onmessage = ({ data }) => {
          if (data.done) {
            if (!data.result && !this.emit) {
              // event false
              this.result = false;
              this.emit = true;
              this.$emit("done", { audit: this.result });
            }

            if (this.loadingCurrent == this.loadingTotal) {
              this.done = true;
              Diagnose.endTimer();
              Diagnose.startTimer("Continue from Encryption mask");
            }
          } else if (!data.done) {
            this.loadingCurrent++;
          }
        };
        trashWorker.postMessage(JSON.stringify(data));
      }

      /**
       * Proof sum
       */
      // TODO (ZKP for other election modes)
      if (category == "Checkbox") {
        var proofSumWorker = new ProofSumComputationWorker();
        proofSumWorker.onmessage = ({ data }) => {
          if (data.done) {
            this.loadingCurrent++;
            if (!data.result && !this.emit) {
              this.result = false;
              this.emit = true;
              this.$emit("done", { audit: this.result });
            }

            if (this.loadingCurrent == this.loadingTotal) {
              this.done = true;
              Diagnose.endTimer();
              Diagnose.startTimer("Continue from Encryption mask");
            }
          }
        };
        proofSumWorker.postMessage(JSON.stringify(data));
      }

      var workers = new Array(workerCount);
      for (var i = 0; i < workerCount; i++) {
        workers[i] = new ComputationWorker();
        data.id = i;
        workers[i].onmessage = ({ data }) => {
          if (data.done) {
            if (!data.result && !this.emit) {
              this.result = false;
              this.emit = true;
              this.$emit("done", { audit: this.result });
            }

            if (this.loadingCurrent == this.loadingTotal) {
              this.done = true;
              Diagnose.endTimer();
              Diagnose.startTimer("Continue from Encryption mask");
            }
          } else if (!data.done) {
            this.loadingCurrent++;
          }
        };

        data.start = i * step;
        data.end = data.start + step;
        if (i == workerCount - 1) {
          data.end = choices.length;
        }
        workers[i].postMessage(JSON.stringify(data));
      }
    }
  }
};
</script>
