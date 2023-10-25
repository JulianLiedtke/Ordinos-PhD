<template>
  <div class="q-mb-lg">
    <InfoBox
      :electionType="electionType"
      :infoSentences="infoSentences"
      :bgcolor="bgcolor"
      :settings="settings"
    ></InfoBox>

    <q-markup-table>
      <tbody>
        <tr v-for="(candidate, id) in candidates" :key="id">
          <td>
            <q-slider
              :key="componentKey"
              v-model="choices[id]"
              :min="0"
              :max="points"
              v-bind:color="color"
              v-on:update:model-value="emitValidity"
              @change="checkMax(id)"
            />
            <q-badge v-bind:color="color"
              >Points: {{ choices[id] }} (0 to {{ points }})</q-badge
            >
          </td>
          <td class="smaller">
            <q-input
              outlined
              v-model.number="choices[id]"
              :min="0"
              :max="points"
              type="number"
              label="Points"
              v-on:update:model-value="emitValidity"
              @change="checkMax(id)"
            />
          </td>
          <td class="smaller">
            <q-btn
              v-bind:label="
                spreadPointsAccross ? $t('ComponentRating.fill_up') : $t('ComponentRating.full_score')
              "
              @click="fillPoints(id)"
            />
          </td>
          <td class="text-left">
            <q-avatar>
              <img v-bind:src="candidate.avatar" />
            </q-avatar>
          </td>
          <td class="text-left"></td>
          <td>{{ candidate.name }}</td>
          <td>
            <strong>{{ candidate.party }}</strong>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import InfoBox from "./ComponentInfoBox";

export default {
  name: "ComponentRating",

  components: {
    InfoBox
  },

  props: {
    allowDraw: {
      type: Boolean,
      required: true,
      default: true
    },
    spreadPointsAcross: {
      type: Boolean,
      required: true,
      default: true
    },
    minNumberOfChoices: {
      type: Number,
      required: true,
      default: 1
    },
    candidates: {
      type: Array,
      required: true,
      default(){ 
        return []
      }
    },
    points: {
      type: Number,
      required: true,
      default: 100
    }
  },

  data: function() {
    return {
      componentKey: 0,
      electionType: "Rating",
      choices: new Array(this.candidates.length).fill(0),
      color: "negative",
      bgcolor: "bg-warning",
      infoSentences: [],
      settings: {
        allowDraw: this.allowDraw,
        spreadPointsAcross: this.spreadPointsAcross,
        minNumberOfChoices: this.minNumberOfChoices,
        points: this.points
      }
    };
  },

  created() {
    this.setStep("ballot");
  },

  computed: {
    /**
     * @returns remaining points that the voter may still award
     */
    remainingPoints() {
      return this.points - this.getTotalPoints();
    }
  },

  emits: [
    "valid",
    "invalid"
  ],

  methods: {
    ...mapActions("storeConfig", ["setChoices", "setStep"]),

    /**
     * increments component key
     */
    forceRerender() {
      this.componentKey = this.componentKey + 1;
    },

    /**
     * Method that checks if total points are > the maximum of points and if so the points of candidate with a specific id gets adapted
     * @param id of the candidate to be adapted if needed
     */
    checkMax(id) {
      if (this.spreadPointsAcross && this.getTotalPoints() > this.points) {
        this.fillPoints(id);
        this.emitValidity();
        this.forceRerender();
      }
    },

    /**
     * Method that calculates the points that are still available to assign and assignes them to the candidate with this id
     * @param id of the candidate the points will be assigned to
     */
    fillPoints(id) {
      if (this.spreadPointsAcross) {
        var totalPoints = this.getTotalPoints() - this.choices[id];
        this.choices[id] = this.points - totalPoints;
      } else {
        this.choices[id] = this.points;
      }
      this.emitValidity();
      this.$forceUpdate();
    },

    /**
     * @returns points that are already assigned at the moment
     */
    getTotalPoints() {
      var count = 0;
      for (var i = 0; i < this.candidates.length; i++) {
        count = count + this.choices[i];
      }
      if (isNaN(count)) {
        return "";
      }
      return count;
    },

    /**
     * sentences giving information about the remaining points are pushed to the infoSentences
     */
    addInfoSentencesSpreadPoints() {
      this.infoSentences.push(
        this.$t('ComponentRating.give_exactly') + this.points + this.$t('ComponentRating.points_one')
      );
      if (this.remainingPoints > 0) {
        this.infoSentences.push(
          this.$t('ComponentRating.you_still_have') +
            (this.points - this.getTotalPoints()) +
            this.$t('ComponentRating.points_two')
        );
      }
    },

    /**
     * method checks whether candidates have been awarded the same number of points and if so adds the information to infoSentences
     *
     * @param resp boolean that might be modified by the method
     * @returns resp
     */
    addInfoSentencesAllowDraw(resp) {
      var pushSentence = false;
      for (var i = 0; i < this.candidates.length; i++) {
        for (var k = 0; k < this.candidates.length; k++) {
          if (
            this.candidates[i].name != this.candidates[k].name &&
            this.choices[i] == this.choices[k] //&&
            //this.choices[i] + this.choices[k] > 0 //why do we need this line?
          ) {
            resp = false;
            pushSentence = true;
          }
        }
      }
      if (pushSentence) {
        this.infoSentences.push(
          this.$t('ComponentRating.tie_not_allowed')
        );
      }
      return resp;
    },

    /**
     * Checks whether the minimum number of selected candidates has been met and if not adds the information to infoSentences
     *
     * @param resp boolean that might be modified by the method
     * @returns resp
     */
    addInfoSentencesNumberChosenCandidates(resp) {
      let numberOfChosenCandidates = 0;
      for (var i = 0; i < this.candidates.length; i++) {
        if (this.choices[i] > 0) {
          numberOfChosenCandidates++;
        } else if (this.choices[i] < 0) {
          this.choices[i] = 0;
          this.$forceUpdate();
        }
      }
      if (numberOfChosenCandidates < this.minNumberOfChoices) {
        resp = false;
        if (this.minNumberOfChoices == this.candidates.length) {
          this.infoSentences.push(
            this.$t('ComponentRating.you_have_to_all') +
              this.minNumberOfChoices +
              this.$t('ComponentRating.candidates')
          );
        } else {
          this.infoSentences.push(
            this.$t('ComponentRating.you_have_to_at_least') +
              this.minNumberOfChoices +
              this.$t('ComponentRating.candidates')
          );
        }
        this.infoSentences.push(
          this.$t('ComponentRating.only_awarding') +
            numberOfChosenCandidates +
            this.$t('ComponentRating.points_candidates')
        );
      }
      return resp;
    },

    /**
     * Valid if the distribution of points is valid, invalid if not
     *
     * @emits valid/invalid
     */
    emitValidity() {
      let resp = true;
      this.infoSentences = [];
      if (this.spreadPointsAcross && this.getTotalPoints() != this.points) {
        resp = false;
        this.addInfoSentencesSpreadPoints();
      }
      if (!this.allowDraw) {
        resp = this.addInfoSentencesAllowDraw(resp);
      }

      resp = this.addInfoSentencesNumberChosenCandidates(resp);

      if (resp) {
        this.setChoices(this.choices);
        this.infoSentences.push(this.$t('ComponentRating.voting_valid'));
        this.color = "positive";
        this.bgcolor = "bg-positive";
        this.$emit("valid");
      } else {
        this.infoSentences.unshift(this.$t('ComponentRating.voting_invalid'));
        this.color = "negative";
        this.bgcolor = "bg-warning";
        this.$emit("invalid");
      }
      return resp;
    }
  }
};
</script>
