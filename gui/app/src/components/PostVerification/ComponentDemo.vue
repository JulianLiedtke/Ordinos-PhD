<template>
  <div class="q-gutter-sm q-mt-sm q-mb-lg">
    <q-card>
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentDemo.demo_election') }}
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentDemo.where_the_results_would_be') }}
      </q-card-section>
        <br />
        {{ $t('ComponentDemo.delete_demo') }}
        <br />
        {{ $t('ComponentDemo.start_real_election') }}
        <br />
    </q-card>

    <q-btn @click="back()" size="lg">{{ $t('ComponentDemo.return') }}</q-btn>
    <q-btn
      v-on:click="confirm = true"
      class="float-right"
      color="negative"
      size="lg"
      >{{ $t('ComponentDemo.delete') }}</q-btn
    >
    <q-separator />
    
    <q-dialog v-model="confirm">
      <q-card>
        <q-card-section align="center">
          <q-avatar icon="delete_forever" color="primary" text-color="white" />
          <br />
          <br />
          {{ $t('ComponentDemo.question_delete_election') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('ComponentDemo.return')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('ComponentDemo.label_delete')"
            color="negative"
            v-close-popup
            v-on:click="deleteElection()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>

export default {
  name: "ComponentDemo",

  data() {
    return {
      confirm: false, // Show Dialog for Delete
    };
  },

  emits: [
    "restart",
    "delete"
  ],

  methods: {
    /**
     * Back to showElections
     * reset
     * 
     * @event
     * @emits restart
     */
    back() {
      this.confirm = true;
      this.$emit("restart");
    },

    /**
     * Delete Election
     * 
     * @event
     * @emits delete
     */
    deleteElection() {
      this.$emit("delete");
    }
  }
}
</script>

<style scoped lang="sass">
.verticalSplit
  font-size: 12pt
  border-right: solid 1px lightgrey

.dense
    padding: 10px
</style>
