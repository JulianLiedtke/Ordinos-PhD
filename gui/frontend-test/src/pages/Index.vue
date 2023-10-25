<template>
  <q-page class="flex flex-center">
    <!-- <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" /> -->
    <q-btn v-on:click="tfunc">Test</q-btn>
    <p>{{ this.test }}</p>
  </q-page>
</template>

<script>
import Paillier from "components/Paillier";

export default {
  name: "PageIndex",
  data() {
    return {
      test: "Davor"
    };
  },
  methods: {
    async tfunc() {
      var keys = await Paillier.keyGen(1);

      var plain = 1;
      console.log(plain);
      var einmal = Paillier.encrypt(0, keys.public, plain, 236);
      console.log("Einmal: " + einmal);
      var zweimal = Paillier.encrypt(0, keys.public, einmal, 253);
      console.log("Zweimal: " + zweimal);

      var de1 = Paillier.decrypt(keys.public, keys.private, zweimal);
      console.log("DE1: " + de1);
      //var de2 = Paillier.decrypt(keys.public, keys.private, de1);
      //console.log("DE2: " + de2);
    }
  }
};
</script>
