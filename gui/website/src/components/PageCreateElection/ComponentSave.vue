<template>
  <div>
    <h4 style="margin-bottom: 20px">{{ $t("ComponentSave.title") }}</h4>
    <p>{{ $t("ComponentSave.hint") }}</p>
    <div class="row">
      <h6>Konfigurationen</h6>
    </div>
    <div class="row">
      <q-list bordered id="configList" class="rounded-borders fullwidth">
        <q-item-label header>{{ $t("ComponentSave.confilist") }}</q-item-label>
        <q-item
          v-for="(electionSetting, index) in saveForm.json"
          v-bind:key="index"
        >
          <q-item-section style="flex-grow: 3">
            <button
              class="my-btn"
              v-on:click="setElection(electionSetting, index)"
            >
              {{ index }}
            </button>
          </q-item-section>
          <q-item-section style="flex-grow: 1">
            <q-btn
              padding="md"
              icon="delete"
              color="red"
              v-on:click="deleteConfiguration(index)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <q-form
      style="margin-top: 10px"
      class="q-gutter-x-xs q-gutter-y-md"
      ref="downloadForm"
    >
      <div class="row">
        <div class="col">
          <q-input
            outlined
            autogrow
            ref="confignameInput"
            v-model="saveForm.configname"
            :label="$t('ComponentSave.configname')"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                $t('ComponentSave.configname_rules_exist'),
              (val) =>
                (val && val.length <= 60) ||
                $t('ComponentSave.configname_rules_length'),
            ]"
          />
        </div>
      </div>
      <div class="row btn-row">
        <q-space></q-space>
        <div class=".col-2">
          <q-btn
            class="custom-btn"
            color="green"
            :label="$t('ComponentSave.save')"
            v-on:click="saveToConfig()"
          />
        </div>
      </div>
      <div class="row">
        <h6>Datei</h6>
      </div>

      <div class="row" style="padding-bottom: 2em">
        <div class="col">
          <q-file
            accept=".json"
            max-total-size="4096000"
            v-model="saveForm.file"
            @update:model-value="loadTextFromFile"
            @rejected="onRejected"
            outlined
            bottom-slots
            :label="$t('ComponentSave.upload')"
            counter
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" @click.stop />
            </template>
            <template v-slot:append>
              <q-icon
                name="close"
                @click.stop="saveForm.file = null"
                class="cursor-pointer"
              />
            </template>
            <template v-slot:hint>
              {{ $t("ComponentSave.uploadhint") }}
            </template>
          </q-file>
        </div>
      </div>
      <div class="row" style="padding-bottom: 1em">
        <div class="col">
          <q-input
            outlined
            v-model="saveForm.filename"
            :label="$t('ComponentSave.filename')"
            suffix=".json"
            lazy-rules
            :hint="$t('ComponentSave.filenamehint')"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                $t('ComponentSave.filename_rules_exist'),
              (val) =>
                (val && val.length <= 60) ||
                $t('ComponentSave.filename_rules_length'),
            ]"
          />
        </div>
      </div>
      <div class="row btn-row">
        <q-space></q-space>
        <div class=".col-2">
          <q-btn
            class="custom-btn"
            color="red"
            :label="$t('ComponentSave.download')"
            v-on:click="downloadConfig()"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>
<style>
#configList {
  margin-bottom: 1em;
}
.fullwidth {
  width: 100%;
}
.btn-row {
  margin-top: 0px;
}
.my-btn {
  border: 0;
  height: 100%;
  width: 100%;
  background-color: lightgray;
  cursor: pointer;
  border-radius: 4px;
}
</style>
<script>
const reader = new FileReader();
export default {
  name: "ComponentSave",
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
  data() {
    return {
      saveForm: {
        filename: null,
        file: null,
        configname: null,
        json: {},
      },
    };
  },
  methods: {
    downloadConfig() {
      this.$refs.downloadForm.validate().then((success) => {
        if (success) {
          this.saveToConfig();
          var a = document.createElement("a");
          var file = new Blob([JSON.stringify(this.saveForm.json)], {
            type: "application/json",
          });
          a.href = URL.createObjectURL(file);
          a.download = this.saveForm.filename + ".json";
          a.click();
        } else {
          // Lazy rules will be enough for a start,
          // but if there is going to be an error notify the user
          this.$q.notify({
            type: "negative",
            message: $t('ComponentSave.failure_uploading_file'),
          });
        }
      });
    },
    deleteConfiguration(index) {
      this.$delete(this.saveForm.json, index);
    },

    setElection(obj, name) {
      var saveObj = obj;
      for (var prop in saveObj["election_settings"]) {
        if (Object.prototype.hasOwnProperty.call(this.ballot_form, prop)
          && prop!='candidates'
          && prop!='election'
        ) {
          this.ballot_form[prop] = saveObj["election_settings"][prop];
        }
      }
      for (var prop in saveObj["extra_options"]) {
        if (Object.prototype.hasOwnProperty.call(this.extra_options, prop)) {
          this.extra_options[prop] = saveObj["extra_options"][prop];
        }
      }
      this.saveForm.configname = name;
    },

    saveToConfig() {
      if (this.$refs.confignameInput.validate()) {
        var saveObj = {
          election_settings: this.ballot_form,
          extra_options: this.extra_options,
        };
        this.saveForm.json[this.saveForm.configname] = JSON.parse(JSON.stringify(saveObj));
      } else {
        // Lazy rules with the input will show the error to user
      }
    },
    onRejected(rejectedEntries) {
      this.$q.notify({
        type: "negative",
        message: `${rejectedEntries.length} $t('ComponentSave.failure_uploading_file')`,
      });
    },
    /**
     *
     */
    loadTextFromFile() {
      reader.onload = (e) => 
        this.eventFileLoaded(e.target.result, this.saveForm.file);
      reader.readAsText(this.saveForm.file); // Read file
    },
    eventFileLoaded(result, file) {
      this.saveForm.filename = file.name.replace(/\.[^/.]+$/, "");
      this.saveForm.json = JSON.parse(result);
    },
  },
};
</script>