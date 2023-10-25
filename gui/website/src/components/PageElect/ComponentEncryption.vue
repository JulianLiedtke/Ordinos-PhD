<template>
  <q-card class="card-middle">
    <q-card-section class="bg-accent">
      {{ $t('ComponentEncryption.calculate_encryption')}}
    </q-card-section>

    <q-card-section align="center">
      <q-icon
        v-if="!allDone"
        name="lock_open"
        class="text-negative"
        size="100px"
      />
      <q-icon v-else name="lock" size="100px" class="text-positive" />
    </q-card-section>

    <q-separator />

    <q-card-section>
      {{ $t('ComponentEncryption.ballot_will_be_encrypted')}}
      <br />
      <br />
      {{ $t('ComponentEncryption.already_encrypted')}}
      {{ (this.loadingCurrent / this.loadingTotal).toFixed(1) * 100 }} %<br />
    </q-card-section>

    <q-card-section>
      <center>
        <q-spinner-grid v-if="!allDone" color="primary" size="100px" />
        <q-icon v-else name="done" size="100px" />
      </center>
    </q-card-section>

    <q-separator />

    <q-card-section align="right">
      <q-btn
        v-bind:disable="!allDone"
        v-on:click="$emit('done')"
        size="xl"
        v-bind:color="allDone ? 'positive' : 'negative'"
        > {{ $t('ComponentEncryption.continue') }} </q-btn
      >
    </q-card-section>
  </q-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

import ComputationWorker from "components/PageElect/Workers/ChoicesHandler.worker.js";
import TrashValuesComputationWorker from "components/PageElect/Workers/TrashValuesHandler.worker.js";
import ProofSumComputationWorker from "components/PageElect/Workers/ProofSumHandler.worker.js";
import { SafePrimes } from "components/ZKP/SafePrimes";
import PedersenVectorCommitmentGenerator from "components/ZKP/PedersenVectorCommitmentGenerator";
import Diagnose from "components/Diagnose";

