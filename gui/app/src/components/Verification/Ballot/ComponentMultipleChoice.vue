<template>
  <div class="q-mb-lg">
    <q-list>
      <q-markup-table>
        <tbody>
          <tr
            v-for="(candidate, id) in list"
            :key="id"
            v-bind:class="choices[id] == 1 ? 'bg-positive' : 'white'"
          >
            <td class="text-left">
              <q-avatar>
                <img v-bind:src="candidate.avatar" />
              </q-avatar>
            </td>
            <td>{{ candidate.name }}</td>
            <td>
              <strong>{{ candidate.party }}</strong>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-list>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "ComponentMultipleChoice",

  props: {
    minNumberOfChoices: {
      type: Number,
      required: true,
      default: 1
    },
    maxNumberOfChoices: {
      type: Number,
      required: true,
      default: 1
    },
    list: {
      type: Array,
      required: true,
      default: []
    }
  },
  data: function() {
    return {
      choices: this.getChoices()
    };
  },
  methods: {
    ...mapGetters("storeConfig", ["getChoices"])
  }
};
</script>
