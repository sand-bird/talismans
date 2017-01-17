<template>
  <div id="app">
    <modal v-if="showModal">    
      <h3 slot="header">Decoration Warning</h3>
      <div slot="body">This action will delete a talisman with decorations. Decorations will be lost.</div>
      <div slot="footer">
        <button class="button" @click="showModal = false; doRemoveCharm(charmToRemove)">OK</button>
        <button class="button" @click="showModal = false; charmToRemove = null">Cancel</button> 
      </div>
    </modal>
    
    <div class="header" :class="{ loaded: file && charms }" 
         v-on:scroll="alert('abcd')" >
      <h1>{{ title }}</h1>
      <div class="download button" v-on:click="download" v-show="file">Save Changes</div>
    </div>
    
    <div id="upload-holder" v-show="!file">
      Please select your extdata file: 
      <input id="upload" type="file" v-on:change='init' v-show="!loading" />
      <div id="loading" v-show='loading'>Loading...</div>
    </div>
    
    <ul id="files" v-show="file">
      <li v-for="(name, index) in names" v-on:click="setActive(index)"
          :class="[{ active: active == index}, 
                   { disabled : !name }]"
      >
        <span>File {{ index + 1 }}:</span>
        <h3 :class="'name'">{{ name || "(none)" }}</h3>
      </li>
    </ul>
    
    <div class="button" v-on:click='clearCharms' v-show="file && charms">Clear Charms</div>
    <div class="button disabled" v-on:click='' v-show="file && charms">Export Charms</div>
    <div class="button disabled" v-on:click='' v-show="file">Import Charms</div>
    
    <ul id="charms" v-show="file">
      
      <li class="charms-header">
        <div v-for="column in columns" :class="column.id" v-on:click="sortCharms(column.id)">
          {{ column.name }}
        </div>
      </li>
      
      <charm v-for="offset in charmOffsets"
             :charm="charms[offset]" :offset="offset" 
             :availableSkillsList="availableSkills" 
             v-on:remove="removeCharm"
      />
    
      <li class="add-charm" v-on:click='newCharm' v-show="file && emptyOffsets.length">
        <span class="add">➕</span> Add Charm
      </li>
    </ul>
    
    <div id="footer">
      © 2017 <a href="http://github.com/sand-bird">sand bird</a>
    </div>
  </div>
</template>

<script>
import { loadFiles, loadCharms, saveCharms } from './utils'
import charm from './Charm.vue'
import modal from './Modal.vue'
import skills from 'json-loader!./skills.json'
import fileSaver from 'file-saver'

