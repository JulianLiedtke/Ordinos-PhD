<template>
  <div class="q-mb-lg">
    <q-markup-table>
      <tbody>
        <tr v-for="(candidate, id) in list" :key="id">
          <td style="font-size:11pt">{{ $t('ComponentRating.points') }} {{ choices[id] }}</td>
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
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ComponentRating",

  props: {
    allowDraw: {
      type: Boolean,
      required: true,
      default: true
    },
    spreadPointsAcross: {
      type: Boolean,
      required: true,
      default: true
    },
    minNumberOfChoices: {
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
      choices: this.getChoices(),
      color: "positive"
    };
  },

  methods: {
    ...mapGetters("storeConfig", ["getChoices"])
  }
};
</script>
