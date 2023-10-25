<template>
  <q-file outlined v-model="file" @input="loadTextFromFile">
    <template v-slot:prepend>
      <q-icon name="attach_file" />
    </template>
  </q-file>
</template>

<script>
/**
 * This component is a JSON File Reader.
 * It shows a file input dialog and loads selected file.
 *
 * Events:
 * - load : File has been loaded
 */
import { mapActions } from "vuex";
export default {
  name: "ComponentLoadBallot",
  components: {
    FileReader
  },

  props: {
    title: {
      type: String,
      required: false,
      default: ""
    }
  },
  data() {
    return {
      file: null,
      config: null
    };
  },
  methods: {
    ...mapActions("storeConfig", ["setBallot", "setCandidates"]),
    /**
     * Called when QFile successfully read a file.
     *
     * @emits load
     */
    loadTextFromFile() {

      const reader = new FileReader();


      reader.onload = e => this.eventFileLoaded(e.target.result);


      reader.readAsText(this.file);
    },
    /**
     * Called when FileReader successfully read a file.
     * Parses input for JSON and stores the data
     *
     * @emits load
     * @param {string} fileContent
     */
    eventFileLoaded(fileContent) {
      this.config = JSON.parse(fileContent);
      console.log("config: " + this.config.candidates);
      this.setCandidates(this.config.candidates);
      this.setBallot(this.config.ballot);
      this.$emit("load");
    }
  }
};
</script>
