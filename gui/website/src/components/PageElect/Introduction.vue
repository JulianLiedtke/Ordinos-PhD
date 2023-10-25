<template>
  <div v-if="getStep() == 'file'">
    <q-card class="card-right" style="margin-top: -7%">
      <q-btn icon="library_books" flat />
      <p>
        {{ $t('Introduction.click_on_white_box') }}
      </p>
    </q-card>
  </div>
  <div v-else-if="getStep() == 'qr-code'">
    <q-card class="card-right" style="margin-top: -20%">
      <q-btn icon="library_books" flat />
      <p>
        $t('Introduction.open_app')
      </p>
    </q-card>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "Introduction-Ordinos",

  methods: {
    ...mapGetters("storeConfig", ["getStep"]),

    /**
     * sets the position of the introduction-button
     */
    setIntroductionButton() {
      document.getElementById("introduction-btn").style.left =
        this.positions[0] + "px";

      document.getElementById("introduction-btn").style.top =
        this.positions[1] + "px";
    },
  },
};
</script>
