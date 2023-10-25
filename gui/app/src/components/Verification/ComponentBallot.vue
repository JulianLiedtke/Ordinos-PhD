<template>
  <div>
    <ComponentMultipleChoice
      v-if="this.ballot.category == 'Checkbox'"
      v-bind:maxNumberOfChoices="this.ballot.settings.max"
      v-bind:minNumberOfChoices="this.ballot.settings.min"
      v-bind:list="this.candidates"
    />
    <ComponentRating
      v-else-if="this.ballot.category == 'Rating'"
      v-bind:allowDraw="this.ballot.settings.allowDraw"
      v-bind:spreadPointsAcross="this.ballot.settings.spreadPointsAcross"
      v-bind:minNumberOfChoices="this.ballot.settings.minNumberOfChoices"
      v-bind:list="this.candidates"
    />
    <ComponentRanking
      v-else-if="
        this.ballot.category == 'Ranking' &&
        this.ballot.settings.numberOfEqualRanks == 1
      "
      v-bind:numberOfEqualPositions="this.ballot.settings.numberOfEqualRanks"
      v-bind:numberOfCountingRanks="this.ballot.settings.numberOfCountingRanks"
      v-bind:pointDistribution="this.ballot.settings.pointDistribution"
      v-bind:list="this.candidates"
    />
    <ComponentDragDrop
      v-else-if="this.ballot.category == 'Ranking'"
      v-bind:numberOfEqualPositions="this.ballot.settings.numberOfEqualRanks"
      v-bind:numberOfCountingRanks="this.ballot.settings.numberOfCountingRanks"
      v-bind:pointDistribution="this.ballot.settings.pointDistribution"
      v-bind:list="this.candidates"
    />
  </div>
</template>

<script>
import ComponentMultipleChoice from "components/Verification/Ballot/ComponentMultipleChoice";
import ComponentRanking from "components/Verification/Ballot/ComponentRanking";
import ComponentRating from "components/Verification/Ballot/ComponentRating";
import ComponentDragDrop from "components/Verification/Ballot/ComponentDragDrop";

import { mapGetters } from "vuex";

export default {
  name: "ComponentBallot",

  components: {
    ComponentMultipleChoice,
    ComponentRanking,
    ComponentRating,
    ComponentDragDrop,
  },
  data() {
    return {
      ballot: this.getBallot(),
      candidates: this.getCandidates(),
      isValid: false,
    };
  },
  methods: {
    ...mapGetters("storeConfig", ["getBallot", "getCandidates"]),
  },
};
</script>
