<template>
  <q-card>
    <q-card-section class="bg-accent"> {{ $t('ComponentBallot.fill_in_ballot_paper') }} </q-card-section>
    <q-card-section>
      <ComponentMultipleChoice
        v-if="this.ballot.category == 'Checkbox'"
        v-on:valid="this.valid"
        v-on:invalid="this.invalid"
        v-bind:candidates="this.candidates"
        v-bind:maxNumberOfChoices="this.ballot.settings.maxNumberOfChoices"
        v-bind:minNumberOfChoices="this.ballot.settings.minNumberOfChoices"
      />
      <ComponentRating
        v-else-if="this.ballot.category == 'Rating'"
        v-on:valid="this.valid"
        v-on:invalid="this.invalid"
        v-bind:candidates="this.candidates"
        v-bind:allowDraw="this.ballot.settings.allowDraw"
        v-bind:spreadPointsAcross="this.ballot.settings.spreadPointsAcross"
        v-bind:minNumberOfChoices="this.ballot.settings.minNumberOfChoices"
        v-bind:points="this.ballot.settings.points"
      />
      <ComponentRanking
        v-else-if="
          this.ballot.category == 'Ranking' &&
          this.ballot.settings.numberOfEqualRanks == 1
        "
        v-on:valid="this.valid"
        v-on:invalid="this.invalid"
        v-bind:candidates="this.candidates"
        v-bind:numberOfEqualRanks="this.ballot.settings.numberOfEqualRanks"
        v-bind:numberOfCountingRanks="
          this.ballot.settings.numberOfCountingRanks
        "
        v-bind:pointDistribution="this.ballot.settings.pointDistribution"
      />
      <ComponentDragDrop
        v-else-if="this.ballot.category == 'Ranking'"
        v-on:valid="this.valid"
        v-on:invalid="this.invalid"
        v-bind:candidates="this.candidates"
        v-bind:numberOfEqualRanks="this.ballot.settings.numberOfEqualRanks"
        v-bind:numberOfCountingRanks="
          this.ballot.settings.numberOfCountingRanks
        "
        v-bind:pointDistribution="this.ballot.settings.pointDistribution"
      />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row">
        <q-space />
        <q-btn
          v-bind:disable="!isValid"
          v-on:click="vote"
          :label="$t('ComponentBallot.encrypt_ballot')"
          v-bind:color="isValid ? 'positive' : 'warning'"
          icon="lock"
          size="xl"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import ComponentMultipleChoice from "components/PageElect/Ballot/ComponentMultipleChoice";
import ComponentRanking from "components/PageElect/Ballot/ComponentRanking";
import ComponentRating from "components/PageElect/Ballot/ComponentRating";
import ComponentDragDrop from "components/PageElect/Ballot/ComponentDragDrop";

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
  emits: [
    "voted"
  ],
  methods: {
    ...mapGetters("storeConfig", ["getBallot", "getCandidates"]),

    /**
     * Set state to valid
     *
     * @event
     */
    valid() {
      this.isValid = true;
    },

    /**
     * Set state to invalid
     *
     * @event
     */
    invalid() {
      this.isValid = false;
    },

    /**
     * The "encrypt ballot" button has been clicked. User finished voting.
     *
     * @event
     */
    vote() {


      this.$emit("voted");
    },
  },
};
</script>
