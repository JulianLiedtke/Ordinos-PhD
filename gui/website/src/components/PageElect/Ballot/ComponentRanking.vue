<template>
  <div class="q-mb-lg">
    <InfoBox
      :electionType="'Ranking'"
      :infoSentences="infoSentences"
      :bgcolor="bgcolor"
      :settings="settings"
    ></InfoBox>
    <q-markup-table>
      <tbody>
        <tr
          class="candidates"
          v-for="(item, id) in positions"
          :key="id"
          v-bind:class="{
            'bg-grey': id < numberOfCountingRanks,
            changing: changedItem == id,
          }"
        >
          <td class="smaller">
            <q-input
              v-model="positions[id].rank"
              rounded
              outlined
              type="number"
              :label="$t('ComponentRanking.place') + (id + 1)"
              min="1"
              max="candidates.length"
              @change="setPosition(id)"
            />
          </td>
          <td>
            <q-btn
              :disabled="id == 0"
              outline
              color="white"
              text-color="black"
              icon="keyboard_arrow_up"
              @click="changePosition(id, 'up')"
            />
            <q-btn
              :disabled="id + 1 >= candidates.length"
              outline
              color="white"
              text-color="black"
              icon="keyboard_arrow_down"
              @click="changePosition(id, 'down')"
            />
          </td>
          <td class="text-left">
            <q-avatar>
              <img v-bind:src="candidates[item.candidate].avatar" />
            </q-avatar>
          </td>
          <td class="text-left"></td>
          <td>{{ candidates[item.candidate].name }}</td>
          <td>
            <strong>{{ candidates[item.candidate].party }}</strong>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";
