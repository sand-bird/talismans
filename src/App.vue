<template>
  <div id="app">
    <modal v-if="showModal">    
      <h3 slot="header">Decoration Warning</h3>
      <div slot="body">This action will delete a talisman with decorations. Decorations will be lost.</div>
      <div slot="footer">
        <button class="button" @click="showModal = false; removeCharm(charmToRemove)">OK</button>
        <button class="button" @click="showModal = false; charmToRemove = null">Cancel</button> 
      </div>
    </modal>
    
    <div class="header" :class="{ loaded: renderFinished }"
         v-on:scroll="alert('abcd')" >
      <div class="outer"><h1>☆'s MHGen Talisman Editor</h1></div>
      <transition name="download">
        <div class="download button" v-on:click="download" v-if="renderFinished">Save Changes</div>
      </transition>
    </div>
    
    <div id="upload-holder" v-show="renderDelay">
      <div class="font-test"></div>
      Please select your extdata file: 
      <input id="upload" type="file" v-on:change='init' v-show="!loading" />
      <div id="loading" v-show="loading">Loading...</div>
    </div>
    
    <transition name="app-transition" v-on:after-enter="setRenderFinished">
    <div v-if="!renderDelay">
      <ul id="files">
        <li v-for="(save, index) in saves" v-on:click="setActive(index)"
            :class="[{ active: $store.state.active == index}, 
                     { disabled : !save }]"
        >
          <span>File {{ index + 1 }}:</span>
          <h3 :class="'name'">{{ save || "(none)" }}</h3>
        </li>
      </ul>
      
      
      <div class="button" v-on:click='clearCharms' v-show="charms">Clear Talismans</div>
      <div class="button" v-on:click='save' v-show="charms">Save</div>
      <!--
      <div class="button disabled" v-on:click='' v-show="file && charms">Export Charms</div>
      <div class="button disabled" v-on:click='' v-show="file">Import Charms</div>
      -->
      
      <ul id="charms">
        
        <li class="charms-header">
          <div v-for="column in columns" 
               :class="[column.id, 
                   {'sort-down': column.id == lastSortKey && sortOrder == 1 },
                   {'sort-up': column.id == lastSortKey && sortOrder == -1 }]" 
               v-on:click="sortCharms(column.id)">
            {{ column.name }}
          </div>
        </li>
        
        <charm v-for="offset in charmOffsets" :offset="offset" :key="offset"
               :class="{'active-charm': (activeCharm && activeCharm == offset)}"
               v-if="offset"
               v-on:remove="tryRemoveCharm"
               v-on:active="setActiveCharm"
        />
      
        <li class="add-charm" v-on:click='newCharm' v-show="file && emptyOffsets.length">
          <span class="add">➕</span> Add Talisman
        </li>
      </ul>
    </div>
    </transition>
    
    
    <div id="footer">
      © 2017 <a href="http://github.com/sand-bird">sand bird</a>
    </div>
  </div>
</template>

<script>
import { loadSaves, loadOffsets, loadCharms, saveCharms, getRawCharm } from './utils'
import charm from './Charm.vue'
import modal from './Modal.vue'
import fileSaver from 'file-saver'

