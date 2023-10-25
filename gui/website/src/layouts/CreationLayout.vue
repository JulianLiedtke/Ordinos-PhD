<template>
  <q-layout view="lHh Lpr lff">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            :label="$t('layout.header.ordinos')"
            @click="openOrdinosStart()"
            size="22px"
            flat
          />
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn icon="arrow_back" flat @click="openOrdinosStart()" />
        <q-btn
          :loading="loading"
          :disable="loading"
          icon="label_important"
          :label="$t('CreationLayout.start_evaluation')"
          flat
          @click="triggerEvaluation()"
        />
        <LangSwitch />
      </q-toolbar>
    </q-header>

    <q-drawer
      side="left"
      v-model="debugDrawer"
      bordered
      :breakpoint="1000"
      class="bg-grey-3"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-sm">
          {{ JSON.stringify(ballot_form.candidates, null, 4) }}
          <q-separator />
          {{ JSON.stringify(ballot_form.ballot, null, 4) }}
          <q-separator />
          {{ JSON.stringify(ballot_form.election, null, 4) }}
          <q-separator />
          {{ JSON.stringify(ballot_form.communication, null, 4) }}
          <q-separator />
          {{ JSON.stringify(ballot_form.encryption, null, 4) }}
          <q-separator />
          {{ JSON.stringify(ballot_form.evaluation, null, 4) }}
          <q-separator />
          {{ JSON.stringify(extra_options, null, 4) }}

        </div>
      </q-scroll-area>
    </q-drawer>

    <q-drawer
      side="right"
      v-model="drawerRight"
      bordered
      :breakpoint="1200"
      class="bg-grey-3"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-sm">
          <SaveForm
            :ballot_form="ballot_form"
            :extra_options="extra_options"
          />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view
        :ballot_form="ballot_form"
        :extra_options="extra_options"
      />
    </q-page-container>

    <q-footer class="bg-grey-3 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div style="height: 8em"></div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import SaveForm from "../components/PageCreateElection/ComponentSave";
import LangSwitch from "../components/I18n/ComponentSwitch";
import axios from "axios";

export default {
  name: "CreationLayout",
  components: {
    LangSwitch,
    SaveForm,
  },
  data() {
    return {
      drawerRight: true,
      debugDrawer: false,
      loading: false,
      // This form already has the shape the frontend/backend need
      // Do not change the shape
      // Default values should be set here
      ballot_form: {
        candidates: [],
        ballot: {
          category: "Checkbox",
          settings: {
            minNumberOfChoices: null,
            maxNumberOfChoices: null,
            numberOfEqualRanks: null,
            numberOfCountingRanks: null,
            pointDistribution: [],
            points: null,
            allowDraw: false,
            spreadPointsAcross: false,
          }
        },
        election: {
          id: null, // this will be set in backend
          title: "",
          start: null,
          due: null,
          numberOfVoters: null,
        },
        communication: {
          peerServerIP: "https://localhost:9000",
          authenticationServerIP: "https://localhost:9001",
          bulletinBoardServerIP: "https://localhost:9002",
        },
        encryption: {
          ABB: "PaillierABB",
          protocolSuite: "SubLinearProtocolSuite",
          bits: 2048,
          numberShares: 2,
          threshold: 2,
        },
        evaluation: {
          type: "Borda",
          settings: {
            // for borda
            numWinners: 1,
            listOfWinnerPoints: [1],
            pointLimit: 0,
            // for condorcet
            evaluate_condorcet: true,
            additional_evaluators: [],
            leak_better_half: false,
            smith_leak_min_copeland: false,
            leak_min_copeland: false,
            leak_max_points: false,
            // for parliamentary
            n_seats: 0,
            clause: 0,
            secret_residual: false,
            //for instant runoff
            systemID: 0,
            bitsInt: 64
          }
        }
      },

      // Options needed for the server select fields (not needed at the BB)
      extra_options: {
        peerOptions: ["https://localhost:9000"],
        authenticationOptions: ["https://localhost:9001"],
        bulletinboardOptions: ["https://localhost:9002"],
        filterPeerOptions: ["https://localhost:9000"],
        filterAuthenticationOptions: ["https://localhost:9001"],
        filterBulletinBoardOptions: ["https://localhost:9002"],
      }
    };
  },
  methods: {
    openOrdinosStart() {
      let route = this.$router.resolve({ path: "../" });
      window.location = route.href;
    },

    triggerEvaluation() {
      this.loading = true;
      axios
        .post(
          this.ballot_form.communication.authenticationServerIP +
          "/api/triggerEvaluation",
          {}
        )
        .then((res) => {
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            position: "top",
            message: $t('CreationLayout.evaluation_successful'),
          });
        })
        .catch((error) => {
          this.$q.notify({
            type: "negative",
            position: "top",
            message: $t('CreationLayout.evaluation_error'),
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
