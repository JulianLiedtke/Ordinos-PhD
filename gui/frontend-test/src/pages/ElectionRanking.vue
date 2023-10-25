<template>
  <q-page class="q-ma-md">
    <h5>Settings for Ranking</h5>

    <q-toolbar class="bg-grey-3 shadow-2 rounded-borders">
      Number of ranks that count:
      <q-space />
      <q-input
        rounded
        outlined
        v-model.number="numberOfCountingRanks"
        type="number"
        label="Counting ranks"
        min="1"
        max="list.length"
      />
    </q-toolbar>
    <q-separator vertical inset />
    <q-toolbar class="bg-grey-3 shadow-2 rounded-borders">
      Distribution of points:
      <q-space />
      <q-btn
        outline
        color="white"
        text-color="black"
        @click="changeVisible()"
        icon="keyboard_arrow_down"
      />
    </q-toolbar>
    <q-card v-if="visible">
      <div v-for="(rank, key) in positions" v-bind:key="key">
        <q-input
          rounded
          outlined
          v-model.number="rank.points"
          type="number"
          :label="'Points for rank '+ (key+1)"
          min="0"
        />
      </div>
      <q-card
        v-if="higherPoints"
        class="my-card bg-red text-white"
      >Are you sure you want to give a lower score to a higher ranked candidate?</q-card>
    </q-card>
    <q-separator vertical inset />
    <q-toolbar class="bg-grey-3 shadow-2 rounded-borders">
      Equal positioning allowed:
      <q-space />
      <q-checkbox v-model="equalPositioning" />
    </q-toolbar>
    <q-card>
      <q-toolbar v-if="equalPositioning">
        How many candidates with equal positions are allowed?
        <q-space />
        <q-input
          rounded
          outlined
          v-model.number="numberOfEqualPositions"
          type="number"
          min="0"
          max="list.length"
        />
      </q-toolbar>
    </q-card>
    <q-separator vertical inset />
    <h5>Ranking</h5>Consider: only the blue fields are relevant for the ranking
    <q-markup-table>
      <tbody class="bg-grey-3">
        <tr
          v-for="(candidate, id) in list"
          :key="id"
          v-bind:class=" id < numberOfCountingRanks ? 'bg-blue-4' : 'grey'"
        >
          <td class="smaller">
            <q-input
              rounded
              outlined
              v-model.number="candidate.position"
              type="number"
              label="Rank"
              min="1"
              max="list.length"
              @change="changePosition(id, 'position')"
            />
          </td>
          <td>
            <q-btn
              :disabled="id == 0"
              outline
              color="white"
              text-color="black"
              @click="changePosition(id, 'up')"
              icon="keyboard_arrow_up"
            />
            <q-btn
              :disabled="id + 1 >= list.length"
              outline
              color="white"
              text-color="black"
              @click="changePosition(id, 'down')"
              icon="keyboard_arrow_down"
            />
          </td>
          <td class="text-left">
            <q-avatar>
              <img v-bind:src="candidate.avatar" />
            </q-avatar>
          </td>
          <td class="text-left"></td>
          <td>{{candidate.name}}</td>
          <td>
            <strong>{{candidate.party}}</strong>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <h5>Your selection:</h5>
    <div v-for="(candidate, key) in list" v-bind:key="key">
      Candidate {{ candidate.name }} receives {{ positions[candidate.position - 1].points }} points
      <q-separator vertical inset />
    </div>
  </q-page>
</template>


