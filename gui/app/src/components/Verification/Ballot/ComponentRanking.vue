<template>
  <div class="q-mb-lg">
    <q-markup-table>
      <tbody>
        <tr class="candidates" v-for="(candidate, id) in positions" :key="id">
          <td style="font-size:11pt">{{ $t('ComponentRanking.ranking') }} {{ id + 1 }}:</td>
          <td class="text-left">
            <q-avatar>
              <img v-bind:src="candidate.avatar" />
            </q-avatar>
          </td>
          <td>{{ candidate.name }}</td>
          <td>
            <strong>{{ candidate.party }}</strong>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "ComponentRanking",

  props: {
    numberOfEqualPositions: {
      type: Number,
      required: true,
      default: 0
    },
    numberOfCountingRanks: {
      type: Number,
      required: true,
      default: 3
    },
    pointDistribution: {
      type: Array,
      required: true,
      default: []
    },
    list: {
      type: Array,
      required: true,
      default: []
    }
  },

  data() {
    return {
      positions: [],
      choices: this.getChoices()
    };
  },

  created() {
    //Create right order
    for (var i = 0; i < this.pointDistribution.length; i++) {
      for (var k = 0; k < this.list.length; k++) {
        if (this.pointDistribution[i] == this.choices[k]) {
          this.positions[i] = this.list[k];
        }
      }
    }
  },

  methods: {
    ...mapGetters("storeConfig", ["getChoices"])
  }
};
</script>
<style lang="scss">
.smaller {
  width: 150px;
}
.changing {
  background: $primary !important;
}
</style>
