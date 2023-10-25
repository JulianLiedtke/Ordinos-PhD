<template>
  <div>
    <q-card class="card-middle">
      <q-card-section class="bg-accent"> QR-Code Scannen </q-card-section>
      <q-card-section>
        {{ $t('ComponentShowQRCode.scan_code')}}
      </q-card-section>
      <q-separator />
      <q-card-section align="center">
        <vue-qrious v-bind:value="qrPayload" v-bind:size="size"></vue-qrious>
      </q-card-section>
    </q-card>
    <introduction v-if="getDemoMode()"></introduction>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import VueQrious from "vue-qrious";
import introduction from "./Introduction";

export default {
  name: "ComponentShowQrCode",

  created() {
    this.setStep("qr-code"); // Set step for current point in tutorial
  },
  data() {
    return {
      size: 300,
    };
  },

  components: {
    VueQrious,
    introduction,
  },

  props: {
    peerToPeerId: {
      type: String,
      required: true,
    },
  },

  methods: {
    ...mapGetters("storeConfig", [
      "getVvdSecurity",
      "getCommunication",
      "getDemoMode",
    ]),
    ...mapActions("storeConfig", ["setStep"]),
  },

  computed: {
    /**
     * A computed property that returns the data for the QR code
     *
     * @return {object}
     */
    qrPayload() {
      var data = {
        hostId: this.peerToPeerId,
        peerServerIP: this.getCommunication().peerServerIP,
        key: this.getVvdSecurity().key,
        nonce: this.getVvdSecurity().nonce,
      };
      return JSON.stringify(data);
    },
  },
};
</script>
