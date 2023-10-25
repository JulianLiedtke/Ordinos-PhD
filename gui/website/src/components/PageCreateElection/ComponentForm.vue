<template>
  <div class="q-px-lg">
    <q-card class="election-card">
      <!-- Beginn Form -->
      <h2>{{ $t('ComponentForm.title') }}</h2>
      <q-form class="q-gutter-x-xs q-gutter-y-md" @submit.prevent="onSubmit" @reset="onSaveTemplate" @validation-error="onValidationError">
        <div class="row">
          <h6>{{ $t('ComponentForm.headline') }}</h6>
        </div>
        <div class="row">
          <div class="col-8 custom-col">
            <q-input
            outlined
            v-model="ballot_form.election.title"
            :label="$t('ComponentForm.label_name_of_election')"
            lazy-rules
            :rules="[
            (val) =>
            (val && val.length > 0) ||
            $t('ComponentForm.name_input'),
            (val) =>
            (val && val.length <= 60) ||
            $t('ComponentForm.name_max_length'),
            ]"
            />
          </div>
          <div class="col-4 custom-col">
            <q-input
            outlined
            type="number"
            v-model.number="ballot_form.election.numberOfVoters"
            :label="$t('ComponentForm.label_number_of_voters')"
            lazy-rules
            :rules="[
            (val) =>
            (val !== null && val !== '') ||
            $t('ComponentForm.number_of_voters'),
            (val) =>
            val > 0 || $t('ComponentForm.reasonable_number'),
            ]"
            />
          </div>
        </div>
        <div class="row">
          <div class="col custom-col">
            <!-- Inpufield startdate -->
            <q-input outlined :label="$t('ComponentForm.start_of_election')" v-model="displayStartDate">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                  transition-show="scale"
                  transition-hide="scale"
                  >
                  <q-date v-model="displayStartDate" :mask="displayMask">
                    <div class="row items-center justify-end">
                      <q-btn
                      v-close-popup
                      label="Close"
                      color="primary"
                      flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:prepend>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
                >
                <q-time
                v-model="displayStartDate"
                :mask="displayMask"
                format24h
                >
                <div class="row items-center justify-end">
                  <q-btn
                  v-close-popup
                  label="Close"
                  color="primary"
                  flat
                  />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div class="col custom-col">
      <!-- Inpufield duedate -->
      <q-input outlined :label="$t('ComponentForm.end_of_election')" v-model="displayDueDate">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
            transition-show="scale"
            transition-hide="scale"
            >
            <q-date v-model="displayDueDate" :mask="displayMask">
              <div class="row items-center justify-end">
                <q-btn
                v-close-popup
                label="Close"
                color="primary"
                flat
                />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:prepend>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy
          transition-show="scale"
          transition-hide="scale"
          >
          <q-time
          v-model="displayDueDate"
          :mask="displayMask"
          format24h
          >
          <div class="row items-center justify-end">
            <q-btn
            v-close-popup
            label="Close"
            color="primary"
            flat
            />
          </div>
        </q-time>
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
</div>
</div>
<!-- List for the candidates -->
<div class="row">
  <h6>{{ $t('ComponentForm.candidates') }}</h6>
</div>
<div class="row">
  <div id="candidateList">
    <!-- Iterate over candidate list -->
    <div v-for="n in ballot_form.candidates.length" v-bind:key="n">
      <div class="row">
        <div class="col-7 custom-col">
          <q-input
          outlined
          v-model="ballot_form.candidates[n - 1].name"
          :label="$t('ComponentForm.label_name_of_candidate')"
          lazy-rules
          :rules="[
          (val) =>
          (val && val.length > 0) ||
          $t('ComponentForm.name_of_candidate'),
          (val) =>
          (val && val.length <= 60) ||
          $t('ComponentForm.name_max_length'),
          ]"
          />
        </div>
        <div class="col-2 custom-col">
          <q-input
          outlined
          v-model="ballot_form.candidates[n - 1].party"
          :label="$t('ComponentForm.party')"
          />
        </div>
        <div class="col-2 custom-col">
          <q-input
          outlined
          v-model="ballot_form.candidates[n - 1].avatar"
          :label="$t('ComponentForm.placeholder_avatar')"
          />
        </div>
        <div class="col-1 custom-col">
          <q-btn
          padding="md"
          icon="delete"
          color="red"
          v-on:click="deleteCandidate(n - 1)"
          />
        </div>
      </div>
    </div>
  </div>
</div>
<div class="row">
  <q-space></q-space>
  <q-btn
  color="primary"
  v-on:click="addCandidate()"
  :label="$t('ComponentForm.add_candidate')"
  />