<script>
export default {
  name: "PageIndex",

  data() {
    return {
      changed: -1,
      numberOfEqualPositions: 1,
      equalPositioning: false,
      visible: false,
      numberOfCountingRanks: 0,
      list: [
        {
          name: "Candidate A",
          party: "SPD",
          avatar:
            "https://icons.iconarchive.com/icons/diversity-avatars/avatars/1024/batman-icon.png",
          position: 1
        },
        {
          name: "Candidate B",
          party: "CDU",
          avatar: "https://cdn.quasar.dev/img/avatar.png",
          position: 2
        },
        {
          name: "Candidate C",
          party: "BüSo",
          avatar: "https://avatarfiles.alphacoders.com/125/thumb-125254.png",
          position: 3
        },
        {
          name: "Candidate D",
          party: "CDU",
          avatar: "https://cdn.quasar.dev/img/avatar.png",
          position: 4
        },
        {
          name: "Candidate E",
          party: "CDU",
          avatar: "https://cdn.quasar.dev/img/avatar.png",
          position: 5
        }
      ],
      positions: []
    };
  },
  created() {
    this.numberOfCountingRanks = this.list.length;
    for (var i = 0; i < this.list.length; i++) {
      this.positions.push({
        points: this.list.length - i
      });
    }
  },
  computed: {
    // returns the greatest number of all positions of the candidates
    highestPosition() {
      return this.list[this.list.length - 1].position;
    },

    // returns true if a lower ranked candidate receives a higher score
    higherPoints() {
      for (var i = 0; i < this.positions.length - 1; i++) {
        if (this.positions[i].points < this.positions[i + 1].points) {
          return true;
        }
      }
      return false;
    }
  },
  methods: {
    // every second click a card to select the distribution of the points is shown
    // if visible is true, card is shown, otherwise it's hidden
    changeVisible() {
      this.visible = !this.visible;
    },

    // calculates the first and the last index of candidates that already have the new rank
    // returns an array of two elements: first one: firstIndex, last one: lastIndex
    numberOfCandidatesNewRank(id) {
      var firstIndex = this.firstIndexOfNewRank(this.list[id].position, id);
      var same = true;
      var lastIndex = firstIndex;
      while (
        same &&
        firstIndex != this.list.length - 1 &&
        lastIndex + 1 != this.list.length
      ) {
        if (
          this.list[firstIndex].position == this.list[lastIndex + 1].position &&
          lastIndex + 1 != id
        ) {
          lastIndex = lastIndex + 1;
        } else {
          same = false;
        }
      }
      return [firstIndex, lastIndex];
    },

    // helper method for numberOfCandidatesNewRank
    // returns the first index of a candidate that has the new rank
    firstIndexOfNewRank(newRank, id) {
      if (newRank > this.list.length) {
        return this.list.length - 1;
      }
      for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].position == newRank && i != id) {
          return i;
        }
      }
      return this.list.length - 1;
    },

    // returns true if other candidates with the old rank exist, false otherwise
    doCandidatesOldRankExist(id) {
      if (id == 0) {
        if (this.list[1].position == 1) {
          return true;
        }
        return false;
      }
      if (id == this.list.length - 1) {
        if (this.list[this.list.length - 2].position == this.list.length) {
          return true;
        }
        return false;
      }
      if (
        Math.abs(this.list[id - 1].position - this.list[id + 1].position) == 2
      ) {
        return false;
      }
      return true;
    },

    // method that gets called when a position of a candidate gets changed
    changePosition(id, instruction) {
      if (instruction == "up") {
        this.list[id].position = this.list[id].position - 1;
      }
      if (instruction == "down") {
        this.list[id].position = this.list[id].position + 1;
      }
      if (this.list[id].position > this.highestPosition) {
        if (this.highestPosition < this.list.length) {
          this.list[id].position = this.highestPosition + 1;
        } else {
          this.list[id].position = this.list.length;
        }
      }

      var indizes = this.numberOfCandidatesNewRank(id);
      var firstIndex = indizes[0];
      var lastIndex = indizes[1];
      var numberOfNewElements = lastIndex - firstIndex + 1;
      if (!this.doCandidatesOldRankExist(id)) {
        this.decreasePositionsFromTo(id + 1, this.list.length - 1);
      }

      this.list.splice(firstIndex, 0, this.list.splice(id, 1)[0]);
      if (numberOfNewElements + 1 > this.numberOfEqualPositions) {
        this.increasePositionsFromTo(lastIndex + 1, this.list.length - 1);
      }
    },

    // decreases all positions from a certain index to a certain index
    decreasePositionsFromTo(from, to) {
      for (var i = from; i <= to; i++) {
        this.list[i].position = this.list[i].position - 1;
      }
    },

    // increases all positions from a certain index to a certain index
    increasePositionsFromTo(from, to) {
      for (var i = from; i <= to; i++) {
        this.list[i].position = this.list[i].position + 1;
      }
    },

    pushUp(id) {
      this.list.splice(id - 1, 0, this.list.splice(id, 1)[0]);
      this.updatePositions();
      this.changed = id - 1;
    },
    pushDown(id) {
      var numberOfEqualRanksAfter = this.getNumberOfEqualRanksAfter(id);
      // this.list[id].position = this.list[id].position + 1;
      for (var i = id + 1; i <= id + numberOfEqualRanksAfter; i++) {
        this.list[i].position = this.list[i].position - 1;
      }
      this.list.splice(
        id + 1,
        0,
        this.list.splice(id, numberOfEqualRanksAfter)[0]
      );
      // this.changed = id + 1;
    }
  }
};
</script>   
<style scoped>
.smaller {
  width: 150px;
}
</style>