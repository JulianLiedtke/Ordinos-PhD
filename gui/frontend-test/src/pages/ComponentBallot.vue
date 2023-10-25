<template>
    <ComponentLoadBallot v-if="this.state == 0" @load="chooseComponent" />
    <ComponentMultipleChoice
      v-else-if="this.categorie == 'Checkbox'"
      v-bind:maxNumberOfChoices = this.ballot.settings.max
      v-bind:minNumberOfChoices = this.ballot.settings.min
      v-bind:list = this.candidates
      />
    <ComponentRating
      v-else-if="this.categorie == 'Rating'"
      v-bind:allowDraw = this.ballot.settings.draw
      v-bind:spreadPointsAcross = this.ballot.settings.perCandidate
      v-bind:minNumberOfChoices = this.ballot.settings.min
      v-bind:list = this.candidates
    />
    <ComponentRanking
    v-else-if="this.categorie == 'Ranking'"
    v-bind:numberOfEqualPositions = this.ballot.settings.numberOfEqualRanks
    v-bind:numberOfCountingRanks = this.ballot.settings.numberOfCountingRanks
    v-bind:pointDistribution = this.ballot.settings.pointDistribution
    v-bind:list = this.candidates
    />
</template>

<script>
/**
 * This component is a JSON File Reader.
 * It shows a file input dialog and loads selected file.
 *
 * Events:
 * - load : File has been loaded
 */

import ComponentMultipleChoice from "components/Ballot/ComponentMultipleChoice";
import ComponentRanking from "components/Ballot/ComponentRanking";
import ComponentRating from "components/Ballot/ComponentRating";
import ComponentLoadBallot from "components/Ballot/ComponentLoadBallot";


import {mapGetters } from "vuex";

export default {
  name: "ComponentBallot",



  components: {
      ComponentMultipleChoice,
      ComponentRanking,
      ComponentRating,
      ComponentLoadBallot
  },
  data() {
    return {
        state: 0,
        categorie: null,
        ballot: null,
        candidates: null
    };
  },
  methods: {
      ...mapGetters("storeConfig", ["getBallot", "getCandidates"]),

  chooseComponent(){

    this.state = 1;
    this.ballot = this.getBallot();
    this.candidates = this.getCandidates();

    if(this.ballot != null){
      this.categorie = this.ballot.categorie;
    }
    else{

      this.state = 0;
    }
  }
    }
}
</script>