</div>
<!-- Auswahl Wahlkathegorie -->
<div class="row">
  <h6>{{ $t('ComponentForm.ballot_paper') }}</h6>
</div>
<div class="row">
  <div class="col custom-col">
    <q-card style="width: 100%">
      <q-tabs
      v-model="ballot_form.ballot.category"
      class="text-grey bg-grey-4"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      >
      <q-tab name="Checkbox" label="Checkbox" />
      <q-tab name="Rating" label="Rating" />
      <q-tab name="Ranking" label="Ranking" />
    </q-tabs>
    <q-separator />

    <q-tab-panels v-model="ballot_form.ballot.category" animated>
      <q-tab-panel name="Checkbox">
        <q-input
        outlined
        type="number"
        v-model.number="
        ballot_form.ballot.settings.minNumberOfChoices
        "
        :label="$t('ComponentForm.label_min_number_of_votes')"
        reactive-rules
        :rules="[
        (val) =>
        (val !== null && val !== '') ||
        $t('ComponentForm.min_number_of_votes'),
        (val) =>
        (val > 0 && val < 100) ||
        $t('ComponentForm.reasonable_number'),
        (val) =>
        val <= ballot_form.ballot.settings.maxNumberOfChoices ||
        $t('ComponentForm.min_number_of_votes_message'),
        ]"
        />
        <q-input
        outlined
        type="number"
        v-model.number="
        ballot_form.ballot.settings.maxNumberOfChoices
        "
        :label="$t('ComponentForm.label_max_number_of_votes')"
        reactive-rules
        :rules="[
        (val) =>
        (val !== null && val !== '') ||
        $t('ComponentForm.max_number_of_votes'),
        (val) =>
        (val > 0 && val < 100) ||
        $t('ComponentForm.reasonable_number'),
        (val) =>
        val >= ballot_form.ballot.settings.minNumberOfChoices ||
        $t('ComponentForm.max_number_of_votes_message'),
        ]"
        />
      </q-tab-panel>
      <q-tab-panel name="Rating">
        <q-toggle
        class="toggle-style"
        color="primary"
        v-model="ballot_form.ballot.settings.spreadPointsAcross"
        :label="$t('ComponentForm.divide_number_of_points')"
        />
        <div v-if="ballot_form.ballot.settings.spreadPointsAcross">
          <q-input
          outlined
          type="number"
          :label="$t('ComponentForm.label_number_of_points')"
          v-model.number="ballot_form.ballot.settings.points"
          lazy-rules
          :rules="[
          (val) =>
          (val !== null && val !== '') ||
          $t('ComponentForm.number_of_points'),
          (val) =>
          val > 0 ||
          $t('ComponentForm.reasonable_number'),
          ]"
          />
        </div>
        <div v-else>
          <q-input
          outlined
          type="number"
          :label="$t('ComponentForm.label_max_number_of_points')"
          v-model.number="ballot_form.ballot.settings.points"
          @input="updateListOfWinnerPoints()"
          lazy-rules
          :rules="[
          (val) =>
          (val !== null && val !== '') ||
          $t('ComponentForm.max_number_of_points'),
          (val) =>
          val > 0 ||
          $t('ComponentForm.reasonable_number'),
          ]"
          />
        </div>

        <q-toggle
        class="toggle-style"
        color="primary"
        v-model="ballot_form.ballot.settings.allowDraw"
        :label="$t('ComponentForm.label_question_candidates_same_points')"
        />
        <q-input
        outlined
        type="number"
        :label="$t('ComponentForm.label_min_number_of_candidates_points')"
        v-model.number="
        ballot_form.ballot.settings.minNumberOfChoices
        "
        lazy-rules
        :rules="[
        (val) =>
        (val !== null && val !== '') ||
        $t('ComponentForm.min_number'),
        (val) =>
        val > 0 || $t('ComponentForm.reasonable_number'),
        (val) =>
        val <= ballot_form.candidates.length ||
        $t('ComponentForm.not_greater_number_of_candidates'),
        ]"
        />
      </q-tab-panel>

      <q-tab-panel name="Ranking">
        <div class="row">
          <div class="col custom-col">
            <q-input
            outlined
            type="number"
            :label="$t('ComponentForm.label_rank_countings')"
            v-model.number="
            ballot_form.ballot.settings.numberOfCountingRanks
            "
            reactive-rules
            @input="onNumberOfCountingRanks"
            :rules="[
            (val) =>
            (val !== null && val !== '') ||
            $t('ComponentForm.rank_countings'),
            (val) =>
            val > 0 ||
            $t('ComponentForm.reasonable_number'),
            (val) =>
            val <= ballot_form.candidates.length ||
            $t('ComponentForm.not_greater_number_of_candidates'),
            ]"
            />
          </div>
          <div class="custom-col">
            <q-btn
            color="primary"
            padding="md"
            icon="add_circle"
            v-on:click="addRank()"
            :label="$t('ComponentForm.add_rank')"
            />
          </div>
        </div>
        <div class="row" id="rankingList">
          <div
          style="width: 120px"
          v-for="rank in ballot_form.ballot.settings
          .numberOfCountingRanks"
          v-bind:key="rank"
          >
          <q-badge color="secondary">
            {{ $t('ComponentForm.points_for_rank') }} {{ rank }}
          </q-badge>
          <q-field
          outlined
          v-model.number="
          ballot_form.ballot.settings.pointDistribution[
          rank - 1
          ]
          "
          stack-label
          reactive-rules
          :rules="[
          (val) =>
          !(
            val >
            ballot_form.ballot.settings.pointDistribution[
            rank - 2
            ] && rank >= 2
            ) ||
          $t('ComponentForm.smaller_value_than_previous_rank'),
          (val) =>
          val ||
          rank ==
          ballot_form.ballot.settings
          .numberOfCountingRanks ||
          $t('ComponentForm.larger_value_than_next_rank'),
          ]"
          >
          <template v-slot:control>
            <q-slider
            vertical
            reverse
            v-model="
            ballot_form.ballot.settings.pointDistribution[
            rank - 1
            ]
            "
            :min="0"
            :max="100"
            @input="updateListOfWinnerPoints()"
            label-always
            />
          </template>
        </q-field>
      </div>
    </div>
    <!-- -->
    <q-input
    outlined
    type="number"
    :label="$t('ComponentForm.number_of_candidates_same_rank')"
    :hint="$t('ComponentForm.hint_drag_and_drop')"
    v-model.number="
    ballot_form.ballot.settings.numberOfEqualRanks
    "
    lazy-rules
    :rules="[
    (val) =>
    (val !== null && val !== '') ||
    $t('ComponentForm.enter_number'),
    (val) =>
    val > 0 || $t('ComponentForm.reasonable_number'),
    ]"
    />
  </q-tab-panel>
