<template>
  <div class="q-gutter-sm q-mt-sm q-mb-lg">
    <q-card>
      <q-card-section class="bg-accent dense">
        {{ election.title }}
      </q-card-section>
      <q-card-section> {{ $t('ComponentResults.voted_on') }}
        <div v-for="i in election.dates.length" v-bind:key="i">
          {{ getDisplayDate(election.dates[i-1]) }}
        </div>
      </q-card-section>
      <q-card-section v-if="election.allVotesStored == false">
        {{ $t('ComponentResults.already_voted_or_cleared') }}
      </q-card-section>
      <q-card-section> {{ $t('ComponentResults.it_counts_the_election_from') }} {{ getDisplayDate(election.dates[election.dates.length-1]) }}</q-card-section>
      <q-separator inset />
      <q-card-section v-if="response && !gotResults">
        {{ $t('ComponentResults.results_not_published_yet') }}
      </q-card-section>
      <q-card-section
        v-if="response && gotResults && voteHasCounted"
        align="center"
      >
        {{ $t('ComponentResults.automatic_check') }}
        <br />
        <br />
        <q-icon name="done_outline" color="positive" size="50px" />
        <br />
        <br />
        {{ $t('ComponentResults.ballot_was_evaluated') }}
      </q-card-section>
      <q-card-section
        v-if="response && gotResults && !voteHasCounted"
        align="center"
      >
        {{ $t('ComponentResults.automatic_check') }}
        <br />
        <br />
        <q-icon name="warning" color="negative" size="50px" />
        <br />
        <br />
        {{ $t('ComponentResults.vote_not_considered') }}
      </q-card-section>
      <q-card-section v-if="!response" align="center">
        <q-spinner-hourglass color="primary" size="100px" />
      </q-card-section>
    </q-card>
    <q-card v-if="gotResults && displayResultSorted">
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentResults.election_result') }}
      </q-card-section>
      <q-markup-table>
        <tbody>
        <tr v-for="(candidate, id) in this.evaluatedCandidates" :key="id">
          <td class="verticalSplit"> {{ $t('ComponentResults.points') }} {{ candidate.points }}</td>
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
    </q-card>

    <q-card v-if="gotResults && displayResultAsBorda">
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentResults.election_result') }}
      </q-card-section>
      <q-markup-table>
        <tbody>
        <tr v-for="(candidate, id) in this.evaluatedCandidates" :key="id" :class="getBgColour(id)" >
          <td v-if = "(result.includes(id))"> {{ $t('ComponentResults.winner') }} </td>
          <td v-else> - </td>
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
    </q-card>

    <q-card v-if="gotResults && displayResultAsInstant_runoff">
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentResults.election_result') }}
      </q-card-section>
      <q-markup-table>
        <tbody>
        <tr v-for="(candidate, id) in this.evaluatedCandidates" :key="id" :class="getBgColour(id)" >
          <td v-if = "(result.includes(id))"> {{ $t('ComponentResults.winner') }} </td>
          <td v-else> - </td>
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
    </q-card>

    <q-card v-if="gotResults && displayResultAsCondorcet">
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentResults.election_result') }}
      </q-card-section>
      <q-markup-table>
        <tbody>
        <tr v-for="(candidate, id) in this.evaluatedCandidates" :key="id" :class="getBgColour(id)" >
          <td v-if = "(result.includes(id))"> {{ $t('ComponentResults.winner') }} </td>
          <td v-else> - </td>
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
    </q-card>

    <q-card v-if="gotResults && displayResultsAsParliamentary">
      <q-card-section class="bg-accent dense">
        {{ $t('ComponentResults.election_result') }}
      </q-card-section>
      <q-markup-table>
        <tbody>
        <tr v-for="(candidate, id) in this.evaluatedCandidates" :key="id" :class="getBgColour(id)">
          <td v-if = "(result.includes(id))"> {{ $t('ComponentResults.winner') }} </td>
          <td v-else> - </td>
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
            {{}}
          </td>

        </tr>


        </tbody>

      </q-markup-table>
    </q-card>

    <q-btn @click="back()" size="lg">{{ $t('ComponentResults.return') }}</q-btn>
    <q-btn
      v-if="gotResults"
      v-on:click="confirm = true"
      class="float-right"
      color="negative"
      size="lg"
    >{{ $t('ComponentResults.delete') }}</q-btn
    >

    <q-separator />

    <!--
    <q-card v-if="!surveyDone && results">
      <q-card-section style="font-size: 15pt" align="center">
        <strong>Umfrage</strong>
      </q-card-section>
      <q-card-section>
        Die App hat Ihnen zum einen die Ergebnisse angezeigt, aber auch
        gleichzeitig überprüft, dass Ihre Stimme bei der Auswertung gezählt
        wurde. Hat dies Ihr Vertrauen in die Online-Wahl verstärkt?
      </q-card-section>
      <q-card-actions align="center">
        <q-btn v-on:click="survey(true)" size="lg">
          Ja
        </q-btn>
        <q-btn v-on:click="survey(false)" size="lg">
          Nein
        </q-btn>
      </q-card-actions>
    </q-card>
    -->

    <q-dialog v-model="confirm">
      <q-card>
        <q-card-section align="center">
          <q-avatar icon="delete_forever" color="primary" text-color="white" />
          <br />
          <br />
          {{ $t('ComponentResults.do_you_really_want_to_delete_the_election') }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('ComponentResults.return')" color="primary" v-close-popup />
          <q-btn
            flat
            :label="$t('ComponentResults.delete')"
            color="negative"
            v-close-popup
            v-on:click="deleteElection()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Diagnose from "components/Diagnose";
import { date } from "quasar";

export default {
  name: "ComponentResults",

  components: {},

  props: {
    election: {
      type: Object,
      required: true,
      default: 1
    }
  },

  data() {
    return {
      gotResults: false, // Results have been published
      voteHasCounted: false, // Own vote is on bulletin board
      response: false, // Bulletin Board responded
      result: null, // store the result in here
      // array for Candidates that can be differ depending on evaluation method
      // array might sort canidates or only have the winners in them
      evaluatedCandidates: [],
      confirm: false, // Show Dialog for Delete
      surveyDone: false, // Question has been answered
      displayResultAsBorda: false,
      displayResultSorted: false,
      displayResultAsCondorcet: false,
      displayResultAsInstant_runoff: false,
      displayResultsAsMajorityJudgement: false,
      displayResultsAsParliamentary : false,


    };
  },

  /**
   * On Creation send to requests and do checks:
   * Check if vote/choices in LocalStorage and on BB are equal
   * Check if results are posted on BB
   */
  created() {
    axios({
      method: "GET",
      url: this.election.bulletinBoardServerIP + "/api/getVotes", // get all votes for this election from the BB
      headers: { "Content-Type": "application/json" },
      responseType: "application/json",
      params: {
        "board_id": this.election.id
      }
    })
      .then(response => {
        this.response = true;
        // iterate over them and select the ones with matching hash
        var userVotes = [];
        // With the latest timestamp we want to make sure, that also the latest vote
        // which is the one that counts, is the same as in the app
        var latestTimestamp;
        response.data.votes.forEach(element => {
          if (this.election.hash == element.hash) {
            userVotes.push(element);
            if (!latestTimestamp || new Date(element.timestamp) > new Date(latestTimestamp)) {
              latestTimestamp = element.timestamp;
            }
          }
        });
        userVotes.forEach(element => {
          if (this.election.timestamp == latestTimestamp) {
            this.voteHasCounted = true;
            const type = this.election.evaluation.type;
            if (type === "Condorcet" || type === "MiniMaxMarginsSmith" || type === "MiniMaxWinningVotesSmith"
              || type === "Copeland" || type === "Instant_runoff") {
              // -> choice is stored as matrix
              for (var i = 0; i < this.election.bullet.choices.length; i++) {
                for (var j = 0; j < this.election.bullet.choices.length; j++) {
                  if (
                    element.choices == null ||
                    this.election.bullet.choices[i][j] !== element.choices[i][j]
                  ) {
                    // At least one choice differs in the localstorage from the BB Server
                    this.voteHasCounted = false; //not the same
                    break;
                  } else {
                    // All choices are correct
                  }
                }
              }
            } else {
              for (var i = 0; i < this.election.bullet.choices.length; i++) {
                if (
                  element.choices == null ||
                  this.election.bullet.choices[i] != element.choices[i]
                ) {
                  // At least one choice differs in the localstorage from the BB Server
                  this.voteHasCounted = false; //not the same
                  break;
                } else {
                  // All choices are correct
                }
              }
            }
          }
        });


        /*response.data.votes.forEach(element => {
          if (this.election.hash == element.hash && this.election.timestamp == element.timestamp) {
            this.voteHasCounted = true;
            for (var i = 0; i < this.election.bullet.choices.length; i++) {
              if (
                element.choices == null ||
                this.election.bullet.choices[i] != element.choices[i]
              ) {
                // At least one choice differs in the localstorage from the BB Server
                this.voteHasCounted = false; //not the same
                break;
              } else {
                // All choices are correct
              }
            }
          }
        });*/
      })
      .catch(error => {
        // bulletin board is not availible
      });
    axios({
      method: "GET",
      url: this.election.bulletinBoardServerIP + "/api/getResults",
      headers: { "Content-Type": "application/json" },
      responseType: "application/json",
      params: {
        "board_id": this.election.id
      }
    })
      .then(response => {
        if (!this.isEmpty(response.data.results)) {
          this.gotResults = true;
          // response.data.results includes alls trustees results
          // it should not matter which of the trustees result is taken, so take first one
          this.result = response.data.results["0"];
          this.$emit("result", this.result) // this stores the result
          this.displayResult();
        } else {
          // bulletin board server is availible but has no results
          this.loadResultsFromStorage();
        }
      })
      .catch(error => {
        // bulletin board server is not availible
      });
  },
  emits: [
    "restart",
    "delete",
    "result"
  ],
  methods: {
    /**
     * Back to showElections
     * reset
     *
     * @event
     * @emits restart
     */
    back() {
      this.gotResults = true;
      this.response = true;
      this.result = [];
      this.evaluatedCandidates = [];
      this.confirm = true;
      this.$emit("restart");
    },

    // Load Results from LocalStroage if possible
    loadResultsFromStorage() {
      if (this.election.result != null) {
        this.gotResults = true;
        this.response = true;
        this.result = this.election.result;
        //this.voteHasCounted = true;
        this.displayResult();
      }
    },

    // depending on the evaluation method
    // the results might need to be displayed differently
    // all attrributes of the evaluation method are saved in the election from the LocalStorage
    // for now only Borda without displaying the points is implemented
    // TODO futher projects: projects more implementations here
    displayResult() {
      switch (this.election.evaluation.type) {
        case "Borda":
          this.displayBorda()
          break;
        case "Condorcet": case "MiniMaxWinningVotesSmith": case "MiniMaxMarginsSmith": case "Copeland":
          this.displayCondorcet()
          break;
        case "Instant_runoff":
          this.displayInstantRunoff()
          break;
        case "Parliamentary":
          this.displayParliamentary()
          break;
        default:
          this.sortResult();
          break;
      }
    },

    /**
     * Display the result if the evaluation type is borda
     *
     * Expected results from Backend:
     * result is an array which has the position(s) of the winner(s) in them
     * those postions are relativ to the canidates array on the bb server which is mirrored in the LocalStorage
     *
     */
    displayBorda() {
      // no changes to candidates needed
      this.evaluatedCandidates = this.election.candidates.slice();
      this.displayResultAsBorda = true;
    },
    // TODO needs to display winners and their respective amounts of seats in the parliament
    displayParliamentary(){

      this.evaluatedCandidates = this.election.candidates.slice();
      this.displayResultsAsParliamentary = true;

    },
    displayInstantRunoff() {
      this.evaluatedCandidates = this.election.candidates.slice();
      this.displayResultAsInstant_runoff = true;
    },
    displayCondorcet() {
      this.evaluatedCandidates = this.election.candidates.slice();
      this.displayResultAsCondorcet = true;
    },
    getBgColour(id) {
      if (this.result.includes(id)) {
        return "bg-green-4";
      } else {
        return "bg-grey-4";
      }
    },

    /**
     * Sort Results
     *
     * @event
     * @return sorted Array
     */
    sortResult() {
      this.evaluatedCandidates = this.election.candidates.slice();
      for (var i = 0; i < this.election.candidates.length; i++) {
        this.evaluatedCandidates[i].points = this.result[i];
      }
      this.evaluatedCandidates.sort((a, b) => {
        return a.points > b.points ? -1 : a.points < b.points ? 1 : 0;
      });
      this.displayResultSorted = true;
    },

    /**
     * Delete Election
     *
     * @event
     * @emits delete
     */
    deleteElection() {
      this.$emit("delete");
    },

    /**
     * Send survey answer
     * @event
     */
    survey(bol) {
      this.surveyDone = true;
      Diagnose.submitData(this.election.voterId, { trustMore: bol });
    },

    /**
     * Formate a date from iso-standard to a display date
     *
     * @return {String} Date
     */
    getDisplayDate(iso_date) {
      return date.formatDate(iso_date, "HH:mm DD.MM.YYYY");
    },
    isEmpty(obj) {
      for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
          return false;
        }
      }
      return JSON.stringify(obj) === JSON.stringify({});
    }
  }
};
</script>

<style scoped lang="sass">
.verticalSplit
  font-size: 12pt
  border-right: solid 1px lightgrey

.dense
  padding: 10px
</style>
