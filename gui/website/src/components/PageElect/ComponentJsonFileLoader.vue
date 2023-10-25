<!--
  This component is a JSON File Reader.
  It shows a file input dialog and loads the selected file.

  Events:
    - load : File has been loaded
-->
<template>
  <div>
    <q-card class="card-middle">
      <q-card-section class="bg-accent">{{ $t('ComponentJsonFileLoader.headline') }}</q-card-section>
      <q-card-section>
        {{ $t('ComponentJsonFileLoader.field') }}
        <br />
        <br />
        {{ $t('ComponentJsonFileLoader.openfile')}}
      </q-card-section>
      <q-card-section id="file-reader">
        <q-file outlined v-model="file" @update:model-value="loadTextFromFile">
          <template v-slot:prepend>
            <q-icon name="attach_file" />
            <q-icon
              v-if="getDemoMode()"
              id="introduction-btn"
              class="pulse-intro"
              color="primary"
              size="xl"
              name="arrow_backward"
            />
          </template>
        </q-file>
      </q-card-section>
    </q-card>
    <introduction v-if="getDemoMode()"></introduction>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions, mapGetters } from "vuex";
import DemoConfig from "components/PageElect/DemoConfig";
import introduction from "./Introduction";

export default {
  name: "ComponentJsonFileLoader",
  components: {
    introduction,
  },

  data() {
    return {
      file: null,
      config: null,
    };
  },

  created() {
    this.setStep("file"); // Set step for current point in tutorial
  },

  emits: [
    "load"
  ],

  methods: {
    ...mapActions("storeConfig", [
      "updateElection",
      "setCommunication",
      "setEvaluation",
      "setPaillierPublicKey",
      "setPaillierBits",
      "setBallot",
      "setCandidates",
      "setStep",
    ]),
    ...mapGetters("storeConfig", [
      "getDemoMode",
      "getEvaluation"
      ]),

    /**
     * Called when a file has been selected
     */
    loadTextFromFile() {
      const reader = new FileReader();
      reader.onload = (e) => this.eventFileLoaded(e.target.result);
      reader.readAsText(this.file); // Read file
    },

    /**
     * Called when FileReader successfully read a file.
     * Parses input for JSON and stores the data
     *
     * @event
     * @emits load
     * @param {string} fileContent
     */
    eventFileLoaded(fileContent) {
      //  Load ConfigFile from BB Server
      let participation_conformation = JSON.parse(fileContent);
      axios.get(participation_conformation.config_adress)
      .then((response) => {
        this.config = response.data;

        /* 
          TODO for futher projects: remove/replace voter id fully
          voter id is still used by some tools like the diagnose.js but not needed for election process
          but is not needed anymore since for now the voter can be identified
          with the hash of the secret ()
          we didnt have time to do so, sry
        */
        this.config.election["voterId"] = "1";
        
        this.config.election["secret"] = participation_conformation.secret;
        this.updateElection(this.config.election);
        this.setCommunication(this.config.communication);
        this.setPaillierPublicKey(this.config.encryption.publicKey);
        this.setPaillierBits(this.config.encryption.bits);
        this.setBallot(this.config.ballot);
        this.setEvaluation(this.config.evaluation);
        if (this.getDemoMode()) {
          this.setCandidates(DemoConfig.candidates);
        } else {
          this.setCandidates(this.config.candidates);
        }
        this.$emit("load");
      })
      .catch((error) => {
          this.$q.notify({
          type: "negative",
          position: "top",
          message: this.$t('ComponentJsonFileLoader.error_config')
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
#introduction-btn {
  position: absolute;
  right: 0px;
}
</style>