</q-tab-panels>
</q-card>
</div>
</div>
<!-- Selection of evaluation type -->
<div class="row">
  <h6>{{ $t('ComponentForm.evaluation') }}</h6>
</div>
<div class="q-px-sm">
  {{ $t('ComponentForm.evaluation_dependence') }}
</div>
<div class="row">
  <div class="col custom-col">
    <q-card style="width: 100%">
      <q-tabs
      v-model="tab"
      class="text-grey bg-grey-4"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      >
      <q-tab
      v-if="ballotCompatibleWithSimpleEvaluation()"
      name="Simple_evaluation"
      label="Simple evaluation"
      />
      <q-tab
      v-if="ballotCompatibleWithCondorcet()"
      name="Condorcet"
      label="Condorcet"
      />
      <q-tab
      v-if="ballotCompatibleWithIRV()"
      name="Instant_runoff"
      label="Instant-Runoff"
      />
      <q-tab
      v-if="ballotCompatibleWithSeatDistribution()"
      name="Seat_distribution"
      label="Seat distribution"
      />
    </q-tabs>
    <q-separator />
    <q-tab-panels
    v-model="tab"
    animated
    @transition="ballot_form.evaluation.type = calculateEvaluationTypeFromTab(tab)">
    <q-tab-panel name="Simple_evaluation">
      <p>
        {{ $t('ComponentForm.description_of_borda') }}
      </p>
      <q-select
      outlined
      v-model="simpleEvaluationOption"
      :options="simpleEvaluationOptions"
      :label="$t('ComponentForm.simple_evaluation_option')"
      hint=""
      />
      <q-input
      outlined
      type="number"
      v-model.number="ballot_form.evaluation.settings.numWinners"
      :label="$t('ComponentForm.label_number_of_winners')"
      lazy-rules
      :rules="[
      (val) =>
      (val !== null && val !== '') ||
      $t('ComponentForm.label_number_of_winners'),
      (val) =>
      val > 0 || $t('ComponentForm.at_least_one_winner'),
      (val) =>
      val <= ballot_form.candidates.length ||
      $t('ComponentForm.number_of_winners_max'),
      ]"
      />
      <q-input
      outlined
      type="number"
      v-model.number="
      ballot_form.evaluation.settings.listOfWinnerPoints[0]
      "
      :label="$t('ComponentForm.max_number_of_points_per_vote')"
      lazy-rules
      :rules="[
      (val) =>
      (val !== null && val !== '') ||
      $t('ComponentForm.number_of_points_per_vote'),
      (val) =>
      val > 0 ||
      $t('ComponentForm.value_of_point'),
      ]"
      />
      <q-input
      outlined
      type="number"
      v-model.number="ballot_form.evaluation.settings.pointLimit"
      :label="$t('ComponentForm.min_score_winner')"
      lazy-rules
      :hint="$t('ComponentForm.hint_PointThresholdEvaluation')"
      :rules="[
      (val) =>
      (val !== null && val !== '') ||
      $t('ComponentForm.min_points'),
      (val) =>
      val >= 0 ||
      $t('ComponentForm.greater_zero'),
      ]"
      />
      <q-checkbox
      v-model="ballot_form.evaluation.settings.allow_less_candidates"
      label="Allow less candidates">
    </q-checkbox>
    <q-checkbox
    v-model="ballot_form.evaluation.settings.begin_with_last"
    label="Begin with last">
  </q-checkbox>
  <q-checkbox
  v-model="ballot_form.evaluation.settings.allow_equality"
  label="Allow equality">
