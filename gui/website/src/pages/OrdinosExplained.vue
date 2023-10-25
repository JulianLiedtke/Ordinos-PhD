
<template>
  <div class="OrdinosExplained">
    <div class="text-justify">
      <br />
      <q-card class="card-middle">
        <q-card-section class="bg-accent"> {{ $t('OrdinosExplained.table_of_contents_title') }}</q-card-section>
        <q-card-section>
          {{ $t('OrdinosExplained.click_on_title') }}
          <br />
          <button style="  
            background-color: white; 
            border: none;
            color: black;
            padding: 15px 32px;
            text-decoration: none;
            display: inline-block;" @click="goto('section_what_is_ordinos')">1. {{
            $t('OrdinosExplained.what_is_ordinos')
            }}</button>
          <br />
          <button style="  
            background-color: white; 
            border: none;
            color: black;
            padding: 15px 32px;
            text-decoration: none;
            display: inline-block;" @click="goto('section_how_to_use_ordinos')">2. {{
            $t('OrdinosExplained.how_to_use_ordinos') }}</button>
          <br />
          <button style="  
            background-color: white; 
            border: none;
            color: black;
            padding: 15px 32px;
            text-decoration: none;
            display: inline-block;" @click="goto('section_the_architectur_of_ordinos')">3. {{
            $t('OrdinosExplained.backend_title') }}</button>
        </q-card-section>
      </q-card>
      <br />
      <br />
    <div class="div" ref="section_what_is_ordinos"></div>
    <q-card class="card-middle">
      <q-card-section class="bg-accent">1. {{ $t('OrdinosExplained.what_is_ordinos') }}</q-card-section>
      <q-card-section>
        {{ $t('OrdinosExplained.security_properties') }}
        <q-btn flat dense no-caps stack size="12px" label="verifiability" color="black" @click="verifiability = true">
        </q-btn>
        <q-dialog v-model="verifiability">
          <q-card>
            <q-card-section>
              <div class="text-h6">Verifiability</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{ $t('OrdinosExplained.verifiability_definition') }}
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
        ,
        <q-btn flat dense no-caps stack size="12px" label="accountability" color="black" @click="accountability = true">
        </q-btn>
        <q-dialog v-model="accountability">
          <q-card>
            <q-card-section>
              <div class="text-h6">Accountability</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{ $t('OrdinosExplained.accountability_definition') }}
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
        {{ $t('OrdinosExplained.and') }}
        <q-btn flat dense no-caps stack size="12px" label="vote privacy" color="black" @click="vote_privacy = true">
        </q-btn>
        <q-dialog v-model="vote_privacy">
          <q-card>
            <q-card-section>
              <div class="text-h6">Vote privacy</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{ $t('OrdinosExplained.vote_privacy_definition') }}
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
        .
        <br />
        <br />
        {{ $t('OrdinosExplained.helios_and_tally_hiding') }}
        <br />
        <br />
        {{ $t('OrdinosExplained.tally_hiding_description') }}
        <br />
      </q-card-section>
    </q-card>
    <br />
    <br />
    <div class="div" ref="section_how_to_use_ordinos"></div>
    <q-card class="card-middle">
      <q-card-section class="bg-accent">2. {{ $t('OrdinosExplained.how_to_use_ordinos') }}</q-card-section>
      <q-card-section>
        {{ $t('OrdinosExplained.how_to_use_introduction') }}
      </q-card-section>
      <q-card-section>
        <q-separator></q-separator>
        <br />
        <strong> {{ $t('OrdinosExplained.website_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.website_description') }}
        <br />
        <br />
        <strong> {{ $t('OrdinosExplained.tutorial_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.tutorial_description') }}
        <br />
        <br />
        <strong> {{ $t('OrdinosExplained.loading_election_file_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.loading_election_file_description') }}
        <br />
        <figure align='center'>
          <img :src="require('assets/Figure_1.jpg')" height="250">
          <figcaption>{{ $t('OrdinosExplained.figure_1') }}</figcaption>
        </figure>
        <br />
        <br />
        <strong> {{ $t('OrdinosExplained.scanning_qr_code_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.scanning_qr_code_description') }}
        <br />
        <figure align='center'>
          <img :src="require('assets/Figure_2.jpg')" height="300">
          <figcaption>{{ $t('OrdinosExplained.figure_2') }}</figcaption>
        </figure>
        <br />
        <br />
        <strong> {{ $t('OrdinosExplained.election_page_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.election_page_description') }}
        <br />
        <br />
        {{ $t('OrdinosExplained.multiple_choice_title') }}
        <br />
        <br />
        {{ $t('OrdinosExplained.multiple_choice_description') }}
        <br />
        <figure align='center'>
          <img :src="require('assets/Figure_3.jpg')" height="300">
          <figcaption>{{ $t('OrdinosExplained.figure_3') }}</figcaption>
        </figure>
        <br />
        <br />
        {{ $t('OrdinosExplained.rating_title') }}
        <br />
        <br />
        {{ $t('OrdinosExplained.rating_description') }}
        <figure align='center'>
          <img :src="require('assets/Figure_4.jpg')" height="300">
          <figcaption>{{ $t('OrdinosExplained.figure_4') }}</figcaption>
        </figure>
        <br />
        <br />
        {{ $t('OrdinosExplained.ranking_title') }}
        <br />
        <br />
        {{ $t('OrdinosExplained.ranking_description_1') }}
        <figure align='center'>
          <img :src="require('assets/Figure_5.jpg')" height="300">
          <figcaption>{{ $t('OrdinosExplained.figure_5') }}</figcaption>
        </figure>
        <br />
        {{ $t('OrdinosExplained.ranking_description_2') }}
        <figure align='center'>
          <img :src="require('assets/Figure_6.jpg')" height="300">
          <figcaption>{{ $t('OrdinosExplained.figure_6') }}</figcaption>
        </figure>
        <br />
        <br />
        <strong> {{ $t('OrdinosExplained.encryption_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.encryption_description') }}
        <center>
          <template center v-for="item in figure_7">
            <img class="image" :src="item.image_path" height="300" />
          </template>
        </center>
        <center> {{ $t('OrdinosExplained.figure_7') }} </center>
        <br />
        <br />
        <strong> {{ $t('OrdinosExplained.audit_or_submit_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.audit_or_submit_description') }}
        <br />
        {{ $t('OrdinosExplained.encryption_description') }}
        <figure align='center'>
          <img :src="require('assets/Figure_8.jpg')" height="300">
          <figcaption>{{ $t('OrdinosExplained.figure_8') }}</figcaption>
        </figure>
      </q-card-section>

      <q-card-section>
        <q-separator></q-separator>
        <br />
        <strong> {{ $t('OrdinosExplained.app_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.app_description') }}
        <br />
        <center>
          <template center v-for="item in figure_9">
            <img class="image" :src="item.image_path" height="300" />
          </template>
        </center>
        <center> {{ $t('OrdinosExplained.figure_9') }} </center>
        <br />
        <strong> {{ $t('OrdinosExplained.audit_title') }} </strong>
        <br />
        <br />
        {{ $t('OrdinosExplained.audit_description') }}
        <br />
        <center>
          <template center v-for="item in figure_10">
            <img class="image" :src="item.image_path" height="300" />
          </template>
        </center>       
        <center> {{ $t('OrdinosExplained.figure_10') }} </center>
      </q-card-section>
    </q-card>
    <br />
    <br />
    <div class="div" ref="section_the_architectur_of_ordinos"></div>
    <q-card class="card-middle">
      <q-card-section class="bg-accent">3. {{ $t('OrdinosExplained.backend_title') }}</q-card-section>
      <q-card-section>
        {{ $t('OrdinosExplained.backend_description') }}
        <q-btn flat dense no-caps stack size="12px" :label="$t('OrdinosExplained.here')"
          @click="openArchitectureExplanation()" />
        .
      </q-card-section>
    </q-card>
  </div>
  </div>
