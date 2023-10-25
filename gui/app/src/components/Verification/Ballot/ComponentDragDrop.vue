<template>
  <div>
    <div v-for="n in this.numberOfCountingRanks" v-bind:key="n">
      <div :id="list.length + n">
        <q-card class="drop-target">
          <q-card-section style="font-size:12pt;" class="bg-accent">
            {{ $t('ComponentDragDrop.ranking') }} {{ n }}
          </q-card-section>
          <q-card-section
            v-for="(candidate, identifier) in positions[n - 1]"
            v-bind:key="identifier"
            class="bg-grey-4"
          >
            <q-card
              class="card-candidate text-white"
              style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
              :id="identifier"
            >
              <q-card-section horizontal>
                <q-card-section>
                  <q-avatar>
                    <img v-bind:src="candidate.avatar" />
                  </q-avatar>
                </q-card-section>
                <q-card-section>
                  {{ candidate.name }}
                </q-card-section>
                <q-card-section>
                  {{ candidate.party }}
                </q-card-section>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ComponentDragDrop",

  props: {
    numberOfEqualPositions: {
      type: Number,
      required: true,
      default: 3
    },
    numberOfCountingRanks: {
      type: Number,
      required: true,
      default: 4
    },
    pointDistribution: {
      type: Array,
      required: true
    },
    list: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      positions: [],
      choices: this.getChoices(),
      settings: {
        numberOfEqualPositions: this.numberOfEqualPositions,
        numberOfCountingRanks: this.numberOfCountingRanks,
        pointDistribution: this.pointDistribution
      }
    };
  },

  created() {
    //Creating the right order
    for (var n = 0; n < this.numberOfCountingRanks; n++) {
      this.positions[n] = [];
    }
    for (var i = 0; i < this.numberOfCountingRanks; i++) {
      for (var k = 0; k < this.list.length; k++) {
        if (this.pointDistribution[i] == this.choices[k]) {
          this.positions[i].push(this.list[k]);
        }
      }
    }
  },

  methods: {
    ...mapGetters("storeConfig", ["getChoices"])
  }
};
</script>

<style scoped lang="sass">
.drop-target
    margin-bottom: 15px
    min-width: 250px
    min-height: 50px
    border-radius: 3px

.card-candidate
  margin-left: -5px
  margin-top: -5px
  margin-bottom: -5px
  width: 250px
  height: 70px
</style>
