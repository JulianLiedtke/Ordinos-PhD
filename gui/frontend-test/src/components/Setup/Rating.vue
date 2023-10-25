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
      <q-carousel-slide name="points" class="column no-wrap flex-center">
        <q-icon name="style" size="56px" />
        <div class="q-mt-md text-center">
          <div class="q-mt-md">All about points</div>
          <q-toolbar>
            Total points:
            <q-space />
            <q-input type="number" v-model="election.ballot.points" />
          </q-toolbar>
          <q-toolbar>
            Spread this points between the candidates
            <q-space />
            <q-checkbox v-model="election.ballot.spreadPoints" />
          </q-toolbar>
          <q-toolbar>
            Draw allowed
            <q-space />
            <q-checkbox v-model="election.ballot.drawAllowed" />
          </q-toolbar>
          <q-toolbar>
            All points have to be assigned
            <q-space />
            <q-checkbox v-model="election.ballot.assignAllPoints" />
          </q-toolbar>
          <q-toolbar v-if="!election.ballot.assignAllPoints">
            what is the minimum number of points to be assigned
            <q-space />
            <q-input type="number" v-model="election.ballot.minPointsToAssign" />
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
  name: "Rating",
  props: ["candidates"],
  data() {
    return {
      allRanksCount: true,
      slide: "points",
      election: {
        candidates: this.candidates,
        ballot: {
          categorie: "Ranking",
          points: 100,
          spreadPoints: true,
          drawAllowed: true,
          assignAllPoints: true,
          minPointsToAssign: 100
        }
      }
    };
  },
  created() {},
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