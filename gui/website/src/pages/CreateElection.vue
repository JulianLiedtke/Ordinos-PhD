<template>
  <div class="q-pa-sm">
    <ElectionForm 
      :ballot_form="defaultBallotForm" 
      :extra_options="defaultExtraOptions"
    />
  </div>
</template>

<script>

import ElectionForm from "../components/PageCreateElection/ComponentForm";

export default {
  name: "CreateElection",
  components: {
    ElectionForm
  },
  data() {
    return {
      // This form already has the shape the frontend/backend need
      // Do not change the shape
      // Default values should be set here
      defaultBallotForm: {
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
      defaultExtraOptions: {
        peerOptions: ["https://localhost:9000"],
        authenticationOptions: ["https://localhost:9001"],
        bulletinboardOptions: ["https://localhost:9002"],
        filterPeerOptions: ["https://localhost:9000"],
        filterAuthenticationOptions: ["https://localhost:9001"],
        filterBulletinBoardOptions: ["https://localhost:9002"],
      }
    };
  },
  methods: {},
};
</script>