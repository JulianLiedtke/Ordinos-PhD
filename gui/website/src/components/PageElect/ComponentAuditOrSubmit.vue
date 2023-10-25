<template>
  <q-page>
    <q-card class="card-middle">
      <q-card-section class="bg-accent">
        {{ $t('ComponentAuditOrSubmit.review_submit') }}
      </q-card-section>
      <q-card-section align="center">
        <q-icon name="lock" size="100px" class="text-positive" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        {{ $t('ComponentAuditOrSubmit.ballot_encrypted') }}
        <br />
        <br /> {{ $t('ComponentAuditOrSubmit.ballot_encrypted') }}
        <br />
        <br />
        <strong>{{ $t('ComponentAuditOrSubmit.what_does_the_test_do')}}</strong>
        <br /> {{ $t('ComponentAuditOrSubmit.smartphone_test') }}
        <br /> {{ $t('ComponentAuditOrSubmit.guarantee_security') }}
        <strong>{{ $t('ComponentAuditOrSubmit.new_filling') }}</strong>. 
        {{ $t('ComponentAuditOrSubmit.test_or_send') }}
        <strong>{{ $t('ComponentAuditOrSubmit.recommend_test_several_times') }}</strong>
      </q-card-section>

      <q-separator />

      <q-card-actions align="center">
        <q-btn
          v-on:click="this.audit"
          color="positive"
          :label="$t('ComponentAuditOrSubmit.start_test')"
          size="xl"
          no-caps
        />

        <q-dialog v-model="confirm">
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="email" color="primary" text-color="white" />
              <span class="q-ml-sm">
                {{ $t('ComponentAuditOrSubmit.send_test') }}
              </span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat :label="$t('ComponentAuditOrSubmit.return')" color="primary" v-close-popup />
              <q-btn
                v-close-popup
                v-on:click="this.submit"
                :label="$t('ComponentAuditOrSubmit.send')"
                color="primary"
                flat
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-btn
          v-on:click="confirm = true"
          :label="$t('ComponentAuditOrSubmit.cast_vote')"
          color="primary"
          size="xl"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Paillier from "components/Paillier";
export default {
  name: "ComponentAuditOrSubmit",

  data: function () {
    return {
      confirm: false, // Flag to show confirm-submit dialog
    };
  },
  created() {
    this.setStep("audit"); // Set step for current point in tutorial
  },

  emits: [
    "audit",
    "submit"
  ],

  methods: {
    ...mapGetters("storeConfig", [
      "getPaillier",
      "getElection",
      "getBallot",
      "getBullet",
      "getSecretRandomNumbers",
      "getCandidates",
      "getChoices",
      "getPlainTrashValues",
    ]),
    ...mapActions("storeConfig", ["setStep"]),

    /**
     * Audit clicked
     *
     * @event
     * @emits audit
     */
    audit() {
      var payload = {
        audit: true,
        choices: this.getChoices(), //?
        plainTrashValues: this.getPlainTrashValues(),
        bullet: this.getBullet(),
        secretRandomNumbers: this.getSecretRandomNumbers(),
        paillier: this.getPaillier(),
        ballot: this.getBallot(),
        candidates: this.getCandidates(),
        voterId: this.getElection().voterId,
        voterSecret: this.getElection().secret
      }; // Gather all clear data
      this.$emit("audit", payload);
    },

    /**
     * Submit clicked
     *
     * @event
     * @emits audit
     */
    submit() {
      var payload = {
        audit: false,
        bullet: this.getBullet(),
      };
      this.$emit("submit", payload);
    },
  },
};
</script>
