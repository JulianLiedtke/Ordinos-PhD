<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            :label= "$t('layout.header.ordinos')"
            @click="openOrdinosStart()"
            size="22px"
            flat
          />
        </q-toolbar-title>
        <LangSwitch />
      </q-toolbar>
      
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import LangSwitch from "../components/I18n/ComponentSwitch";

export default {
  name: "MainLayout",
  components: {
    LangSwitch,
  },
  data() {
    return {};
  },
  watch: {},
  methods: {
    /**
     * Back to Startpage
     */
    openOrdinosStart() {
      let route = this.$router.resolve({ path: "../PostVerification" });
      window.location = route.href;
      //window.open(route.href, "_blank");
    },
  }
};
</script>
