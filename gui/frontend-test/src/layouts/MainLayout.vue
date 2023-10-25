<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label header class="text-grey-8">
          Essential Links
        </q-item-label>
        <q-item
          v-for="nav in navigations"
          :key="nav.label"
          :to="nav.to"
          exact
          clickable
        >
          <q-item-section avatar>
            <q-icon :name="nav.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ nav.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",

  data() {
    return {
      leftDrawerOpen: false,
      navigations: [
        {
          label: "Main",
          to: "/",
          icon: "home"
        },
        {
          label: "Single Choice",
          to: "/single",
          icon: "info"
        },
        {
          label: "Multiple Choice",
          to: "/multiple",
          icon: "info"
        },
        {
          label: "Ranking",
          to: "/ranking",
          icon: "info"
        },
        {
          label: "Rating",
          to: "/rating",
          icon: "info"
        },
        {
          label: "Setup",
          to: "/setup",
          icon: "info"
        },
        {
          label: "Benchmark",
          to: "/election",
          icon: "info"
        },
        {
          label: "Ballot",
          to: "/ballot",
          icon: "info"
        },
        {
          label: "Drag Drop",
          to: "/dragdrop",
          icon: "info"
        },
        {
          label: "ZKP",
          to: "/ZKP",
          icon: "info"
        }
      ]
    };
  }
};
</script>