</q-checkbox>
</q-tab-panel>
<q-tab-panel name="Condorcet">
  <p>
    <!--TODO Text hinzufügen -->
    Text zu Condorcet
  </p>
  <q-select
  outlined
  v-model="optionsCondorcet.selectedChainType"
  :options="optionsCondorcet.chainTypes"
  label="Chain Typ"
  hint=""
  />
  <div v-if="optionsCondorcet.selectedChainType === 'PredefinedChain'">
    <q-select
    outlined
    v-model="ballot_form.evaluation.type"
    :options="optionsCondorcet.implementations"
    :label="$t('ComponentForm.implementation_method')"
    hint=""
    />
  </div>
  <div v-if="optionsCondorcet.selectedChainType === 'CustomChain'">
    <div class="row">
      <h6>Chain</h6>
    </div>
    <div class="row">
      <div id="chainList">
        <div v-for="n in ballot_form.evaluation.settings.additional_evaluators.length" v-bind:key="n">
          <div class="row">
            <div class="col-11 custom-col">
              <q-select
              outlined
              v-model="ballot_form.evaluation.settings.additional_evaluators[n - 1]"
              :options="changeEvaluationOption"
              :label="$t('ComponentForm.evalution_executed_as') + n + '.'"
              hint=""
              />
            </div>
            <div class="col-1 custom-col">
              <q-btn
              padding="md"
              icon="delete"
              color="red"
              v-on:click="deleteEvaluationFromChain(n - 1)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <br>
    <div class="row">
      <q-space></q-space>
      <q-btn
      color="primary"
      v-on:click="addEvaluationToChain()"
      :disable="disableAddEvaluation"
      :label="$t('ComponentForm.add_evaluation')"
      />
    </div>
  </div>
  <div>
    <div class="row">
      <h6>{{ $t('ComponentForm.options') }}</h6>
    </div>
    <div class="col">
      <q-checkbox
      v-model="ballot_form.evaluation.settings.evaluate_condorcet"
      label="Evaluate condorcet"
      />
      <div class="q-px-sm">
        {{ $t('ComponentForm.evaluation_of_condorcet') }}
      </div>
    </div>
    <div class="col">
      <q-checkbox
      v-model="ballot_form.evaluation.settings.leak_better_half"
      label="Leak better half"
      />
      <div class="q-px-sm">
        {{ $t('ComponentForm.calc_candidates_half_borda_points') }}
      </div>
    </div>
    <div class="col" v-if="smithLeakMinCopelandOptionAvailable">
      <q-checkbox
      v-model="ballot_form.evaluation.settings.smith_leak_min_copeland"
      label="Smith leak min copeland"
      />
      <div class="q-px-sm">
        {{ $t('ComponentForm.lowest_copeland_score_smith_set') }}
      </div>
    </div>
    <div class="col" v-if="leakMinCopelandOptionAvailable">
      <q-checkbox
      v-model="ballot_form.evaluation.settings.leak_min_copeland"
      label="Leak min copeland"
      />
      <div class="q-px-sm">
        {{ $t('ComponentForm.lowest_copeland_score') }}
      </div>
    </div>
    <div class="col" v-if="leakMaxPointsOptionAvailable">
      <q-checkbox
      v-model="ballot_form.evaluation.settings.leak_max_points"
      label="Leak max points"
      />
      <div class="q-px-sm">
        {{ $t('ComponentForm.highest_copeland_score') }}
      </div>
    </div>
  </div>
</q-tab-panel>
<q-tab-panel name="Instant_runoff">
  <p>
    {{ $t('ComponentForm.description_of_instant_runoff') }}
  </p>
