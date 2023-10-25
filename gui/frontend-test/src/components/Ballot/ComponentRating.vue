<template>
  <q-page class="q-ma-md">
    <h5>Rating</h5>

    <div class="row q-mb-lg">
      Allow draw: {{this.allowDraw}}, 
      Spread Points: {{this.spreadPointsAcross}}, 
      Min: {{this.minNumberOfChoices}}
    </div>
    <q-markup-table>
      <tbody class="bg-grey-3">
        <tr v-for="(candidate, id) in list" :key="id">
          <td>
            <q-slider
              v-model="candidate.points"
              :min="0"
              :max="100"
              v-bind:color="color"
            />
            <q-badge v-bind:color="color"
              >Points: {{ candidate.points }} (0 to 100)</q-badge
            >
          </td>
          <td class="smaller">
            <q-input
              rounded
              outlined
              v-model.number="candidate.points"
              type="number"
              label="Points"
            />
          </td>
          <td class="text-left">
            <q-avatar>
              <img v-bind:src="candidate.avatar" />
            </q-avatar>
          </td>
          <td class="text-left"></td>
          <td>{{ candidate.name }}</td>
          <td>
            <strong>{{ candidate.party }}</strong>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <h5>Total Points: {{ getTotalPoints() }}</h5>
    <q-btn v-if="isValid()" label="Submit" type="submit" color="primary" />
  </q-page>
</template>

<script>
export default {
  name: "ComponentRating",

  props: {
    allowDraw: {
      type: Boolean,
      required: true,
      default: true
    },
    spreadPointsAcross: {
      type: Boolean,
      required: true,
      default: true
    },
    minNumberOfChoices: {
      type: Number,
      required: true,
      default: 1
    },
    list :{
      type: Array,
      required: true,
      default: []
    }
    },

  data: function() {
    return {
      standard: 0,
    };
  },
  computed: {
    color() {
      if (this.isValid()) {
        return "green";
      } else {
        return "red";
      }
    }
  },
  methods: {
    getTotalPoints() {
      var count = 0;
      for (var i = 0; i < this.list.length; i++) {
        count = count + this.list[i].points;
      }
      if (isNaN(count)) {
        return "";
      }
      return count;
    },
    isValid() {
      let resp = true;
      if (this.spreadPointsAcross && this.getTotalPoints() != 100) {
        resp = false;
      }
      if (!this.allowDraw) {
        this.list.forEach(c => {
          this.list.forEach(c2 => {
            if (
              c.name != c2.name &&
              c2.points == c.points &&
              c.points + c2.points > 0
            ) {
              resp = false;
            }
          });
        });
      }

      let numberOfChosenCandidates = 0;
      this.list.forEach(c => {
        if (c.points > 0) {
          numberOfChosenCandidates++;
        }
      });
      if (numberOfChosenCandidates < this.minNumberOfChoices) {
        resp = false;
      }

      return resp;
    }
  }
};
</script>

<style scoped>
.smaller {
  width: 150px;
}
</style>