export default {
  name: 'app',
  data () {
    return {
      /* render control flags */
      
      showModal: false,
      // controls display of "loading..." animation
      loading: false,
      // ensures nothing is rendered until charms 
      // are loaded in the store
      renderDelay: true,
      // when the charms are done rendering we animate
      // the header (otherwise it's choppy)
      renderFinished: false,
      
      /* saved offsets */
 
      // offset of charm in "clipboard"
      activeCharm: null,
      // used by the delete warning modal
      charmToRemove: null,
      
      /* sorting state info */
 
      sortOrder: 1,
      // if same as next sortKey, flip sort order
      lastSortKey: null,

      /* offset info (todo: move back into state??) */
      
      // these are OBJECTS with keys 0, 1, 2 corresponding 
      // to save slot ids where those offsets can be found.
      // they can't be arrays because of spooky vue action
      // when watched arrays are updated/accessed by index.
      allCharmOffsets: {},
      allEmptyOffsets: {},
      active: null,
      
      /* display strings */
      
      saves: [],
      columns: [
        { name: 'Rarity', id: 'rarity' },
        { name: 'Slots', id: 'slots' },
        { name: 'Skill 1', id: 'skill1' },
        { name: 'Skill 2', id: 'skill2' }
      ]
    }
  },
  components: {
    charm, modal
  },
  computed: {
    // flag that store sets when it's done initializing
    loaded () { return this.$store.state.loaded },
    
    // flag used by "clear charms" button
    charms () { return this.charmOffsets && this.charmOffsets.length },
    
    charmOffsets () { 
      console.log("charmOffsets")
      return this.allCharmOffsets[this.active]
    },
    
    emptyOffsets () { 
      console.log("charmOffsets")
      return this.allEmptyOffsets[this.active]
    }
  },
  
  watch: {
    loaded (val) {
      if (val && this.renderDelay) {
        setTimeout(() => {
          this.renderDelay = false
          console.log("ready to render")
        }, 0)
      }
    }
  },
  
  methods: {
  
    setRenderFinished () {
      setTimeout(() => {
        console.log("render finished")
        this.renderFinished = true
      }, 0)
    },
  
    init (event) {
    
      if (event.target.files[0].size != 4000815) {
        alert("Error: wrong file size!")
        event.target.value = null
        return
      }

      console.log("loading: true")
      this.loading = true
      
      let file = event.target.files[0]

      let reader = new FileReader()
      
      reader.onload = function (e) {
        let file = Buffer.from(e.target.result)
        
        console.log("file: true")
        this.file = true
        
        console.log(this)
        
        this.saves = loadSaves(file)
        // finds first occupied file and inits it to active
        let a = this.saves.findIndex((n) => { return n != null })
        if (a == -1) {
          // no saves on file - edge case but still
          alert("Error: no saves on file!")
          event.target.value = null
          this.file = false
          this.loading = false
          return
        }
        
        this.active = a
        let offsets = loadOffsets(file)
        this.allCharmOffsets = offsets.charmOffsets
        this.allEmptyOffsets = offsets.emptyOffsets

        this.$store.dispatch('init', {
          charms: loadCharms(file) //,
          //offsets: loadOffsets(file),
          //active: a
        })
        
        this.$store.dispatch('loadFile', file)

      }.bind(this)
      
      reader.readAsArrayBuffer(file)
    },
    
    setActive (index) {
      if (this.saves[index] && this.active != index) {
        this.active = index
        this.activeCharm = null
      }
    },
    
    download (event) {
      this.$store.commit('SAVE_CHARMS')
      var binaryData = []
      binaryData.push(this.$store.state.file)
      fileSaver.saveAs(new Blob(binaryData, {type: "application/octet-stream"}), 'system', false)
    },
    
    save () {
      let deletedCharms = []
      for (let i = 0; i < 5; i++) {
        let index = Math.floor(Math.random() * (this.charmOffsets.length))
        let charm = this.charmOffsets[index]
        deletedCharms.push(charm)
        this.removeCharm(charm)
      }
      console.log(deletedCharms)
      
      for (let i = 0; i < 5; i++) {
        console.log(getRawCharm(this.$store.state.file, deletedCharms[i]))
      }
      
      this.$store.commit('SAVE_CHARMS')
      
      for (let i = 0; i < 5; i++) {
        console.log(getRawCharm(this.$store.state.file, deletedCharms[i]))
      }
    },
    
    /* pops up the decoration warning modal if the charm to be
       removed has decorations equipped, then stores the offset
       so the modal button can access it. clunky, but works
    */
    tryRemoveCharm (offset) {
      if (this.$store.state.charms[offset].filledSlots) {
        this.showModal = true
        this.charmToRemove = offset
      }
      else this.removeCharm(offset)
    },
    
    removeCharm (offset) {
      this.charmOffsets.splice(this.charmOffsets.indexOf(offset), 1)
      console.log("removed " + offset)
      this.$store.dispatch('remove', offset)
      this.emptyOffsets.push(offset)
    },
    
    setActiveCharm (offset) {
      if (this.activeCharm && this.activeCharm == offset) this.activeCharm = null
      else this.activeCharm = offset
    },
    
    // new charms will be placed at the last available place
    // in the equipment box, then in slots created by deleting
    // charms as a last resort
    newCharm () {
      let newOffset = this.emptyOffsets.pop()
      let newCharm = {}
      let sourceCharm = this.$store.state.charms[this.activeCharm] || null
      if (this.activeCharm && sourceCharm) newCharm = { 
        offset: newOffset,
        rarity: sourceCharm.rarity,
        slots: sourceCharm.slots,
        type: sourceCharm.type,
        // why does js default to passing arrays by reference this is dumb
        skills: sourceCharm.skills.slice(),
        skillValues: sourceCharm.skillValues.slice(),
        decorations: [0, 0, 0],
        minRarity: 1,
        filledSlots: 0
      }
      else newCharm = {
        offset: newOffset,
        rarity: 7,
        slots: 3,
        type: 327,
        skills: [36, 18],
        skillValues: [5, 10],
        decorations: [0, 0, 0],
        minRarity: 1,
        filledSlots: 0
      }
      this.$store.dispatch('add', {offset: newOffset, charm: newCharm}).then(() => {
        this.charmOffsets.splice(this.charmOffsets.length, 0, newOffset)
      })
    },
    
    clearCharms () {
      let offsetsToRemove = []
      let filledCharmOffsets = []
      this.charmOffsets.forEach((offset) => {
        if (this.$store.state.charms[offset].filledSlots)
          filledCharmOffsets.push(offset)
        else
          offsetsToRemove.push(offset)
          this.emptyOffsets.push(offset)
      })
      // this.$store.dispatch('remove', offsetsToRemove)
      console.log(filledCharmOffsets) 
      this.$set(this.allCharmOffsets, this.active, filledCharmOffsets)
    },
    
    sortCharms (sortKey) {
    
      if (this.lastSortKey == sortKey) this.sortOrder *= -1
      else this.sortOrder = 1
      this.lastSortKey = sortKey
      
      let offsets = []
      for (let i = 0; i < this.charmOffsets.length; i++) {
        if (this.$store.state.charms[this.charmOffsets[i]]) offsets.push(this.charmOffsets[i])
      }
      
      let sortFn = () => { return 1 }
      
      if (sortKey == 'skill1' || sortKey == 'skill2') {
        let index = parseInt(sortKey.slice(-1)) - 1
        sortFn = (a, b) => {
          let charmA = this.$store.state.charms[a]
          let charmB = this.$store.state.charms[b]
          if (charmA.skills[index] == charmB.skills[index]) {
            if (charmA.skillValues[index] == charmB.skillValues[index]) {
              if (charmA.skills[1 - index] == charmB.skills[1 - index]) {
                if (charmA.skillValues[1 - index] == charmB.skillValues[1 - index]) {
                  return 0
                }
                else if (charmA.skillValues[1 - index] > charmB.skillValues[1 - index]) {
                  return 1 * this.sortOrder
                } else return -1 * this.sortOrder
              }
              else if (charmA.skills[1 - index] > charmB.skills[1 - index]) {
                return 1 * this.sortOrder
              } else return -1 * this.sortOrder          
            }
            else if (charmA.skillValues[index] > charmB.skillValues[index]) {
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
          a = this.$store.state.charms[a][sortKey]
          b = this.$store.state.charms[b][sortKey]
          return (a == b ? 0 : a > b ? 1 : -1) * this.sortOrder
        }
      }
      
      offsets = offsets.sort(sortFn)
      //this.charmOffsets = []
      
      
      this.charmOffsets = offsets
    }
  }
}
</script>

<style>
@font-face {
  font-family: 'icons';
  src: url('icons.ttf?67942823') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.font-test:before {
  content: '\e800 \e801 \e802 \e803 \e804 \e805 \e806 \f02e \f0c5 \f10c \f192';
  display: none;
  font-family: 'icons';
}

.icon-ok-circled2:before { content: '\e800'; } /* '' */
.icon-ok-circled:before { content: '\e801'; } /* '' */
.icon-doc:before { content: '\e802'; } /* '' */
.icon-doc-inv:before { content: '\e803'; } /* '' */
.icon-attach:before { content: '\e804'; } /* '' */
.icon-clipboard:before { content: '\e805'; } /* '' */
.icon-attach-1:before { content: '\e806'; } /* '' */
.icon-download:before { content: '\f02e'; } /* '' */
.icon-docs:before { content: '\f0c5'; } /* '' */
.icon-circle-empty:before { content: '\f10c'; } /* '' */
.icon-dot-circled:before { content: '\f192'; } /* '' */

html {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
}

body {
  overflow-y: scroll;
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

.app-transition-enter {
  opacity: 0;
}

.app-transition-enter-active {
  transition: opacity 0.5s ease;
  transition-delay: 0s;
}

h1, h2 {
  font-weight: normal;
  margin: 20px 0;
}

.header {
  margin: 50px auto 40px;
  padding: 0 0 5px;
  border-bottom: 1px solid #ccc;
  width: 680px;
  position: relative;
  overflow: hidden;
}

.header .outer {
  border: 0px dashed #0FF;
  float: left;
  width: 100%;
  transform: translate3d(50%, 0, 0);
  position: relative;
  will-change: transform;
}

.header h1 {
  border: 0px solid #F0F;
  float: left;
  transform: translate3d(-50%, 0, 0);
  position: relative;
  will-change: transform;
}

.header.loaded .outer, .header.loaded h1 {
  transform: translate3d(0, 0, 0);
  transition: transform 0.75s ease;
  will-change: transform;
}

.download-enter {
  opacity: 0;
  -webkit-transform: scale(0.95);
  transform: scale(0.95);
}

.download:before {
  content: '\f02e';
  font-family: 'icons';
  margin-right: 0.75em;
  font-weight: 100;
  font-size: 13px;
  vertical-align: top;
}

.download-enter-active {
  transition: all 1s ease;
  transition-delay: 0s;
}

.button.download {
  padding: 10px 40px;
  line-height: 20px;
  position: absolute;
  right: 0;
  bottom: 20px;
  background-color: #fefefe;
  border-color: #25c178;
  color: #25c178; /* 17a563; */
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #eaeaea, 0 1px 2px #eee;
  transition: all 0.25s;
}

.button.download:hover {
  border-color: #1c975b;
  color: #146c41;
  background-color: #b8f5d8;
  box-shadow: inset 1px 1px 0 #e9fffa, inset -1px -1px 0 #94ebc2, 0 1px 2px #eee;
  transition: all 0.25s;
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
