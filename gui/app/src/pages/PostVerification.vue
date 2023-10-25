<template>
  <q-page class="q-ma-sm">
    <!-- State: No elections yet -->
    <div v-if="state == STATES.START">
      <q-card>
        <q-card-section class="bg-accent">
          {{$t('PostVerification.noElectionsTitle')}}
        </q-card-section>
        <q-card-section>
          {{$t('PostVerification.noElectionsText')}}
          <br />
          <br />
          {{$t('PostVerification.clickToScan')}}
        </q-card-section>
      </q-card>
    </div>

    <!-- State: Show all Elections -->
    <ComponentShowElections
      v-else-if="state == STATES.SHOW_ELECTIONS"
      v-bind:elections="this.elections"
      @show="flowControl"
    />

    <!-- State: Show results of one election -->
    <ComponentResults
      v-else-if="state == STATES.SHOW_RESULTS"
      :election="this.currentElection"
      @restart="showElections()"
      @result="storeResult"
      @delete="deleteElection"
    />
    <!-- State: Show demo-results -->
    <ComponentDemo
      v-else-if="state == STATES.SHOW_DEMO_RESULTS"
      @restart="showElections()"
      @delete="deleteElection"
    />
    <!-- <q-btn @click="clearStorage" class="q-mt-lg">clear Storage</q-btn> -->
    <q-footer v-if="state <= STATES.SHOW_ELECTIONS">
      <q-tabs>
        <q-route-tab :label="$t('PostVerification.scan')" icon="camera_alt" to="/Verification" />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script>
// Vue Components
import ComponentShowElections from "components/PostVerification/ComponentShowElections";
import ComponentResults from "components/PostVerification/ComponentResults";
import ComponentDemo from "components/PostVerification/ComponentDemo";

// Javascript Libraries
import ControlState from "components/PostVerification/ControlStateEnumeration";

export default {
  name: "PageIndex",

  components: {
    ComponentShowElections,
    ComponentResults,
    ComponentDemo
  },
  data() {
    return {
      STATES: ControlState.ControlState, // neccessary to have ControlState reachable in the template part above
      elections: [], //Stored Elections
      currentElection: null, //Election which is shown
      state: ControlState.ControlState.START, //Current State
      id: 0, //Id of currentElection
    };
  },
  created() {
    //Load Elections
    this.state = this.STATES.START;
    this.elections = this.$q.localStorage.getItem("election");
    if (this.elections == null || this.elections.length == 0) {
      this.elections = [];
    } else {
      this.state++;
    }
  },

  methods: {
    /**
     * State control management
     * Is executed at the end of a state before transition to next
     *
     * @param {object} payload
     */
    flowControl(payload = {}) {
      switch (this.state) {
        case this.STATES.SHOW_ELECTIONS: //passt nicht ganz
          // Pre: Show Elections
          // Post: Show Results
          //payload: {id: id}
          this.currentElection = this.elections[payload.id];
          this.id = payload.id;
          if (this.elections[payload.id].demo) {
            //test for demo
            this.state = this.STATES.SHOW_DEMO_RESULTS;
          } else {
            this.state++;
          }
          break;
        case this.STATES.SHOW_RESULTS:
          //Pre: Show Results
          break;
      }
    },

    /**
     * Emitted when going back from Results to Elections
     * Reloads Elections
     *
     * @event
     */
    showElections() {
      this.state = this.STATES.SHOW_ELECTIONS;
      this.elections = this.$q.localStorage.getItem("election");
      window.scrollTo(0, 0);
    },

    /**
     * only for testing
     */
    clearStorage() {
      this.$q.localStorage.clear();
    },

    /**
     * Delete CurrentElection
     *
     * @event
     */
    deleteElection() {
      this.elections.splice(this.id, 1);
      this.$q.localStorage.set("election", this.elections);
      if (this.elections.length == 0) {
        this.state = this.STATES.START;
        this.$forceUpdate();
      } else {
        this.state = this.STATES.SHOW_ELECTIONS;
      }
    },

    /**
     * Emitted when receiving Results
     * @param {object} payload resultArray []
     * @event
     */
    storeResult(payload) {
      this.elections[this.id].result = payload;
      this.$q.localStorage.set("election", this.elections);
    }
  }
};
</script>