export default {
  name: 'app',
  data () {
    return {
      loading: false,
      showModal: false,
      charmToRemove: null,
      title: '☆\'s MHGen Talisman Editor',
      file: null,
      names: [],
      active: null,
      charms: {},
      charmOffsets: [],
      emptyOffsets: [],
      lastSortKey: null,
      sortOrder: 1,
      columns: [
        { name: 'Rarity', id: 'rarity' },
        { name: 'Slots', id: 'slots' },
        { name: 'Skill 1', id: 'skill1' },
        { name: 'Skill 2', id: 'skill2' }
      ],
      charm: charm,
      /* available skills are pushed to this 2d array.
         for 2nd slot skills, we start with id 0 available,
         as that represents no skill. the 1st slot must
         have a skill, so id 0 is NOT an option.
         (this doesn't have to be computed every time --
         i am just too lazy to make another json file)  */
      availableSkills: {
        mystery: [[],[0]],
        shining: [[],[0]],
        timeworn: [[],[0]]
      }
    }
  },
  components: {
    charm, modal
  },
  methods: {
  
    init (event) {
      this.loading = true
    
      if (event.target.files[0].size != 4000815) {
        alert("Wrong file size!")
        event.target.value = null
        return
      }
      
      let file = event.target.files[0]

      let reader = new FileReader()
      let vm = this
      
      reader.onload = (e) => {
        vm.file = Buffer.from(e.target.result)
        vm.names = loadFiles(vm.file)
        // finds first occupied file and inits it to active
        let a = vm.names.findIndex((n) => { return n != null })
        if (a == -1) {
          // no saves on file - edge case but still
          alert("Error: no saves on file!")
          event.target.value = null
          vm.file = null
          this.loading = false
          return
        }
        vm.active = a

        vm.charms = loadCharms(vm.file, a)
        vm.charmOffsets = Object.keys(vm.charms).filter(key => vm.charms[key] !== null)
        
        let empty = Object.keys(vm.charms).filter(key => vm.charms[key] === null)
        vm.emptyOffsets = empty.reverse()
        
        this.initAvailableSkills()
        this.loading = false
      }
      
      reader.readAsArrayBuffer(file)
    },
    
    setActive (index) {
      if (this.names[index] && this.active != index) {
        saveCharms(this.data, this.active, this.charms)
        this.active = index
        this.charms = loadCharms(this.file, index)
      }
    },
    
    download (event) {
      saveCharms(this.file, this.active, this.charms)
      var binaryData = []
      binaryData.push(this.file)
      fileSaver.saveAs(new Blob(binaryData, {type: "application/octet-stream"}), 'system', false)
    },
    
    initAvailableSkills () {

      ["mystery", "shining", "timeworn"].forEach((source) => {
        for (let i = 1; i < skills.length; i++) {
          if (skills[i][source]) {
            for (let slot = 0; slot < 2; slot++) {
              if (skills[i][source][slot]) {
                this.availableSkills[source][slot].push(skills[i].id)
              }
            }
          }
        }
      })
      console.log("initialized skills")
    },
    
    /* pops up the decoration warning modal if the charm to be
       removed has decorations equipped, then stores the offset
       so the modal button can access it. clunky, but works
    */
    removeCharm (offset) {
      if (this.charms[offset].filledSlots) {
        this.showModal = true
        this.charmToRemove = offset
      }
      else this.doRemoveCharm(offset)
    },
    
    doRemoveCharm (offset) {
      console.log("removed " + offset)
      this.charms[offset] = null
      this.emptyOffsets.push(offset)
      this.charmOffsets[this.charmOffsets.indexOf(offset)] = null
    },
    
    // new charms will be placed at the last available place
    // in the equipment box, then in slots created by deleting
    // charms as a last resort
    newCharm () {
      let newOffset = this.emptyOffsets.shift()
      this.charms[newOffset] = {
        offset: newOffset,
        rarity: 1,
        slots: 0,
        type: 325,
        skills: [1, 0],
        skillvalues: [1, 0],
        decorations: [0, 0, 0]
      }
      this.charmOffsets.push(newOffset)
    },
    
    clearCharms () {
      let filledCharmOffsets = []
      this.charmOffsets.forEach((offset) => {
        if (this.charms[offset].filledSlots) {
          filledCharmOffsets.push(offset)
        }
        else {
          this.charms[offset] = null
          this.emptyOffsets.push(offset)
        }
      })
      console.log(filledCharmOffsets)
      this.charmOffsets = filledCharmOffsets
    },
    
    sortCharms (sortKey) {
      if (this.lastSortKey == sortKey) this.sortOrder *= -1
      else this.sortOrder = 1
      this.lastSortKey = sortKey
      
      let offsets = []
      for (let i = 0; i < this.charmOffsets.length; i++) {
        if (this.charms[this.charmOffsets[i]]) offsets.push(this.charmOffsets[i])
      }
      
      let sortFn = () => { return 1 }
      
      if (sortKey == 'skill1' || sortKey == 'skill2') {
        let index = parseInt(sortKey.slice(-1)) - 1
        sortFn = (a, b) => {
          let charmA = this.charms[a]
          let charmB = this.charms[b]
          if (charmA.skills[index] == charmB.skills[index]) {
            if (charmA.skillvalues[index] == charmB.skillvalues[index]) {
              if (charmA.skills[1 - index] == charmB.skills[1 - index]) {
                if (charmA.skillvalues[1 - index] == charmB.skillvalues[1 - index]) {
                  return 0
                }
                else if (charmA.skillvalues[1 - index] > charmB.skillvalues[1 - index]) {
                  return 1 * this.sortOrder
                } else return -1 * this.sortOrder
              }
              else if (charmA.skills[1 - index] > charmB.skills[1 - index]) {
                return 1 * this.sortOrder
              } else return -1 * this.sortOrder          
            }
            else if (charmA.skillvalues[index] > charmB.skillvalues[index]) {
              return 1 * this.sortOrder
            } else return -1 * this.sortOrder
          }
          else if (charmA.skills[index] > charmB.skills[index]) {
            return 1 * this.sortOrder
          } else return -1 * this.sortOrder
        }
      }
      
      else {
        sortFn = (a, b) => {
          a = this.charms[a][sortKey]
          b = this.charms[b][sortKey]
          return (a == b ? 0 : a > b ? 1 : -1) * this.sortOrder
        }
      }
      
      offsets = offsets.sort(sortFn)
      this.charmOffsets = offsets
    }
  }
}
</script>

