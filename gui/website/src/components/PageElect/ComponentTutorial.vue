<template>
  <div>
    <q-carousel
      v-model="slide"
      swipeable
      animated
      v-bind:padding="true"
      v-bind:vertical="false"
      v-bind:arrows="true"
      v-bind:navigation="true"
      control-color="primary"
      height="700px"
      class="bg-white text-primary rounded-borders"
    >
      <!-- Slide: Load config file -->
      <q-carousel-slide name="file" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="attach_file" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.step_one') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.open_election_file') }}
          <br />
          <br />Klicken Sie hierfür auf das vorgesehene Feld, worauf sich ein
          <strong>{{ $t('ComponentTutorial.file_window') }}</strong> {{ $t('ComponentTutorial.will_open') }}
          <br />
          <strong>{{ $t('ComponentTutorial.open_election_file')}}</strong> 
          {{ $t('ComponentTutorial.next_step') }}
        </div>
      </q-carousel-slide>

      <!-- Slide: Scan QR code -->
      <q-carousel-slide name="qr-code" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="camera_alt" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.step_two') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.code_on_screen') }}
          <br />
          <br />{{ $t('ComponentTutorial.open') }} <strong>Ordinos App</strong> 
          {{ $t('ComponentTutorial.on_your_phone') }}
          <strong>{{ $t('ComponentTutorial.scan_code') }}</strong>
        </div>
      </q-carousel-slide>

      <!-- Slide: Connect VVD -->
      <q-carousel-slide name="connection" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="devices" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.step_three') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.do_nothing') }}
          <br /> {{ $t('ComponentTutorial.connection') }}
          <br /> {{ $t('ComponentTutorial.verification') }}
        </div>
      </q-carousel-slide>

      <!-- Slide: Vote -->
      <q-carousel-slide name="ballot" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="ballot" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.step_four') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.fill_out_ballot') }}
          <br />
          <strong>{{ $t('ComponentTutorial.further_details') }}</strong> 
          {{ $t('ComponentTutorial.appropriate_places') }}
          <br />
          <br />{{ $t('ComponentTutorial.after_voting') }}
          <strong>{{ $t('ComponentTutorial.ballot_encrypted') }}</strong>
        </div>
      </q-carousel-slide>

      <!-- Slide: Audit -->
      <q-carousel-slide name="audit" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="device_unknown" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.step_five') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          <br /> {{ $t('ComponentTutorial.send_or_test') }}
          <br />
          <br />
          <strong>{{ $t('ComponentTutorial.smartphone_test') }}</strong>
          <br />
          <br /> {{ $t('ComponentTutorial.guarantee_security') }}
          <strong>{{ $t('ComponentTutorial.new_filling') }}</strong>. 
          {{ $t('ComponentTutorial.test_or_send') }}
          <strong>{{ $t('ComponentTutorial.recommend_test_several_times') }}</strong>
        </div>
      </q-carousel-slide>

      <!-- Slide: Submit -->
      <q-carousel-slide name="submit" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="mail" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.step_six') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
         {{ $t('ComponentTutorial.displayed_on_phone') }}
          <br />
          <br /> {{ $t('ComponentTutorial.app_will_notify') }}
          <br />  {{ $t('ComponentTutorial.app_checks') }}
        </div>
      </q-carousel-slide>

      <!-- Slide: Demo mode -->
      <q-carousel-slide name="demo" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="how_to_vote" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.demo_mode') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.start_demo_text') }}
          <br />
          <br />
          <q-btn
            :label="$t('ComponentTutorial.start_demo_mode')"
            @click="dialogConfirmStartDemo = true"
          />
        </div>
      </q-carousel-slide>

      <q-carousel-slide
        name="moreinformation"
        class="column no-wrap flex-center"
      >
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="info" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.more_information') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.know_more_about_ordinos') }}
          <q-btn
            flat
            class="link-button"
            :label="$t('ComponentTutorial.here')"
            @click="moreInformation()"
          />. {{ $t('ComponentTutorial.open_page_afterwards') }}
        </div>
      </q-carousel-slide>

      <!-- Slide: Close / Info -->
      <q-carousel-slide name="info" class="column no-wrap flex-center">
        <div class="absolute-top-right">
          <q-btn flat icon="close" size="m" v-close-popup />
        </div>
        <q-icon name="info" size="100px" color="accent" />
        <q-card-section>
          <div class="text-h6">{{ $t('ComponentTutorial.info') }}</div>
        </q-card-section>
        <div class="q-mt-md text-center">
          {{ $t('ComponentTutorial.call_instructions_again') }}
          <br />
          <br />
          <q-btn :label="$t('ComponentTutorial.close')" @click="closeTutorial()" />
        </div>
      </q-carousel-slide>
    </q-carousel>

    <!-- Confirmation dialog for entering Demo Mode -->
    <q-dialog v-model="dialogConfirmStartDemo">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="exit_to_app" color="primary" text-color="white" />
          <span class="q-ml-sm"> {{ $t('ComponentTutorial.question_start_demo') }} </span>
        </q-card-section>
        <q-card-section class="row items-center">
          {{ $t('ComponentTutorial.reset_election') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('ComponentTutorial.cancel')" color="primary" v-close-popup />
          <q-btn
            v-close-popup
            v-on:click="startDemoMode"
            :label="$t('ComponentTutorial.start_demo')"
            color="primary"
            flat
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

import Diagnose from "components/Diagnose";

export default {
  name: "Tutorial-Ordinos",
  emits: ['closeTutorial'],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      slide: this.getStep(),
      dialogConfirmStartDemo: false, // Confirmation dialog for entering Demo Mode
    };
  },

  created() {
    Diagnose.endTimer();
    Diagnose.startTimer("Tutorial");
  },

  beforeUnmount() {
    Diagnose.endTimer();
    Diagnose.startTimer("Continue where? Step " + this.getStep());
  },

  methods: {
    ...mapGetters("storeConfig", ["getStep"]),
    ...mapActions("storeConfig", ["setDemoMode"]),

    /**
     * Close the tutorial popup
     */
    closeTutorial() {
      this.$emit('closeTutorial');
    },

    /**
     * Start the demo mode
     */
    startDemoMode() {
      this.closeTutorial();
      this.setDemoMode(true);
    },

    /**
     * Opens a page where ordinos is explained more detailled in a new tab
     */
    moreInformation() {
      let route = this.$router.resolve({ path: "../OrdinosExplained" });
      window.open(route.href, "_blank");
    },
  },
};
</script>