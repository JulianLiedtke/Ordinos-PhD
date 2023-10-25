<template>
  <q-page class="q-ma-md">
    <h5>Multiple Choice</h5>
    <div>
      Max : {{this.maxNumberOfChoices}},
      Min : {{this.minNumberOfChoices}}
    </div>
    <q-list>
      <q-markup-table class="q-mb-lg">
        <tbody>
          <tr
            v-for="(candidate, id) in list"
            v-on:click="test(candidate.name)"
            :key="id"
            v-bind:class="
              choice.includes(candidate.name) ? 'bg-green-5' : 'white'
            "
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
            <td>
              <q-checkbox
                v-if="
                  choice.length >= maxNumberOfChoices &&
                    !choice.includes(candidate.name)
                "
                disable
                v-model="choice"
                :val="candidate.name"
              />
              <q-checkbox v-else v-model="choice" :val="candidate.name" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-list>
    <div class="q-px-sm q-mt-lg">
      Your selection is:
      <div v-for="(candidate, index) in choice" :key="index">
        <span>{{ candidate }}</span>
      </div>
      <q-btn
        v-if="
          choice.length >= minNumberOfChoices &&
            choice.length <= maxNumberOfChoices
        "
        label="Submit"
        type="submit"
        color="primary"
      />
    </div>
  </q-page>
</template>

<script>
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
    }
  },
  data: function() {
    return {
      choice: [],
      numberOfChoices: 0,
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
  computed: {
    toManyElected() {
      if (this.choice.length > this.numberOfChoices) {
        this.choice.splice(this.numberOfChoices, 1);
      }
    }
  },
  methods: {
    test(candidate) {
      if (this.choice.includes(candidate)) {
        console.log("ja");
        var index = this.choice.indexOf(candidate);
        this.choice.splice(index, 1);
      } else {
        if (this.choice.length < this.numberOfChoices) {
          this.choice.push(candidate);
        }
      }
    },
    newMinimum() {
      if (this.minNumberOfChoices > this.maxNumberOfChoices) {
        this.maxNumberOfChoices += 1;
      }
    },
    newMaximum() {
      if (this.maxNumberOfChoices < this.minNumberOfChoices) {
        this.minNumberOfChoices -= 1;
      }
    }
  }
}
</script>