</q-tab-panel>
<q-tab-panel name="Seat_distribution">
  <q-select
  outlined
  v-model="seatDistributionEvaluationOption"
  :options="seatDistributionEvaluationOptions"
  :label="$t('ComponentForm.seat_distribution_evaluation_option')"
  hint=""
  />
  <p v-if="seatDistributionEvaluationOption == 'Hare-Niemeyer'">
    {{ $t('ComponentForm.hare_niemeyer') }}
  </p>
  <q-input
  outlined
  type="number"
  v-model.number="ballot_form.evaluation.settings.n_seats"
  :label="$t('ComponentForm.label_seat_quanity')"
  :rules="[
  (val) =>
  (val !== null && val !== '') ||
  $t('ComponentForm.seat_quanity'),
  (val) =>
  val > 0 ||
  $t('ComponentForm.condition_seat_set'),
  ]"
  />

  <q-input
  outlined
  type="number"
  v-model.number="ballot_form.evaluation.settings.clause"
  :label="$t('ComponentForm.min_number_of_votes')"

  :rules="[
  (val) =>
  (val !== null && val !== '') ||
  $t('ComponentForm.enter_clause'),
  (val) =>
  val > 0 ||
  $t('ComponentForm.condition_of_clause'),
  ]"/>
  <q-checkbox
  v-model="ballot_form.evaluation.settings.secret_residual"
  label="Require secret residual">
</q-checkbox>
</q-tab-panel>
</q-tab-panels>
</q-card>
</div>
</div>
<div class="row">
  <q-space></q-space>
  <q-btn
  :loading="loading"
  :disable="loading"
  type="reset"
  :label="$t('ComponentForm.save_template')"
  class="q-mr-sm"
  color="indigo"
  />
  <q-btn
  :loading="loading"
  :disable="loading"
  type="submit"
  :label="$t('ComponentForm.create_election')"
  class="q-px-md q-py-xs"
  color="blue"
  />
</div>

<q-expansion-item
expand-separator
icon="dns"
:label="$t('ComponentForm.server_settings')"
>
<div class="row">
  <div class="col custom-col">
    <q-select
    outlined
    class="q-field"
    label="Peerserver IP"
    v-model="ballot_form.communication.peerServerIP"
    use-input
    clearable
    hint=""
    @new-value="createValuePeer"
    :options="extra_options.filterPeerOptions"
    @filter="filterFnPeer"
    />
  </div>
</div>
<div class="row">
  <div class="col custom-col">
    <q-select
    outlined
    :label="$t('ComponentForm.authentication_server_ip')"
    v-model="ballot_form.communication.authenticationServerIP"
    use-input
    clearable
    hint=""
    @new-value="createValueAuthentication"
    :options="extra_options.filterAuthenticationOptions"
    @filter="filterFnAuthentication"
    />
  </div>
</div>
<div class="row">
  <div class="col custom-col">
    <q-select
    outlined
    label="BulletinBoard Server IP"
    v-model="ballot_form.communication.bulletinBoardServerIP"
    use-input
    clearable
    hint=""
    @new-value="createValueBulletinBoard"
    :options="extra_options.filterBulletinBoardOptions"
    @filter="filterFnBulletinBoard"
    />
  </div>
</div>
</q-expansion-item>
<q-expansion-item
expand-separator
icon="security"
:label="$t('ComponentForm.security_settings')"
>
<div class="row">
  <div class="col custom-col">
    <q-select
    outlined
    v-model="ballot_form.encryption.ABB"
    :options="optionsABB"
    label="ABB"
    hint=""
    />
  </div>
</div>
<div class="row">
  <div class="col custom-col">
    <q-select
    outlined
    v-model="ballot_form.encryption.protocolSuite"
    :options="optionsProtocolSuite"
    label="ProtocolSuite"
    hint=""
    />
  </div>
</div>
<div class="row">
  <div class="col custom-col">
    <q-select
    outlined
    v-model="ballot_form.encryption.bits"
    :options="optionsBits"
    :label="$t('ComponentForm.number_of_bits_for_encryption')"
    :hint="$t('ComponentForm.not_enough_bits')"
    />
  </div>
</div>
<div class="row">
  <div class="col custom-col">
    <q-input
    outlined
    type="number"
    v-model.number="ballot_form.encryption.numberShares"
    :label="$t('ComponentForm.label_number_of_trustees')"
    reactive-rules
    :rules="[
    (val) =>
    (val !== null && val !== '') ||
    $t('ComponentForm.number_of_shares'),
    (val) =>
    val > 1 ||
    $t('ComponentForm.condition_for_trustees'),
    (val) =>
    val >= ballot_form.encryption.threshold ||
    $t('ComponentForm.condition_for_number_of_shares'),
    ]"
    />
  </div>
