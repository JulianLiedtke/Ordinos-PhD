<template>
  <div>
    <InfoBox
      :electionType="electionType"
      :infoSentences="infoSentences"
      :bgcolor="bgcolor"
      :settings="settings"
    />
    <!-- Places to drop candidates in -->
    <div v-for="n in this.numberOfCountingRanks" v-bind:key="n">
      <q-card class="q-mb-md">
        <q-card-section
          v-bind:class="
            positions[n - 1].length == 0 ? 'bg-grey' : 'bg-positive'
          "
          style="font-size: 12pt"
          >Platz: {{ n }}</q-card-section
        >
        <q-card-section
          :id="candidates.length + n"
          v-mutation="mutationHandlerRanks"
          @dragenter="onDragEnter"
          @dragleave="onDragLeave"
          @dragover="onDragOver"
          @drop="onDrop"
          class="drop-target row"
        ></q-card-section>
      </q-card>
    </div>

    <!-- Place to show available candidates -->
    <q-card>
      <q-card-section class="bg-accent"
        >$t('ComponentDragDrop.available_candidates')</q-card-section
      >
      <q-card-section
        id="start"
        v-mutation="mutationHandlerCandidates"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @dragover="onDragOver"
        @drop="onDrop"
        class="drop-start row"
      >
        <div
          v-for="(candidate, identifier) in candidates"
          v-bind:key="identifier"
        >
          <q-card
            class="card-candidate text-white"
            style="
              background: radial-gradient(circle, #35a2ff 0%, #014a88 100%);
            "
            :id="identifier"
            draggable="true"
            @dragstart="onDragStart"
          >
            <q-card-section horizontal>
              <q-card-section>
                <q-avatar>
                  <img
                    class="image"
                    ondragstart="return false;"
                    v-bind:src="candidate.avatar"
                  />
                </q-avatar>
              </q-card-section>
              <q-card-section>{{ candidate.name }}</q-card-section>
              <q-card-section>{{ candidate.party }}</q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import InfoBox from "./ComponentInfoBox";

export default {
  name: "ComponentDragDrop",

  components: {
    InfoBox,
  },

  props: {
    numberOfEqualRanks: {
      type: Number,
      required: true,
      default: 3,
    },
    numberOfCountingRanks: {
      type: Number,
      required: true,
      default: 4,
    },
    pointDistribution: {
      type: Array,
      required: true,
    },
    candidates: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      positions: [], // Array of Arrays for every Rank, store ids
      status1: [], // Cache Candidates on Drag and Drop
      status2: [], // // Cache Candidates on Drag and Drop
      electionType: "DragDrop", //Type of Election
      choices: new Array(this.candidates.length).fill(0), //Points for each Candidate
      dialog: true,
      color: "negative",
      bgcolor: "bg-warning",
      infoSentences: [], // Sentences for Infobox
      settings: {
        // Setting for Info Box
        numberOfEqualRanks: this.numberOfEqualRanks,
        numberOfCountingRanks: this.numberOfCountingRanks,
        pointDistribution: this.pointDistribution,
      },
    };
  },

  created() {
    //Initialize Positions
    this.setStep("ballot");
    for (var i = 0; i < this.numberOfCountingRanks; i++) {
      this.positions[i] = [];
    }
  },

  emits: [
    "valid",
    "invalid"
  ],

  methods: {
    ...mapActions("storeConfig", ["setChoices", "setStep"]),

    /**
     * Mutation handler for available candidates
     */
    mutationHandlerCandidates(mutationRecords) {
      this.status1 = [];
      for (const index in mutationRecords) {
        const record = mutationRecords[index];
        const info = `type: ${record.type}, nodes added: ${
          record.addedNodes.length > 0 ? "true" : "false"
        }, nodes removed: ${
          record.removedNodes.length > 0 ? "true" : "false"
        }, oldValue: ${record.oldValue}`;
        this.status1.push(info);
      }
    },

    /**
     * Mutation handler for Ranks
     */
    mutationHandlerRanks(mutationRecords) {
      this.status2 = [];
      for (const index in mutationRecords) {
        const record = mutationRecords[index];
        const info = `type: ${record.type}, nodes added: ${
          record.addedNodes.length > 0 ? "true" : "false"
        }, nodes removed: ${
          record.removedNodes.length > 0 ? "true" : "false"
        }, oldValue: ${record.oldValue}`;
        this.status2.push(info);
      }
    },

    /**
     * store the id of the draggable element
     *
     * @event
     */
    onDragStart(e) {
      e.dataTransfer.setData("text", e.target.id);
      e.dataTransfer.dropEffect = "move";
    },

    /**
     * Show dashed outline
     *
     * @event
     */
    onDragEnter(e) {
      // don't drop on other draggable
      if (
        e.target != null &&
        (e.target.id == "start" ||
          (e.target.id >= this.candidates.length &&
            this.positions[e.target.id - this.candidates.length - 1].length <
              this.numberOfEqualRanks))
      ) {
        e.target.classList.add("drag-enter");
      }
    },

    /**
     * Remove dashed outline
     *
     * @event
     */
    onDragLeave(e) {
      if (
        e.target.id == "start" ||
        (e.target.id >= this.candidates.length &&
          this.positions[e.target.id - this.candidates.length - 1].length <
            this.numberOfEqualRanks)
      ) {
        e.target.classList.remove("drag-enter");
      }
    },

    /**
     * Drag candidate over a rank
     */
    onDragOver(e) {
      e.preventDefault();
    },

    /**
     * Drop candidate on new Rank
     *
     * @event
     */
    onDrop(e) {
      e.preventDefault();

      // don't drop on other draggables or full ranks
      if (
        e.target.id != "start" &&
        (e.target.id < this.candidates.length ||
          this.positions[e.target.id - this.candidates.length - 1].length >=
            this.numberOfEqualRanks)
      ) {
        return;
      }

      //get dragged candidate
      const draggedId = e.dataTransfer.getData("text");
      const draggedEl = document.getElementById(draggedId);

      if (draggedEl == null) {
        return;
      }

      // check if original parent node
      if (draggedEl.parentNode === e.target) {
        e.target.classList.remove("drag-enter");
        return;
      }

      //update points
      if (e.target.id != "start") {
        this.choices[draggedId] = this.pointDistribution[
          e.target.id - this.candidates.length - 1
        ];
        this.positions[e.target.id - this.candidates.length - 1].push(
          draggedId
        );
      } else if (e.target.id == "start") {
        this.choices[draggedId] = 0;
      }
      //remove candidate from old position
      if (draggedEl.parentNode.id > 0) {
        this.positions[
          draggedEl.parentNode.id - this.candidates.length - 1
        ].pop(draggedId);
      }

      // make the exchange
      draggedEl.parentNode.removeChild(draggedEl);

      e.target.appendChild(draggedEl);
      e.target.classList.remove("drag-enter");
      this.infoSentences = [];
      this.emitValidity();
      this.$forceUpdate();
    },

    /**
     * Check if Bullet is valid
     *
     * @emits valid
     * @emits invalid
     */
    emitValidity() {
      let valid = true;
      //At least one in each rank
      for (var i = 0; i < this.numberOfCountingRanks; i++) {
        if (this.positions[i].length == 0) {
          valid = false;
        }
      }
      if (valid) {
        this.infoSentences.push("Ihre Wahl ist gültig!"); // for Info box
        this.bgcolor = "bg-positive";
        this.setChoices(this.choices);
        this.$emit("valid");
      } else {
        (this.bgcolor = "bg-warning"),
          this.infoSentences.push(
            $t('ComponentDragDrop.select_at_least_one_candidate_per_seat')
          );
        this.$emit("invalid");
      }
      this.pushRemainingRanksSentences();
    },

    /**
     * For Infobox
     * Shows how many more canidates can be placed in each rank
     */
    pushRemainingRanksSentences() {
      for (var i = 0; i < this.numberOfCountingRanks; i++) {
        if (this.positions[i].length == 0) {
        }
        this.infoSentences.push(
          $t('ComponentDragDrop.on_seat') +
            (i + 1) +
            $t('ComponentDragDrop.still_fit') +
            (this.numberOfEqualRanks - this.positions[i].length) +
            $t('ComponentDragDrop.candidates')
        );
      }
    },
  },
};
</script>