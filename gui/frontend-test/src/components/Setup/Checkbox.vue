<template>
  <div class="q-gutter-md">
    <q-carousel
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      animated
      control-color="white"
      padding
      height="100%"
    >
      <q-carousel-slide name="select" class="column no-wrap flex-center">
        <q-icon name="style" size="56px" />
        <div class="q-mt-md text-center">
          <div class="q-mt-md">Single or Multiple Choice</div>
          <q-btn @click="setSlide('success')" color="grey" class="q-mt-md">Single Choice</q-btn>
          <q-btn @click="setSlide('setNumbers')" color="grey" class="q-mt-md">Multiple Choice</q-btn>
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="setNumbers" class="column no-wrap flex-center">
        <q-icon name="style" size="56px" />
        <div class="q-mt-md text-center">
          Select the minimum and maximum number of candidates that must be elected for a valid vote.
          <q-input
            outlined
            type="number"
            v-model="election.ballot.minNumberOfChoices"
            label="Minimum"
          />
          <q-input
            outlined
            type="number"
            v-model="election.ballot.maxNumberOfChoices"
            label="Maximum"
          />
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
  name: "Checkbox",
  props: ["candidates"],
  data() {
    return {
      slide: "select",
      election: {
        candidates: this.candidates,
        ballot: {
          categorie: "Single Or Multiple Choice",
          minNumberOfChoices: 1,
          maxNumberOfChoices: 1
        }
      }
    };
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