<style>
html {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
}

*, *:before, *:after {
  box-sizing: inherit;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

h1, h2 {
  font-weight: normal;
  margin: 20px 0;
}

.header {
  margin: 70px auto 40px;
  padding: 0 0 5px;
  border-bottom: 1px solid #ccc;
  width: 680px;
  position: relative;
}

.header.loaded h1 {
  text-align: left;
}

.button.download {
  padding: 10px 50px;
  line-height: 20px;
  position: absolute;
  right: 0;
  bottom: 20px;
  border-color: #42b983;
  color: #25c178;
  box-shadow: inset 1px 1px 0 #fff,inset -1px -1px 0 #eaeaea, 0 1px 2px #eee;
}

.button.download:hover {
  background-color: #fff;
  border-color: #1c975b;
  color: #146c41;
  box-shadow: inset 1px 1px 0 #fff,inset -1px -1px 0 #ddd, 0 1px 2px #eaeaea;
}


ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

a:hover {
  color: #54de9b;
}

#files {
  display: block;
  overflow: hidden;
  padding-bottom: 5px;
  width: 450px;
  margin: 20px auto;
}

#files li {
  background-color: #fcfcfc;
  width: 149px;
  margin: 0;
  float: left;
  border: 1px solid #ccc;
  padding: 10px 5px;
  box-shadow: inset 1px 1px 0 #fff, inset 0 -1px 0 #ddd, 0 2px 1px #eee;
  cursor: pointer;
}

#files li:first-child {
  border-radius: 20px 0 0 20px;
}

#files li:last-child {
  border-radius: 0 20px 20px 0;
  width: 150px;
}

#upload-holder {
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 500px;
  margin: 0 auto;
}

#upload {
  box-shadow: 0 0 5px #ccc;
}

#upload, #loading {
  display: block;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 10px;
}

#loading {
  animation: load 1.5s infinite;
}

@keyframes load {
  0%, 80%, 100% {
    opacity: 1
  }
  40% {
    opacity: 0.5
  }
}

.active {
  background-color: #94ebc2 !important;
  border-color: #25c178 !important;
  box-shadow: inset 1px 1px 0 #bff3da, inset 0 -1px 0 #54de9b, 0 2px 1px #ddd !important;  
}

.active:hover {
  background-color: #a9efcd !important;
  border-color: #21ab68 !important;
  box-shadow: inset 1px 1px 0 #d4f7e6, inset 0 -1px 0 #69e2a8, 0 2px 1px #ddd !important;  
}

#files li:hover {
  background-color: #fefefe;
  color: #000;
  border-color: #aaa;
}

.disabled, .disabled:hover {
  color: inherit !important;
  background-color: #eee !important;
  box-shadow: inset 0 1px 0 #ddd, inset 0 -1px 0 #fafafa, 0 2px 1px #fafafa !important;
  border-color: #ccc !important;
}


.name {
  font-size: 20px;
  font-weight: normal;
  line-height: 30px;
  margin: 5px 0 0;
}

.disabled .name {
  opacity: 0.5;
  font-size:14px;
}

.active .name {
  font-weight: bold;
}


.button {
  display: inline-block;
  border:1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px 40px;
  box-shadow: inset 1px 1px 0 #fff,inset -1px -1px 0 #eaeaea, 0 1px 2px #eee;
  text-shadow: 0 1px 0 #fff;
  background-color: #fcfcfc;
  cursor: pointer;
  margin: 2px 4px;
}

.button:hover, .button:active {
  border-color: #aaa;
  color: #000;
  background-color: #fefefe;
}

#charms {
  width: auto;
  display: block;
  text-align: center;
  margin: 20px auto;
}

.add-charm {
  width: 680px;
  height: 40px;
  border: 1px solid #eee;
  border-radius: 5px;
  color: #42b983;
  line-height: 40px;
  cursor: pointer;
}

.add-charm .add {
  margin-right: 5px;
}

.add-charm:hover {
  color: #54de9b;
}

#footer {
  position: relative;
  margin: 40px auto;
}

</style>
