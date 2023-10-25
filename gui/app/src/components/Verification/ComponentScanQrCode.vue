<template>
  <q-page class="q-ma-sm">
    <q-card class="card-loading">
      <q-card-section class="bg-accent">
        {{ $t('ComponentScanQrCode.scan_code') }}
      </q-card-section>
      <q-card-section v-if="!cameraReady" align="center">
        <q-spinner-puff color="primary" size="10em" />
      </q-card-section>
      <q-card-section align="center">
        <qrcode-stream
          v-if="camera"
          v-on:init="onInit"
          v-on:decode="onDecode"
        ></qrcode-stream>
        <div v-else>
          <p>{{ $t('ComponentScanQrCode.no_camera_permission') }}</p>
          <q-btn v-on:click="checkCameraPermission">{{ $t('ComponentScanQrCode.give_permission') }}</q-btn>
        </div>
      </q-card-section>
    </q-card>
    <q-footer>
      <q-tabs>
        <q-route-tab
          :label="$t('ComponentScanQrCode.back')"
          icon="keyboard_backspace"
          to="/PostVerification"
        />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script>
import { mapActions } from "vuex";
import { QrcodeStream } from "vue3-qrcode-reader";

export default {
  name: "ComponentScanQrCode",
  data() {
    return {
      camera: false,
      cameraReady: false,
    };
  },
  components: {
    QrcodeStream,
  },
  beforeRouteLeave() {
    this.camera = false;
    this.cameraReady = false;
  },
  created() {
    this.checkCameraPermission();
    this.cameraReady = false;
  },
  emits: [
    "decode"
  ],
  methods: {
    ...mapActions("storeConfig", ["setSecurity"]),

    /**
     * Checks if app has permission for the camera for android devices
     */
    checkCameraPermission() {
      // Only on ANDROID devices
      if (this.$q.platform.is.android) {
        var permissions = cordova.plugins.permissions;
        // Check if app has permission for CAMERA
        permissions.hasPermission(permissions.CAMERA, (status) => {
          if (!status.hasPermission) {
            // Request permission for CAMERA
            permissions.requestPermission(permissions.CAMERA, success, error);

            function error() {
              alert($t('ComponentScanQrCode.camera_authorization_error'));
            }

            function success(status) {
              if (status.hasPermission) location.reload();
              else error();
            }
          } else {
            // App has permission, start scanner
            this.camera = true;
          }
        });
      } else {
        this.camera = true;
      }
    },

    /**
     * Emitted when scanner has scanned a code
     *
     * @event
     */
    onDecode(decodedString) {
      if (decodedString != "") {
        this.$emit("decode", decodedString);
      }
    },

    /**
     * Emitted when scanner camera is initialized.
     * Alerts possible errors.
     *
     * @event
     */
    async onInit(promise) {
      this.cameraReady = true;
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          alert(error.name);
        } else if (error.name === "NotFoundError") {
          alert(error.name);
        } else if (error.name === "NotSupportedError") {
          alert(error.name);
        } else if (error.name === "NotReadableError") {
          alert(error.name);
        } else if (error.name === "OverconstrainedError") {
          alert(error.name);
        } else if (error.name === "StreamApiNotSupportedError") {
          alert(error.name);
        }
      }
    },
  },
};
</script>
