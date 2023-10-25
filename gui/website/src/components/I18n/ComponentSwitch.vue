<template>
  <div>
    <q-btn-dropdown push flat>
      <template v-slot:label>
        <div class="row items-center no-wrap">
          <country-flag :country="flag" size="small" />
        </div>
      </template>
      <q-list>
        <q-item clickable v-close-popup @click="changeLocal('de')">
          <q-item-section avatar>
            <country-flag country="de" size="small" />
          </q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="changeLocal('en')">
          <q-item-section avatar>
            <country-flag country="gb" size="small" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>
<style>
/* Costum styles for the creation form */
</style>
<script>
import CountryFlag from "vue-country-flag-next";

export default {
  name: "ComponentSwitch",
  components: {
    CountryFlag,
  },
  watch: {
    lang(lang) {
      this.$i18n.locale = lang;
    },
  },
  created() {
    this.flag = this.flagFromLocalCode(this.lang)
  },
  data() {
    return {
      flag: this.$i18n.locale, //passt solange de default ist
      lang: this.$i18n.locale,
    };
  },
  methods: {
    changeLocal(localCode) {
      this.lang = localCode;
      this.flag = this.flagFromLocalCode(localCode);
    },
    flagFromLocalCode(code) {
      switch(code) {
        case "de":
          return "de"
        case "en":
          return "gb"
        default:
           return code
      } 
    }
  },
};
</script>