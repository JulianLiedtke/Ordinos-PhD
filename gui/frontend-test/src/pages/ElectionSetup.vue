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
      <q-carousel-slide name="begin" class="column no-wrap flex-center">
        <q-icon name="settings" color="primary" size="56px" />
        <div class="q-mt-md">Wahl konfigurieren</div>
        <q-btn @click="changeSlide('candidates')" color="grey" class="q-mt-md">Beginnen</q-btn>
      </q-carousel-slide>

      <q-carousel-slide name="candidates" class="column no-wrap flex-center">
        <q-icon name="person_pin" color="primary" size="56px" />
        <div class="q-mt-md">Fügen Sie die Kandidaten hinzu</div>

        <div v-for="(candidate, index) in candidates" :key="index">{{ candidate.name }}</div>

        <q-card flat bordered class="insert-candidate">
          <q-input outlined v-model="newCandidate.name" label="Name of the candidate" />
          <q-input outlined v-model="newCandidate.party" label="Party of the candidate" />
          <q-input outlined v-model="newCandidate.comment" label="Further comments" />
          <q-input
            outlined
            v-model="newCandidate.image"
            label="Link to a picture of the candidate"
          />
          <q-btn
            v-if="newCandidate.name != ''"
            @click="insertCandidate()"
            color="grey"
            class="q-mt-md"
          >Hinzufügen</q-btn>
        </q-card>

        <q-btn
          v-if="candidates.length > 0"
          @click="changeSlide('categorie')"
          color="grey"
          class="q-mt-md"
        >Nächster Schritt</q-btn>
      </q-carousel-slide>

      <q-carousel-slide name="categorie" class="column no-wrap flex-center">
        <q-icon name="category" color="primary" size="56px" />
        <div class="q-mt-md">Wählen Sie die Art der Wahl</div>

        <q-card flat bordered class="insert-candidate">
          <q-select outlined v-model="selectedCategory" :options="categories" label="Outlined" />
        </q-card>

        <q-btn
          v-if="selectedCategory != null"
          @click="changeSlide('detail')"
          color="grey"
          class="q-mt-md"
        >Nächster Schritt</q-btn>
      </q-carousel-slide>

      <q-carousel-slide name="detail" class="column no-wrap flex-center">
        <checkbox v-if="selectedCategory == 'Single or Multiple Choice'" :candidates="candidates"></checkbox>
        <rating v-else-if="selectedCategory == 'Rating'" :candidates="candidates"></rating>
        <ranking v-else-if="selectedCategory == 'Ranking'" :candidates="candidates"></ranking>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script>
export default {
  name: "PageIndex",
  components: {
    candidates: require("../components/Setup/InsertCandidates").default,
    checkbox: require("../components/Setup/Checkbox").default,
    rating: require("../components/Setup/Rating").default,
    ranking: require("../components/Setup/Ranking").default
  },
  data() {
    return {
      selectedCategory: null,
      categories: ["Single or Multiple Choice", "Ranking", "Rating"],
      newCandidate: {
        id: 0,
        name: "",
        party: "",
        comment: "",
        image: ""
      },
      slide: "begin",
      candidates: [
        {
          id: 0,
          name: "Hans Peter",
          party: "CDU",
          comment: "Super Mann",
          image: ""
        }
      ]
    };
  },
  computed: {},
  methods: {
    changeSlide(instruction) {
      this.slide = instruction;
    },
    insertCandidate() {
      var candidate = {
        id: this.newCandidate.id,
        name: this.newCandidate.name,
        party: this.newCandidate.party,
        comment: this.newCandidate.comment,
        image: this.newCandidate.image
      };
      this.candidates.push(candidate);
      this.newCandidate.id = this.newCandidate.id + 1;
      this.newCandidate.name = "";
      this.newCandidate.party = "";
      this.newCandidate.comment = "";
      this.newCandidate.image = "";
    }
  }
};
</script>

<style scoped>
.insert-candidate {
  width: 100%;
  max-width: 250px;
}
</style>