</template>


<script>
// Vue Components

// Javascript Libraries

// Extern Javascript Libraries

import { ref } from 'vue'

export default {
  methods: {
    /**
     * Page jumping when clicking on title of table of contents
     */
    goto(refName) {
      var element = this.$refs[refName];
      var top = element.offsetTop;

      window.scrollTo(0, top);
    },
    /**
     * Explanation for Architecture opens
     */
    openArchitectureExplanation() {
      let route = this.$router.resolve({ path: "../ArchitectureExplained" });
      window.location = route.href;
      //window.open(route.href, "_blank");
    },
  },
  /**
   * Opens pop-up window with the definition of a word in the Ordinos descritpion
   */
  setup() {
    return {
      verifiability: ref(false),
      accountability: ref(false),
      vote_privacy: ref(false),
      architecture: ref(false),
    }
  },
  /**
   * Figures for Ordinos description
   */
  data: () => ({
    figure_7: [
      {
        image_path: require('assets/Figure_7a.jpg'),
      },
      {
        image_path: require('assets/Figure_7b.jpg'),
      },
    ],
    figure_9: [
      {
        image_path: require('assets/Figure_9a.jpg'),

      },
      {
        image_path: require('assets/Figure_9b.jpg'),

      },
      {
        image_path: require('assets/Figure_9c.jpg'),
      },
    ],
    figure_10: [
      {
        image_path: require('assets/Figure_10a.jpg'),

      },
      {
        image_path: require('assets/Figure_10b.jpg'),

      },
    ],
  }),
};
</script>