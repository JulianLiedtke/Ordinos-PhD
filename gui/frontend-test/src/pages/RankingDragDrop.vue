<template>
  <div>
    

      <div v-for="n in this.numberOfCountingRanks"
          v-bind:key="n">
      <div :id="list.length + n"
      
        v-mutation="handler2"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @dragover="onDragOver"
        @drop="onDrop"
        class="q-pt drop-target  ">
        <h5>Rank {{n}}</h5>
      </div>
</div>
    <div id="start"
    v-mutation="handler1"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
    class="drop-start  q-pd"
    > 
      <div v-for="(candidate, identifier) in list"
          v-bind:key="identifier">
        <div :id = identifier
            draggable="true"
            @dragstart="onDragStart">
                      
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
    
    </div>
    
     
    </div> 
    <div class="q-px-sm q-mt-lg">
      Your selection is:
      <div v-for="(n ,index) in choices" :key="index">
        <span>{{ list[index].name }} {{n}}</span>
      </div>
    </div>     
    <q-btn size="lg" color="primary" @click="xy">xy</q-btn>
</div>
   
</template>

<script>
import {mapGetters } from "vuex";
import ComponentCandidate from "components/DragDrop/ComponentCandidate.vue";

export default {
  name: "DragDrop",

    components:{
        ComponentCandidate
    },

   
  
  props: {
    numberOfEqualPositions: {
      type: Number,
      required: false,
      default: 3
    },
    numberOfCountingRanks: {
      type: Number,
      required: false,
      default: 4
    },
    pointDistribution :{
      type: Array,
      required: false,
       default: function () { return [4,3,2,1]}
    },
    list :{
      type: Array,
      required: false,
      default: function(){ return [
            {
            id: 0,
            name: "Candidate A",
            party: "SPD",
            avatar:
                "https://icons.iconarchive.com/icons/diversity-avatars/avatars/1024/batman-icon.png"
            },
            {
                id:1,
            name: "Candidate B",
            party: "CDU",
            avatar: "https://cdn.quasar.dev/img/avatar.png"
            },
            {
                id: 2,
            name: "Candidate C",
            party: "BüSo",
            avatar: "https://avatarfiles.alphacoders.com/125/thumb-125254.png"
            }
        ]}
    } 
  },  

  

  data () {
    return {
      positions: [],
      status1: [],
      status2: [],
      choices: new Array(this.list.length).fill(0),
    }
   
  },


  created(){
    for(var i = 0; i < this.numberOfCountingRanks; i++){
      this.positions[i] = [];
    }
  },

  methods: {

    ...mapGetters("storeConfig", ["getCandidates"]),

    handler1 (mutationRecords) {
      this.status1 = []
      for (const index in mutationRecords) {
        const record = mutationRecords[index];
        const info = `type: ${record.type}, nodes added: ${
          record.addedNodes.length > 0 ? "true" : "false"
        }, nodes removed: ${
          record.removedNodes.length > 0 ? "true" : "false"
        }, oldValue: ${record.oldValue}`;
        this.status1.push(info);
      }
    },

    handler2(mutationRecords) {
      this.status2 = [];
      for (const index in mutationRecords) {
        const record = mutationRecords[index];
        const info = `type: ${record.type}, nodes added: ${
          record.addedNodes.length > 0 ? "true" : "false"
        }, nodes removed: ${
          record.removedNodes.length > 0 ? "true" : "false"
        }, oldValue: ${record.oldValue}`;
        this.status2.push(info);
      }
    },

    // store the id of the draggable element
    onDragStart(e) {
      console.log("hey");
      console.log(e.target.id);
      e.dataTransfer.setData("text", e.target.id);
      e.dataTransfer.dropEffect = "move";
    },

    onDragEnter(e) {
      // don't drop on other draggables
      console.log("second: ")
        console.log(e.target.id);
      if (e.target.id =="start" || (e.target.id >= this.list.length && this.positions[(e.target.id - this.list.length - 1)].length < this.numberOfEqualPositions)) {
        e.target.classList.add('drag-enter')
      }
    },

    onDragLeave(e) {
      e.target.classList.remove("drag-enter");
    },

    onDragOver(e) {
      e.preventDefault();
    },

    onDrop(e) {
      e.preventDefault();

      // don't drop on other draggables
      if (e.target.id !="start" && (e.target.id < this.list.length || this.positions[(e.target.id - this.list.length - 1)].length >= this.numberOfEqualPositions)) {
        return
      }

      const draggedId = e.dataTransfer.getData("text");
      const draggedEl = document.getElementById(draggedId);

      
       this.choices[draggedId] = this.pointDistribution[(e.target.id - this.list.length - 1)];
       console.log( "new choice: ");
       console.log( this.choices);
        
      // check if original parent node  
      if (draggedEl.parentNode === e.target) {
        e.target.classList.remove("drag-enter");
        return;
      }

      this.positions[(e.target.id - this.list.length - 1)].push(draggedId);
      console.log("end")
      if(draggedEl.parentNode.id > 0){
        console.log(draggedEl.parentNode.id);
        this.positions[(draggedEl.parentNode.id - this.list.length - 1)].pop(draggedId);
      }
      

      // make the exchange
      draggedEl.parentNode.removeChild(draggedEl)

      
      e.target.appendChild(draggedEl)
      e.target.classList.remove('drag-enter')
      this.$forceUpdate();
    },

    xy(){
      console.log(this.positions)
    }
  }
}
</script>

<style scoped lang="sass">
.drop-target
    margin-top: 20px
    min-width: 200px
    min-height: 100px
    background-color: gainsboro

.drop-start 
    margin-top: 20px
    min-width: 200px
    min-height: 100px
    background-color: gainsboro


.drag-enter
  outline-style: dashed


@media only screen and (max-width: 500px)
  .drop-target
    height: 200px
    width: 100px
    min-width: 100px
    background-color: gainsboro

  .box
    width: 50px
    height: 50px

.box:nth-child(3)
  clear: both
</style>
