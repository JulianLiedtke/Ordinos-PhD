<template>
  <div class="q-mb-lg">
    <InfoBox
      :electionType="electionType"
      :infoSentences="infoSentences"
      :bgcolor="bgcolor"
      :settings="settings"
    ></InfoBox>
    <q-list>
      <q-markup-table>
        <tbody>
          <tr
            v-for="(candidate, id) in candidates"
            v-on:click="onCandidateClicked(id)"
            :key="id"
            v-bind:class="choices[id] == 1 ? 'bg-positive' : 'white'"
          >
            <td class="text-left">
              <q-avatar>
                <img v-bind:src="candidate.avatar" />
              </q-avatar>
            </td>
            <td>{{ candidate.name }}</td>
            <td>
              <strong>{{ candidate.party }}</strong>
            </td>
            <td>
              <q-checkbox
                v-bind:disable="
                  !areMoreCandidatesSelectable() && choices[id] == 0
                "
                v-bind:model-value="choices[id] == 1"
                v-on:input="onCandidateClicked(id)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-list>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import InfoBox from "./ComponentInfoBox";

export default {
  name: "ComponentMultipleChoice",

  components: {
    InfoBox,
  },

  props: {
    minNumberOfChoices: {
      type: Number,
      required: true,
      default: 1,
    },
    maxNumberOfChoices: {
      type: Number,
      required: true,
      default: 1,
    },
    candidates: {
      type: Array,
      required: true,
      default(){
        return []
      },
    },
  },
  created() {
    this.setStep("ballot");
  },
  data: function () {
    return {
      choices: new Array(this.candidates.length).fill(0),

      electionType: "MultipleChoice",
      bgcolor: "bg-warning",
      infoSentences: [],
      settings: {
        minNumberOfChoices: this.minNumberOfChoices,
        maxNumberOfChoices: this.maxNumberOfChoices,
      },
    };
  },
  emits: [
    "valid",
    "invalid"
  ],
  methods: {
    ...mapActions("storeConfig", ["setChoices", "setStep"]),

    /**
     * Emitted when user clicked on a candidate
     *
     * @event
     * @param {String} candidateName
     */
    onCandidateClicked(candidateId) {
      // var index = this.getCandidateIndex(candidateName);
      var index = candidateId;

      // If candidate is selected or more candidates are selectable
      if (this.choices[index] == 1 || this.areMoreCandidatesSelectable()) {
        this.choices[index] = 1 - this.choices[index];
        this.emitValidity();
        this.$forceUpdate();
      }
    },

    /**
     * Check if ballot is valid and emits valid or invalid
     * Also sets color and info texts
     *
     * @emits valid
     * @emits invalid
     */
    emitValidity() {
      this.infoSentences = [];
      var numberOfPickedCandidates = this.getNumberOfSelectedCandidates();
      if (
        numberOfPickedCandidates >= this.minNumberOfChoices &&
        numberOfPickedCandidates <= this.maxNumberOfChoices
      ) {
        this.bgcolor = "bg-positive";
        this.infoSentences.push(this.$t('ComponentMultipleChoice.vote_valid'));
        if (numberOfPickedCandidates < this.maxNumberOfChoices)
          this.infoSentences.push(
            this.$t('ComponentMultipleChoice.you_can') +
              (this.maxNumberOfChoices - numberOfPickedCandidates) +
               this.$t('ComponentMultipleChoice.more_candidates')
          );
        this.setChoices(this.choices);
        this.$emit("valid");
      } else {
        this.infoSentences.push(
          this.$t('ComponentMultipleChoice.elect_at_least_one_candidate')
        );
        this.infoSentences.unshift(this.$t('ComponentMultipleChoice.vote_invalid'));
        this.bgcolor = "bg-warning";
        this.$emit("invalid");
      }
    },

    /**
     * Check if more candidates can be selected
     *
     * @return {boolean}
     */
    areMoreCandidatesSelectable() {
      var picks = this.getNumberOfSelectedCandidates();
      if (picks < this.maxNumberOfChoices) return true;
      else return false;
    },
    
    /**
     * Returns the selected candidates
     *
     * @return {Array}
     */
    getNumberOfSelectedCandidates() {
      var picks = 0;
      for (var i = 0; i < this.choices.length; i++) {
        if (this.choices[i] == 1) picks++;
      }
      return picks;
    },

    /**
     * Return the index of a candidate with a certain name
     *
     * @param {String} candidateName
     */
    getCandidateIndex(candidateName) {
      var index = -1;
      for (var i = 0; i < this.candidates.length; i++) {
        if (this.candidates[i].name == candidateName) {
          index = i;
          break;
        }
      }
      return index;
    },
  },
};
</script>
