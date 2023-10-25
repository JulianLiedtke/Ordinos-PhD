<template>
  <div>
    <q-card class="helpCard test-white" :class="bgcolor">
      <span>
        <div v-for="(info, key) in infoSentences" :key="key">{{ info }}</div>
        <br />{{$t('ComponentInfoBox.reread_election_conditions')}}
        <q-btn
          :label="$t('ComponentInfoBox.reread_election_conditions')"
          color="white"
          glossy
          text-color="black"
          @click="onIntroBoxButtonClick"
        />
      </span>
    </q-card>
    <q-dialog v-model="dialog" v-on:hide="popupClose" v-on:show="popupOpen">
      <q-card>
        <q-card-section>
          <div v-for="(sentence, key) in introSentences" v-bind:key="key">
            {{ sentence }}
            <br />
            <br />
          </div>
        </q-card-section>
        <q-card-section class="row items-center q-gutter-sm">
          <q-btn v-close-popup label="OK" color="primary" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import Diagnose from "components/Diagnose";
export default {
  name: "ComponentInfoBox",
  props: {
    electionType: {
      type: String,
      required: true,
      default: "",
    },
    infoSentences: {
      type: Array,
      required: true,
      default() {
        return []
      },
    },
    bgcolor: {
      type: String,
      required: true,
      default: "",
    },
    settings: {
      type: Object,
      required: true,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      dialog: true,
      reading: true,
    };
  },

  computed: {
    /**
     * @returns array of introduction sentences  depending on the election type
     */
    introSentences() {
      if (this.electionType == "Rating") {
        return this.getRatingInfo();
      } else if (this.electionType == "Ranking") {
        return this.getRankingInfo();
      } else if (this.electionType == "MultipleChoice") {
        return this.getMultipleChoiceInfo();
      } else if (this.electionType == "DragDrop") {
        return this.getDragDropInfo();
      } else {
        return []; //default case
      }
    },
  },

  methods: {
    /**
     *  Starts timer to measure time for reading the infobox
     */
    popupOpen() {
      if (this.reading == false) {
        this.reading = true;
        Diagnose.endTimer();
        Diagnose.startTimer("Reading Infobox");
      }
    },

    /**
     * Ends timer for reading the infobox and starts timer for measuring time for voting
     */
    popupClose() {
      if (this.reading) {
        this.reading = false;
        Diagnose.endTimer();
        Diagnose.startTimer("Voting");
      }
    },

    /**
     *  if introbox is called up again, the information is stroed in the diagnostic data
     */
    onIntroBoxButtonClick() {
      this.dialog = true;
      Diagnose.addIntroBoxClick();
    },

    /**
     * @returns array of introduction sentences for rating
     */
    getRatingInfo() {
      var sentences = [];
      if (this.settings.spreadPointsAcross) {
        sentences.push(
          this.$t('ComponentInfoBox.points_please') +
            this.settings.points +
            this.$t('ComponentInfoBox.distribute_points') +
            this.settings.points +
            this.$t('C')
        );
      } else {
        sentences.push(
          this.$t('ComponentInfoBox.per_candidate_max') +
            this.settings.points +
            this.$t('ComponentInfoBox.distribute_points')
        );
      }
      if (this.settings.allowDraw) {
        sentences.push(
          this.$t('ComponentInfoBox.ties_allowed')
        );
      } else {
        sentences.push(
          this.$t('ComponentInfoBox.ties_not_allowed')
        );
      }
      sentences.push(
        this.$t('ComponentInfoBox.at_least') +
          this.settings.minNumberOfChoices +
          this.$t('ComponentInfoBox.award_points')
      );
      sentences.push(
        this.$t('ComponentInfoBox.award_points_instruction_slider')
      );
      sentences.push(
        this.$t('ComponentInfoBox.award_points_instruction_manuelly')
      );
      sentences.push(
        this.$t('ComponentInfoBox.award_points_instruction_fill')
      );
      return sentences;
    },

    /**
     * @returns array of introduction sentences for ranking
     */
    getRankingInfo() {
      var sentences = [];
      sentences.push(
        this.$t('ComponentInfoBox.order_ranking')
      );
      sentences.push(
        this.$t('ComponentInfoBox.how_to_order_ranking')
      );
      sentences.push(
        this.$t('ComponentInfoBox.candidates_arranged_according_to_your_choice')
      );
      if (
        this.settings.numberOfCountingRanks != this.settings.candidates.length
      ) {
        sentences.push(
          this.$t('ComponentInfoBox.only_the_first') +
            this.settings.numberOfCountingRanks +
            this.$t('ComponentInfoBox.scored_places')
        );
      }
      sentences.push(
        this.$t('ComponentInfoBox.evaluation_of_places')
      );
      for (var i = 0; i < this.settings.pointDistribution.length; i++) {
        sentences.push(
          this.$t('ComponentInfoBox.place') +
            (i + 1) +
            this.$t('ComponentInfoBox.receives') +
            this.settings.pointDistribution[i] +
            this.$t('ComponentInfoBox.points')
        );
      }
      return sentences;
    },

    /**
     * @returns array of introduction sentences for multiple choice
     */
    getMultipleChoiceInfo() {
      var sentences = [];
      sentences.push(this.$t('ComponentInfoBox.check_off_candidates'));
      sentences.push(
        this.$t('ComponentInfoBox.choose_at_least') +
          this.settings.minNumberOfChoices +
          this.$t('ComponentInfoBox.candidates')
      );
      sentences.push(
        this.$t('ComponentInfoBox.may_for_up_to') +
          this.settings.maxNumberOfChoices +
          this.$t('ComponentInfoBox.candidates')
      );
      return sentences;
    },

    /**
     * @returns array of introduction sentences for drag and drop
     */
    getDragDropInfo() {
      var sentences = [];
      sentences.push(
        this.$t('ComponentInfoBox.distribute_candidates')
      );
      sentences.push(
        this.$t('ComponentInfoBox.drag_candidates')
      );

      sentences.push(
        this.$t('ComponentInfoBox.there_are') + this.settings.numberOfCountingRanks + this.$t('ComponentInfoBox.places')
      );
      sentences.push(this.$t('ComponentInfoBox.each_place_occupied_once'));
      sentences.push(
        this.$t('ComponentInfoBox.up_to') +
          this.settings.numberOfEqualRanks +
          this.$t('ComponentInfoBox.candidates_in_one_place')
      );
      sentences.push(
        this.$t('ComponentInfoBox.weighting_of_places')
      );
      for (var i = 0; i < this.settings.pointDistribution.length; i++) {
        sentences.push(
          this.$t('ComponentInfoBox.new_line_place') +
            (i + 1) +
            this.$t('ComponentInfoBox.receives') +
            this.settings.pointDistribution[i] +
            this.$t('ComponentInfoBox.points')
        );
      }
      return sentences;
    },
  },
};
</script>
