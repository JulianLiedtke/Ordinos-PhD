<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn
            :label="$t('layout.header.ordinos')"
            @click="openOrdinosStart()"
            size="22px"
            flat
          />
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn
          icon="add"
          :label="$t('layout.main.create')"
          flat
          @click="openCreateElection()"
        />
        <q-btn
          icon="camera_front"
          :label="$t('layout.main.elections')"
          flat
          @click="openCurrentElections()"
        />
        <q-btn
          icon="info"
          :label="$t('layout.main.info')"
          flat
          @click="openOrdinosExplanation()"
        />
        <q-btn
          icon="library_books"
          :label="$t('layout.main.instruction')"
          flat
          @click="openTutorial()"
        />
        <LangSwitch />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-dialog v-model="tutorialData.dialog">
        <tutorial
          v-if="tutorialData.showTutorial"
          :data="tutorialData"
        ></tutorial>
      </q-dialog>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import tutorial from "../components/PageElect/ComponentTutorial";
import LangSwitch from "../components/I18n/ComponentSwitch";

export default {
  name: "MainLayout",
  components: {
    tutorial,
    LangSwitch,
  },
  data() {
    return {
      tutorialData: {
        showTutorial: false,
        dialog: false,
      },
    };
  },
  methods: {
    /**
     * Tutorial is opened
     */
    openTutorial() {
      this.tutorialData.dialog = true;
      this.tutorialData.showTutorial = true;
    },

    /**
     * Back to Startpage
     */
    openOrdinosStart() {
      let route = this.$router.resolve({ path: "../" });
      window.location = route.href;
      //window.open(route.href, "_blank");
    },

    /**
     * Explanation for Ordinos opens
     */
    openOrdinosExplanation() {
      let route = this.$router.resolve({ path: "../OrdinosExplained" });
      window.location = route.href;
      //window.open(route.href, "_blank");
    },

    /**
     * Explanation for Ordinos opens in a new tab
     */
    openCreateElection() {
      let route = this.$router.resolve({ path: "../CreateElection" });
      window.location = route.href;
      //window.open(route.href, "_blank");
    },

    /**
     * Explanation for Ordinos opens in a new tab
     */
    openCurrentElections() {
      let route = this.$router.resolve({ path: "../CurrentElections" });
      window.location = route.href;
      //window.open(route.href, "_blank");
    },
  },
};
</script>