</div>
<div class="row">
  <div class="col custom-col">
    <q-input
    outlined
    type="number"
    v-model.number="ballot_form.encryption.threshold"
    :label="$t('ComponentForm.number_of_partial_key_holders')"
    reactive-rules
    :rules="[
    (val) =>
    (val !== null && val !== '') ||
    $t('ComponentForm.enter_treshold'),
    (val) => val > 1 || $t('ComponentForm.first_condition_for_threshold'),
    (val) =>
    val <= ballot_form.encryption.numberShares ||
    $t('ComponentForm.second_condition_for_threshold'),
    ]"
    />
  </div>
</div>
</q-expansion-item>
</q-form>
</q-card>
</div>
</template>
<style>
  h2 {
    margin-top: 0;
  }
  h6 {
    margin: 0 0 0 10px;
  }
  #rankingList {
    flex-wrap: wrap;
    overflow-y: scroll;
    max-height: 510px;
    margin-top: 0px;
    margin-bottom: 10px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  }
  #candidateList {
    overflow-y: scroll;
    height: 400px;
    margin: 0 2px;
    padding: 0.5em;
    width: 100%;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  }

  #chainList {
    overflow-y: scroll;
    height: 400px;
    margin: 0 2px;
    padding: 0.5em;
    width: 100%;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  }

  .toggle-style {
    padding-bottom: 25px;
  }
  .q-field-with-bottom {
    padding-bottom: 25px;
  }
  .card-middle {
    margin-left: 15%;
    width: 70%;
    padding: 1em;
  }
  .custom-col {
    padding: 2px;
  }
  .custom-btn {
    margin-top: 0;
    margin-left: 10px;
    margin-right: 5px;
  }
  .custom-btn-top {
    top: 15%;
  }
  .submit-row {
    height: 80px;
  }
  .election-card {
    max-width: 1000px;
    padding: 20px;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
<script>
  import { date, } from "quasar";
  import { mapActions } from "vuex";
  import axios from "axios";

// Javascript Libraries

export default {
  name: "ComponentForm",
  props: {
    ballot_form: {
      type: Object,
      required: true,
    },
    extra_options: {
      type: Object,
      required: true,
    },
  },
  computed: {
    disableAddEvaluation: function () {
      return this.optionsCondorcet.evaluators.length ===
      this.ballot_form.evaluation.settings.additional_evaluators.length;
    },
    changeEvaluationOption: function () {
      return this.optionsCondorcet.evaluators.filter(e =>
        !this.ballot_form.evaluation.settings.additional_evaluators.includes(e));
    },
    smithLeakMinCopelandOptionAvailable: function () {
      const type = this.ballot_form.evaluation.type;
      return type === "MiniMaxMarginsSmith" || type === "MiniMaxWinningVotesSmith";
    },
    leakMinCopelandOptionAvailable: function () {
      return this.ballot_form.evaluation.settings.additional_evaluators.includes("SmithEvaluation");
    },
    leakMaxPointsOptionAvailable: function () {
      return this.ballot_form.evaluation.type === "Copeland";
    }
  },
  data() {
    return {
      displayMask: "HH:mm     DD.MM.YYYY",
      storeMask: "YYYY-MM-DDTHH:mm:ssZ",
      displayStartDate: null,
      displayDueDate: null,
      tab: this.calculateTabFromEvaluationType(this.ballot_form.evaluation.type),
      simpleEvaluationOption: "Borda",
      simpleEvaluationOptions: [ "Borda" ],
      seatDistributionEvaluationOption: "Hare-Niemeyer",
      seatDistributionEvaluationOptions: [ "Hare-Niemeyer" ],
      optionsBits: [64, 2048, 4096],
      optionsProtocolSuite: ["SubLinearProtocolSuite", "TestSuite"],
      optionsABB: ["PaillierABB", "TestABB"],
      optionsCondorcet: {
        chainTypes: ["PredefinedChain", "CustomChain"],
        selectedChainType: "PredefinedChain",
        implementations: ["Condorcet", "MiniMaxMarginsSmith", "MiniMaxWinningVotesSmith", "Copeland"],
        evaluators: ["CopelandEvaluationFast", "CopelandEvaluationSafe", "MiniMaxMarginsEvaluation",
        "MiniMaxWinningVotesEvaluation", "WeakCondorcetEvaluation", "SmithEvaluation", "SmithFastEvaluation",
        "SchulzeEvaluation"],
      },
      loading: false,
    };
  },
  created() {
    if (this.ballot_form.candidates.length >= 0) {
      this.addCandidate();
    }
    // We had trouble displaying a readable date
    // So we have a readable displaydate and the date in the ballot_form
    this.ballot_form.election.start = date.formatDate(
      Date.now(),
      this.storeMask
      );
    this.ballot_form.election.due = date.formatDate(
      date.addToDate(Date.now(), { days: 7 }),
      this.storeMask
      );
    this.displayStartDate = date.formatDate(
      this.ballot_form.election.start,
      this.displayMask
      );
    this.displayDueDate = date.formatDate(
      this.ballot_form.election.due,
      this.displayMask
      );
  },
  watch: {
    // update the dates in the ballot_form when the displaydates get update
    // update in the other direction is not implemented
    displayStartDate: function (newDate, olddate) {
      var tempDate = date.extractDate(newDate, this.displayMask);
      this.ballot_form.election.start = date.formatDate(
        tempDate,
        this.storeMask
        );
    },
    displayDueDate: function (newDate, olddate) {
      var tempDate = date.extractDate(newDate, this.displayMask);
      this.ballot_form.election.due = date.formatDate(tempDate, this.storeMask);
    },
    'optionsCondorcet.selectedChainType': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.ballot_form.evaluation.settings.additional_evaluators = [];
        this.ballot_form.evaluation.type = "Condorcet";
      }
    },
    'ballot_form.evaluation.settings.n_seats': function(newVal, oldVal){
      if (newVal !== oldVal) {

        this.ballot_form.evaluation.type = "ParliamentaryBallotProperties";
      }
    },
    'ballot_form.evaluation.settings.numWinners': function(newVal, oldVal){
      if(newVal !== oldVal){
        this.ballot_form.evaluation.type = "Borda";
      }

    },
    'ballot_form.evaluation.settings.sysID': function(newVal, oldVal){
      if(newVal !== oldVal){
        this.ballot_form.evaluation.type = "IRVElectionSystemNormal";
      }

    }
  },
  methods: {
    ...mapActions("storeConfig", [
      "addBulletinBoard",
      "addElectionTemplate",
      ]),

    updatePointDistribution() {
      this.ballot_form.ballot.settings.pointDistribution = this.ballot_form.ballot.settings.pointDistribution.slice(
        0,
        this.ballot_form.ballot.settings.numberOfCountingRanks
        );
    },
    onNumberOfCountingRanks() {
      if (this.ballot_form.ballot.settings.numberOfCountingRanks < 0) {
        this.ballot_form.ballot.settings.numberOfCountingRanks = 0;
      }
      this.updatePointDistribution();
    },
    updateListOfWinnerPoints() {
      if (this.ballot_form.ballot.category == "Rating") {
        var maxPoints = this.ballot_form.ballot.settings.points;
      } else {
        var maxPoints = Math.max.apply(
          null,
          this.ballot_form.ballot.settings.pointDistribution
          );
      }

      if (Number.isInteger(maxPoints) && maxPoints >= 0) {
        this.ballot_form.evaluation.settings.listOfWinnerPoints[0] = maxPoints;
      }
    },
    addRank() {
      this.ballot_form.ballot.settings.numberOfCountingRanks =
      this.ballot_form.ballot.settings.numberOfCountingRanks + 1;
    },
    /**
     * Checks if ballot type is compatible with evaluation function and submits election to AS if so.
     */
     onSubmit() {
      if (!this.ballotCompatibleWithEvaluation()) {
        this.notifyBallotNotCompatibleWithEvaluation();
      }
      else {
        this.createElectionRequest();
      }
    },
    /**
     * Notifies on evaluation error.
     */
     onValidationError() {
      this.$q.notify({
        type: "negative",
        position: "top",
        message: this.$t('ComponentForm.ballot_creation_failed'),
      });
    },
    // Checks if selected ballot is compatible with selected evaluation.
    ballotCompatibleWithEvaluation() {
      return this.ballotCompatibleWithSimpleEvaluation() && this.ballot_form.evaluation.type == "Borda" || this.ballotCompatibleWithCondorcet() && this.ballot_form.evaluation.type == "Condorcet" || this.ballotCompatibleWithIRV() && this.ballot_form.evaluation.type == "Instant_runoff" || this.ballotCompatibleWithSeatDistribution() && this.ballot_form.evaluation.type == "ParliamentaryBallotProperties";
    },
    ballotCompatibleWithSimpleEvaluation() {
      return this.ballot_form.ballot.category == "Checkbox" || this.ballot_form.ballot.category == "Ranking";
    },
    ballotCompatibleWithCondorcet() {
      return this.ballot_form.ballot.category == "Rating";
    },
    ballotCompatibleWithIRV() {
      return this.ballot_form.ballot.category == "Ranking";
    },
    ballotCompatibleWithSeatDistribution() {
      return this.ballot_form.ballot.category == "Rating";
    },
    // Calculates evaluation type based of selected evaluation tab.
    calculateEvaluationTypeFromTab(tab) {
      if(tab == "Simple_evaluation") {
        return this.simpleEvaluationOption;
      }
      else if (tab == "Seat_distribution"){
        return this.seatDistributionEvaluationOption;
      }
      else {
        return tab;
      }
    },
    // Calculates tab options from evaluation type.
    calculateTabFromEvaluationType(evaluation_type) {
      if(evaluation_type == "Borda") {
        return "Simple_evaluation";
      }
      else if (evaluation_type == "Hare-Niemeyer") {
        return "Seat_distribution";
      }
      else {
        return evaluation_type;
      }
    },
    createElectionRequest() {
      this.loading = true;
      axios
      .post(
        this.ballot_form.communication.authenticationServerIP +
        "/api/createElection",
        { raw_config: this.ballot_form }
        )
      .then((res) => {
        this.addBulletinBoard([this.ballot_form.communication.bulletinBoardServerIP, res.data["id"]]);
        let route = this.$router.resolve({ path: "../CurrentElections" });
        window.location = route.href;
        location.reload();
        this.$q.notify({
          color: "green-4",
          textColor: "white",
          icon: "cloud_done",
          position: "top",
          message: this.$t('ComponentForm.election_success'),
        });
      })
      .catch((error) => {
        this.$q.notify({
          type: "negative",
          position: "top",
          message: this.$t('ComponentForm.election_failure'),
        });
      })
      .finally(() => {
        this.loading = false;
      });
    },
    /**
     * Checks if ballot type is compatible with evaluation function and saves election as template.
     */
     onSaveTemplate() {
      if (!this.ballotCompatibleWithEvaluation()) {
        this.notifyBallotNotCompatibleWithEvaluation();
      }
      else {
        var saveObj = {
          election_settings: this.ballot_form,
          extra_options: this.extra_options,
        };
        this.addElectionTemplate(saveObj);
        let route = this.$router.resolve({ path: "../CurrentElections" });
        window.location = route.href;
        this.$router.go();
      }      
    },
    notifyBallotNotCompatibleWithEvaluation() {
      this.$q.notify({
        type: "negative",
        position: "top",
        message: "Ballot not compatible with evaluation: (" + this.ballot_form.ballot.category + ", " + this.ballot_form.evaluation.type + ")",
      });
    },
    addCandidate() {
      this.ballot_form.candidates.push({
        name: null,
        party: null,
        avatar: null,
      });
    },

    addEvaluationToChain() {
      this.ballot_form.evaluation.settings.additional_evaluators.push(
        this.optionsCondorcet.evaluators.filter(e =>
          !this.ballot_form.evaluation.settings.additional_evaluators.includes(e))[0]
        );
    },

    deleteCandidate(n) {
      if (n > -1) {
        this.ballot_form.candidates.splice(n, 1);
      }
    },

    deleteEvaluationFromChain(n) {
      if (n > -1) {
        this.ballot_form.evaluation.settings.additional_evaluators.splice(n, 1);
      }
    },

    /**
     * For the 3 server input fields in the form we wanted to have a mix of
     * written input by user and a drop down. So we save the values written by the user
     * in an options array
     */
     createValuePeer(val, done) {
      if (val.length > 0) {
        if (!this.extra_options.peerOptions.includes(val)) {
          this.extra_options.peerOptions.push(val);
        }
        done(val, "toggle");
      }
    },
    createValueAuthentication(val, done) {
      if (val.length > 0) {
        if (!this.extra_options.authenticationOptions.includes(val)) {
          this.extra_options.authenticationOptions.push(val);
        }
        done(val, "toggle");
      }
    },
    createValueBulletinBoard(val, done) {
      if (val.length > 0) {
        if (!this.extra_options.bulletinboardOptions.includes(val)) {
          this.extra_options.bulletinboardOptions.push(val);
        }
        done(val, "toggle");
      }
    },
    filterFnPeer(val, update) {
      update(() => {
        if (val === "") {
          this.extra_options.filterPeerOptions = this.extra_options.peerOptions;
        } else {
          const needle = val.toLowerCase();
          this.extra_options.filterPeerOptions = this.extra_options.peerOptions.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
            );
        }
      });
    },
    filterFnAuthentication(val, update) {
      update(() => {
        if (val === "") {
          this.extra_options.filterAuthenticationOptions = this.extra_options.authenticationOptions;
        } else {
          const needle = val.toLowerCase();
          this.extra_options.filterAuthenticationOptions = this.extra_options.authenticationOptions.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
            );
        }
      });
    },
    filterFnBulletinBoard(val, update) {
      update(() => {
        if (val === "") {
          this.extra_options.filterBulletinBoardOptions = this.extra_options.bulletinboardOptions;
        } else {
          const needle = val.toLowerCase();
          this.extra_options.filterBulletinBoardOptions = this.extra_options.bulletinboardOptions.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
            );
        }
      });
    },
  },
};
</script>