export default {
  name: "ComponentEncryption",

  data() {
    return {
      loadingCurrent: 0,
      loadingTotal: 0,
      bulletComputationDone: false, // Flag if encryption is bulletComputationDone or not,
      trashValuesComputationDone: false, // Flag if encryption is trashValuesComputationDone or not,
      allDone: false,
      bullet: {},
    };
  },

  created() {
    // Reset numbers of loading animation
    this.loadingCurrent = 0;
    this.loadingTotal = 0;
    this.bulletComputationDone = false;
    this.computeBullet();
  },

  emits: ["done"],

  methods: {
    ...mapActions("storeConfig", [
      "setBulletSecretRandomNumbers",
      "setTrashSecretRandomNumbers",
      "setProofOfSumSecretRandomNumbers",
      "setBullet",
      "setPlainTrashValues",
    ]),

    ...mapGetters("storeConfig", [
      "getElection",
      "getBallot",
      "getPaillier",
      "getSecretRandomNumbers",
      "getBullet",
      "getChoices",
      "getCandidates",
      "getEvaluation"
    ]),

    /**
     * Compute the bullet based on the voters choice
     */
    computeBullet() {
      // Setup numbers for loading information
      var minVotes, maxVotes;
      var category = this.getBallot().category;

      // TODO (ZKP for other election modes)
      if (category == "Checkbox") {
        minVotes = this.getBallot().settings.minNumberOfChoices;
        maxVotes = this.getBallot().settings.maxNumberOfChoices;
        var numberOfTrashValues = maxVotes - minVotes;

        this.loadingTotal = this.getChoices().length + numberOfTrashValues + 1;
      } else {
        // Other election variants are not supported for zkp!
        this.loadingTotal = this.getChoices().length;
      }

      /**
       * Choices (of user input)
       */
      const bulletWorker = new ComputationWorker(); // Create new Worker
      bulletWorker.onmessage = ({ data }) => {
        if (data.done == true) {
          // Computation is bulletComputationDone
          this.workerFinished(data);
        } else {
          // Progress-Step

          this.loadingCurrent++;
        }
      };

      var commitments = {};
      if(category === "Ranking" || category === "Rating") {
        var safePrimes = new SafePrimes(1024); //TODO: figure out a good size
        var p = safePrimes.getP();
        var q = safePrimes.getQ();
        var numberOfCandidates = this.getCandidates().length;

        var {g, h} = PedersenVectorCommitmentGenerator.generateVectorCommitmentParameters(p, q, numberOfCandidates);
        var pedersenVectorCommitment = {p: p, q: q, g: g, h: h};
        var {g, h} = PedersenVectorCommitmentGenerator.generateVectorCommitmentParameters(p, q, numberOfCandidates - 1);
        var pedersenVectorCommitmentPermutationArgument = {p: p, q: q, g: g, h: h};
        commitments = {pedersenVectorCommitment, pedersenVectorCommitmentPermutationArgument};
      }
      var data = {
        choices: this.getChoices(),
        paillier: this.getPaillier(),
        voterSecret: this.getElection().secret,
        category: this.getBallot().category,
        ballot: this.getBallot(),
        numberOfCandidates: this.getCandidates().length,
        commitments : commitments,
        evaluation : this.getEvaluation()
      };
      bulletWorker.postMessage(JSON.stringify(data)); // Start Worker

      /**
       * Trash Values
       */
      // TODO (ZKP for other election modes)
      if (category == "Checkbox") {
        const trashValuesWorker = new TrashValuesComputationWorker(); // Create new Worker
        trashValuesWorker.onmessage = ({ data }) => {
          if (data.done == true) {
            // Computation is bulletComputationDone
            this.workerFinished(data);
          } else {
            // Progress-Step
            this.loadingCurrent++;
          }
        };
        data.minVotes = minVotes;
        data.maxVotes = maxVotes;
        trashValuesWorker.postMessage(JSON.stringify(data)); // Start Worker
      }
    },

    /**
     * Called whenever a worker finished.
     * - Worker for bullet choices
     * - Worker for trash values
     * Start another worker for computing the proof for the sum
     *
     * @param {Object} payload
     */
    workerFinished(payload) {
      var category = this.getBallot().category;

      // Bullet choices worker finished
      if (payload.worker == "bullet") {
        this.bulletComputationDone = true;
        this.setBulletSecretRandomNumbers(payload.secretRandomNumbers);
        this.bullet.choices = payload.bullet.choices;
        this.bullet.proofs = payload.bullet.proofs;

        // TODO (ZKP for other election modes)
        if (category != "Checkbox") {
          this.trashValuesComputationDone = true;
        }
      }
      // Trash value worker finished
      else {
        this.trashValuesComputationDone = true;
        this.setTrashSecretRandomNumbers(payload.secretRandomNumbers);
        this.bullet.trashValues = payload.trashValues;
        this.setPlainTrashValues(payload.plainTrashValues);
      }

      // If both have finished
      if (this.bulletComputationDone && this.trashValuesComputationDone) {
        // TODO (ZKP for other election modes)
        if (category == "Checkbox") {
          const proofSumWorker = new ProofSumComputationWorker(); // Create new Worker
          proofSumWorker.onmessage = ({ data }) => {
            if (data.done == true) {
              this.loadingCurrent++;
              this.bullet.proofOfSum = data.proof;
              this.setBullet(this.bullet);
              this.setProofOfSumSecretRandomNumbers(data.secretRandomNumbers);
              this.allDone = true; // Notify UI

              Diagnose.endTimer();
              Diagnose.startTimer("Continue from Encryption mask");
            }
          };
          var data = {
            bullet: this.bullet,
            nonces: this.getSecretRandomNumbers(),
            paillier: this.getPaillier(),
            maxVotes: this.getBallot().settings.maxNumberOfChoices,
            voterSecret: this.getElection().secret,
            category: this.getBallot().category,
          };
          proofSumWorker.postMessage(JSON.stringify(data)); // Start Worker
        } else {
          this.setBullet(this.bullet);
          this.allDone = true;
          Diagnose.endTimer();
          Diagnose.startTimer("Continue from Encryption mask");
        }
      }
    },
  },
};
</script>
