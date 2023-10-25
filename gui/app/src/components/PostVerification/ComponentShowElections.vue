<template>
  <div class="q-gutter-sm q-mt-sm">
    <q-card
      bordered
      v-for="(election, id) in elections"
      :key="id"
      v-bind:class="election.color"
    >
      <q-card-section
        v-if="election.demo"
        class="bg-accent dense">
        {{ $t('ComponentShowElections.election_demo_election') }}
      </q-card-section>
      <q-card-section
        class="bg-accent dense">
        <div class="row">
          {{ $t('ComponentShowElections.election') }} {{ election.title }}
          <q-space></q-space>
          {{ getDisplayDate(election.start) }}  - {{ getDisplayDate(election.due) }}
        </div>
      </q-card-section>
      <q-card-section class="dense">
        {{ $t('ComponentShowElections.last_vote') }} {{ getDisplayDate(election.dates[election.dates.length-1]) }}
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn
          style="width:100%"
          color="primary"
          :label="$t('ComponentShowElections.see_details')"
          @click="showDetails(id)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { date } from "quasar";

export default {
  name: "ComponentShowElections",

  props: {
    elections: {
      type: Array,
      required: true,
      default: 1
    }
  },
  emits: [
    "show"
  ],
  methods: {
    /**
     * Show Results of an Eleciton
     *
     * @event
     * @emits show
     */
    showDetails(id) {
      this.$emit("show", { id: id });
    },

    /**
     * Formate a date from iso-standard to a display date
     *
     * @return {String} Date
     */
    getDisplayDate(iso_date) {
      return date.formatDate(iso_date, "DD.MM.YYYY HH:mm");
    }
  },
  created() {}


};
</script>

<style lang="sass" scoped>

.dense
  padding: 10px
</style>