import InfoBox from "./ComponentInfoBox";
export default {
  name: "ComponentRanking",

  components: {
    InfoBox,
  },

  props: {
    numberOfEqualRanks: {
      type: Number,
      required: true,
      default: 0,
    },
    numberOfCountingRanks: {
      type: Number,
      required: true,
      default: 3,
    },
    pointDistribution: {
      type: Array,
      required: true,
      default(){
        return []
      },
    },
    candidates: {
      type: Array,
      required: true,
      default(){
        return []
      },
    },
  },

  data() {
    return {
      timeout: null,
      changesMade: false,
      positions: [],
      choices: [],
      changedItem: null,
      bgcolor: "bg-positive",
      infoSentences: [
        this.$t('ComponentRanking.vote_valid'),
        this.$t('ComponentRanking.please_note') +
        this.numberOfCountingRanks +
        this.$t('ComponentRanking.evaluated_ranks'),
      ],
      settings: {
        numberOfCountingRanks: this.numberOfCountingRanks,
        pointDistribution: this.pointDistribution,
        candidates: this.candidates,
      },
    };
  },

  emits: [
    "valid"
  ],

  created() {
    this.setStep("ballot");

    // initialize ranks for candidates
    for (var i = 0; i < this.candidates.length; i++) {
      this.positions.push({
        rank: i + 1,
        candidate: i,
      });
    }

    // initialize points for each rank
    for (var i = 0; i < this.pointDistribution.length; i++) {
      this.choices.push(this.pointDistribution[i]);
    }
    for (
      var i = this.pointDistribution.length;
      i < this.candidates.length;
      i++
    ) {
      this.choices.push(0);
    }
    this.updateChoices();
    this.$emit("valid");
  },

  methods: {
    ...mapActions("storeConfig", ["setChoices", "setStep"]),
    ...mapGetters("storeConfig", ["getEvaluation"]),

    /**
     * Start animation (Color of moved candidate). Cancel old timer if existing
     *
     * @param {number} id of candidate to animate
     */
    animation(id) {
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
      this.changedItem = id;
      this.timeout = setTimeout(() => {
        this.changedItem = -1;
      }, 1000);
    },

    /**
     * This method deletes the first info sentence that the voter is still allowed to change the position
     */
    deleteInfoSentence() {
      if (!this.changesMade) {
        this.changesMade = true;
        this.infoSentences.splice(0, 1);
      }
    },

    /**
     * This method sets the position of a candidate to a new postition that is defined in ranks array
     * @param id of the candidate to change the position
     */
    setPosition(id) {
      this.deleteInfoSentence();
      this.animation(this.positions[id].rank - 1);

      this.positions.splice(
        this.changedItem,
        0,
        this.positions.splice(id, 1)[0]
      );

      this.resetRanks();

      this.updateChoices();
    },

    /**
     * This method increases or decreases the position of a candidate by 1
     * @param id of the candidate
     * @param instruction up or down defines whether to increase or decrease the position
     */
    changePosition(id, instruction) {
      this.deleteInfoSentence();
      var candidate = this.positions[id];
      var swapCandidate;
      switch (instruction) {
        case "up":
          swapCandidate = this.positions[id - 1];
          this.positions[id] = swapCandidate;
          this.positions[id - 1] = candidate;
          this.animation(id - 1);
          break;
        case "down":
          swapCandidate = this.positions[id + 1];
          this.positions[id] = swapCandidate;
          this.positions[id + 1] = candidate;
          this.animation(id + 1);
          break;
      }
      this.resetRanks();
      this.updateChoices();
    },

    /**
     * This method resets the changed order of ranks inside the object positions
     */
    resetRanks() {
      for (var i = 0; i < this.candidates.length; i++) {
        this.positions[i].rank = i + 1;
      }
    },

    /**
     * This method updates the choices array
     */
    updateChoices() {
      this.choices.fill(0);
      for (var i = 0; i < this.pointDistribution.length; i++) {
        this.choices[this.positions[i].candidate] = this.pointDistribution[i];
      }
      const type = this.getEvaluation().type;
      if(type === "Condorcet" || type === "MiniMaxWinningVotesSmith" || type === "MiniMaxMarginsSmith" ||
        type === "Copeland") {
        this.choices = this.generateDuelMatrix();
      } else if(type === "Instant_runoff"){
        this.choices = this.generateIRVMatrix();
      }
      this.setChoices(this.choices);
    },

    generateIRVMatrix() {
      // generate matrix which contains the placement of the candidates
      // [[0,0,1],[1,0,0],[0,1,0]] means that candidate 1 is placed 3rd, candidate 2 is placed 1st and candidate 3 is placed 2nd
      var IRVMatrix = new Array(this.candidates.length)
      for (var i = 0; i < IRVMatrix.length; i++) {
        IRVMatrix[i] = new Array(this.candidates.length)
        IRVMatrix[i].fill(0)
      }

      for (var i = 0; i < this.candidates.length; i++) {
        for (var j = 0; j < this.candidates.length; j++) {
          if (this.positions[i].candidate === j)
            IRVMatrix[i][j] = 1
        }
      }
      return IRVMatrix;
    },

    generateDuelMatrix() {
      // generate matrix, which indicates who is preferred against whom
      // [[0,0,1],[0,0,1],[0,0,0]] means, that A and B win against C but A and B are equal

      var duelMatrix = new Array(this.candidates.length)
      for (var i = 0; i < duelMatrix.length; i++) {
        duelMatrix[i] = new Array(this.candidates.length)
        duelMatrix[i].fill(0)
      }

      for (var i = 0; i < this.candidates.length; i++) {
        for (var j = i+1; j < this.candidates.length; j++) {
          var preference = this.getPreference(i, j);
          if (preference === 1)
            duelMatrix[i][j] = 1
          else if (preference === -1)
            duelMatrix[j][i] = 1
        }
      }

      return duelMatrix;
    },

    getPreference(candA, candB) {
      var pointsA = this.choices[candA]
      var pointsB = this.choices[candB]

      if (pointsA < 1 || pointsB < 1)
        return 0

      if (pointsA < pointsB)
        return -1
      else if (pointsA > pointsB)
        return 1
      else
        return 0
    }
  },
};
</script>
