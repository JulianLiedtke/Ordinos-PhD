<template>
  <q-page class="q-ma-md">
    <h5>Single Choice</h5>
    <q-list>
      <q-markup-table class="q-mb-lg">
        <tbody>
          <tr
            v-for="(candidate, id) in list"
            v-on:click="test(candidate.name)"
            :key="id"
            v-bind:class="choice == candidate.name ? 'bg-green-5' : 'white'"
          >
            <td class="text-left">
              <q-avatar>
                <img v-bind:src="candidate.avatar" />
              </q-avatar>
            </td>
            <td>{{candidate.name}}</td>
            <td>
              <strong>{{candidate.party}}</strong>
            </td>
            <td>
              <q-radio v-model="choice" v-bind:val="candidate.name" size="lg" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-item v-for="(candidate, id) in list" :key="id">
        <q-item-section avatar>
          <q-radio v-model="choice" v-bind:val="candidate.name" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{candidate.name}}</q-item-label>
          <q-item-label>{{candidate.party}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <div class="q-px-sm q-mt-lg">
      Your selection is:
      <strong>{{ choice }}</strong>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "PageIndex",

  data: function() {
    return {
      choice: "",
      list: [
        {
          name: "Candidate A",
          party: "SPD",
          avatar:
            "https://icons.iconarchive.com/icons/diversity-avatars/avatars/1024/batman-icon.png"
        },
        {
          name: "Candidate B",
          party: "CDU",
          avatar: "https://cdn.quasar.dev/img/avatar.png"
        },
        {
          name: "Candidate C",
          party: "BüSo",
          avatar: "https://avatarfiles.alphacoders.com/125/thumb-125254.png"
        }
      ]
    };
  },
  methods: {
    test(candidate) {
      this.choice = candidate;
    }
  }
};
</script>
