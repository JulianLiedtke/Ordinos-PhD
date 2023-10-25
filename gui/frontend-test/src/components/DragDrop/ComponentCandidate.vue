<template>
<div>
  <td class="text-left">
    <q-avatar>
        <img v-bind:src="candidate.avatar" />
    </q-avatar>
  </td>
  <td class="text-left"></td>
  <td>{{candidate.name}}</td>
  <td>
    <strong>{{candidate.party}}</strong>
  </td>
</div>
</template>

<script>
export default {
  name: "ComponentCandidate",

 data() {
    return {
      drop: false
    }
  },

  props: {
    candidate: {
      type: Object,
      required: true,
      default: {}
    },
  },
  methods:{}
} 

</script>
