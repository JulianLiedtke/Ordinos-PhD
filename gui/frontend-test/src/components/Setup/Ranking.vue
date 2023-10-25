<template>
  <div class="q-gutter-md">
    <q-carousel
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      animated
      arrows
      control-color="white"
      padding
      height="100%"
    >
      <q-carousel-slide name="countingRanks" class="column no-wrap flex-center">
        <q-icon name="style" size="56px" />
        <div class="q-mt-md text-center">
          <div class="q-mt-md">Number Of Ranks That Count</div>
          <q-toolbar>
            Every rank counts
            <q-space />
            <q-checkbox size="xl" v-model="allRanksCount" />
          </q-toolbar>
          <q-input
            v-if="!allRanksCount"
            outlined
            type="number"
            v-model="election.ballot.numberOfRanksCounting"
            label="Number of counting ranks"
          />
        </div>
        <q-btn @click="setSlide('distribution')" color="grey" class="q-mt-md">Nächster Schritt</q-btn>
      </q-carousel-slide>
      <q-carousel-slide name="distribution" class="column no-wrap flex-center">
        <q-icon name="style" size="56px" />
        <div class="q-mt-md text-center">
          <div class="q-mt-md">Set the number of points each rank receives</div>

          <div v-for="(i, key) in election.ballot.numberOfRanksCounting" :key="key">
            <q-input
              outlined
              type="number"
              v-model="election.ballot.points[key]"
              :label="'Points for rank ' + (key+1)"
            />
          </div>
        </div>
        <q-btn @click="setSlide('equalPositions')" color="grey" class="q-mt-md">Nächster Schritt</q-btn>
      </q-carousel-slide>
      <q-carousel-slide name="equalPositions" class="column no-wrap flex-center">
        <q-icon name="style" size="56px" />
        <div class="q-mt-md text-center">
          <div class="q-mt-md">Equal Positions</div>
          <q-toolbar>
            Are equal positions allowed?
            <q-space />
            <q-checkbox size="xl" v-model="election.ballot.equalPositionsAllowed"></q-checkbox>
          </q-toolbar>
        </div>
        <q-btn @click="setSlide('success')" color="grey" class="q-mt-md">Fertig</q-btn>
      </q-carousel-slide>
      <q-carousel-slide name="success" class="column no-wrap flex-center">
        <q-icon name="thumb_up" size="200px" />
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>
<script>
import Vue from "vue";
export default {
  name: "Ranking",
  props: ["candidates"],
  data() {
    return {
      allRanksCount: true,
      slide: "countingRanks",
      election: {
        candidates: this.candidates,
        ballot: {
          categorie: "Ranking",
          numberOfRanksCounting: this.candidates.length,
          points: [],
          equalPositionsAllowed: false
        }
      }
    };
  },
  created() {
    for (var i = 0; i < this.candidates.length; i++) {
      this.election.ballot.points.unshift(i + 1);
    }
  },
  methods: {
    setSlide(value) {
      this.slide = value;
      if (value == "success") {
        console.log("elections", this.election);
      }
    }
  }
};
</script>
<style scoped>
</style>