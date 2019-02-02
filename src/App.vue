<template>
  <div id="app">

    <component :is="modal.current" :props="modal.props" :settings="settings"
               @close="closeModal" @update="update" @open="openModal"
               @secret="settings.secret = true" />
   
    <div class="header" :class="{ loaded: renderFinished }"
         @scroll="alert('abcd')" >
      <div class="outer">
        <h1>☆'s MHGen Talisman Editor</h1>
      </div>
      <transition name="download-transition">
        <div class="dl-transition-holder" v-if="renderFinished">
          <div class="download button" @click="download">Save Changes</div>
          <a class="settings button" @click="openModal('settings')"></a>
        </div>
      </transition>
    </div>
    
    <div id="upload-holder" v-show="renderDelay">
      <div class="font-test"></div>
      Please select your extdata file: 
      <input class="upload" type="file" @change='init' v-show="!loading" />
      <div id="loading" v-show="loading">Loading...</div>
    </div>
    
    <transition name="app-transition" @after-enter="setRenderFinished">
    <div v-if="!renderDelay" class="app-body">
      <ul id="files">
        <li v-for="(save, index) in saves" @click="setActive(index)"
            :class="[{ active: $store.state.active == index}, 
                     { disabled : !save }]" v-bind:key="index"
        >
          <span>File {{ index + 1 }}:</span>
          <h3 :class="'name'">{{ save || "(none)" }}</h3>
        </li>
      </ul>
      
      <div class="button warning" @click="clearCharms" v-show="charms">Clear Talismans</div>
      <div class="button" @click="importCharms" v-show="file">Import Talismans</div>
      <div class="button" @click="exportCharms" v-show="file && charms">Export Talismans</div>
      
      <ul id="charms">
        
        <li class="charms-header">
          <div v-for="column in columns" 
               :class="[column.id, 
                   {'sort-down': column.id == lastSortKey && sortOrder == -1 },
                   {'sort-up': column.id == lastSortKey && sortOrder == 1 }]" 
               @click="sortCharms(column.id)"  v-bind:key="column.id">
            {{ column.name }}
          </div>
        </li>
        
        <charm v-for="offset in charmOffsets" v-if="offset" :key="offset"
               :offset="offset" :equipSet="equipSets[offset]"
               :skillSort="settings.skillSort" :skillMax="settings.skillMax"
               :class="{'active-charm': (activeCharm && activeCharm == offset)}"
               @remove="removeCharm"
               @active="setActiveCharm"
        />
      
        <li class="add-charm" @click='newCharm' v-show="file && emptyOffsets.length">
          <span class="add">➕</span> Add Talisman
        </li>
        
      </ul>
      
    </div>
    </transition>
    
    <div id="footer" :class="{loaded: renderFinished}">
      <ul class="menu">
        <li><a @click="openModal('about')">About</a></li>·
        <li><a @click="openModal('faq')">FAQ</a></li>·
        <li><a href="http://github.com/sand-bird/talismans">Source</a></li>·
        <li><a @click="openModal('contact')">Contact</a></li>
      </ul>
      <div class="copy">© 2017 <a href="http://github.com/sand-bird">sand bird</a></div>
    </div>
    
  </div>
</template>

<script>
import fileSaver from 'file-saver'
import stringify from 'json-stringify-pretty-compact'
import { EventEmitter } from 'events'

import { loadSaves, loadOffsets, loadCharms, loadEquipSets, 
         processDecorations, filterCharmData, getRawCharm,
         saveCharms, compareCharms, DEBUG } from './utils'
import charm from './Charm.vue'
import * as modals from './modals'

class Modal extends EventEmitter {
  constructor() {
    super()
    this.current = ''
    this.props = null
    this.on('open', function(modal, props) {
      debug('[modal] open: ' + modal)
      this.current = modal
      this.props = props
    })
    this.on('close', function() {
      debug('[modal] close: ' + this.current)
      this.current = ''
    })
    this.on('confirm', function(...args) {
      debug (
        '[modal] confirm: ' + this.current + (args.length ? ' ' + args : '')
      )
    })
  }
}
var modal = new Modal()

const debug = (msg) => {
  if (DEBUG) console.log("App " + msg)
}

export default {
  name: 'app',
  data () {
    return {
      modal: modal,
      
      /* render control flags */
      
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
      
      /* settings */

      settings: {
        skillSort: 1,
        skillMax: 1,
        decoWarn: 1,
        decoClear: 1,
        decoImport: 0,
        decoCopy: 0,
        secret: false
      },
      settingDescription: null,
      settingTimeout: null,
      
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
    charm, 
    'about': modals.about, 
    'settings': modals.settings, 
    'faq': modals.faq, 
    'contact': modals.contact, 
    'delete': modals.deleteModal, 
    'import': modals.importModal,
    'changelog': modals.changelog
  },
  mounted () {
    document.addEventListener("keydown", (e) => {
      if (e.keyCode == 27) {
        this.closeModal()
      }
    })
  },
  computed: {
    // flag that store sets when it's done initializing
    loaded () { return this.$store.state.loaded },
    
    // flag used by "clear charms" button
    charms () { return this.charmOffsets && this.charmOffsets.length },
    
    charmOffsets: {
      get () { 
        debug("[computed] charmOffsets: get")
        return this.$store.getters.charmOffsets
      },
      set (val) {
        debug("[computed] charmOffsets: set")
        this.$store.commit('UPDATE_CHARMOFFSETS', val)
      }
    },
    
    emptyOffsets () {
      debug("[computed] emptyOffsets: get")
      return this.$store.getters.emptyOffsets
    },
    
    equipSets () {
      return this.$store.getters.equipSets
    }
  },
  
  watch: {
    loaded (val) {
      debug("[watch] loaded: " + val)
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
      debug("[methods] setRenderFinished")
      setTimeout(() => {
        console.log("render finished")
        this.renderFinished = true
      }, 0)
    },
    
    init (event) {
      debug("[methods] init")
      if (event.target.files[0].size != 4000815) {
        alert("Error: wrong file size!")
        event.target.value = null
        return
      }

      this.loading = true
      let file = event.target.files[0]
      let reader = new FileReader()

      reader.onload = function (e) {
        let file = Buffer.from(e.target.result)        
        this.file = true
        
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

        this.$store.dispatch('init', {
          charms: loadCharms(file),
          offsets: loadOffsets(file),
          equipSets: loadEquipSets(file),
          active: a,
          file: file
        })
        
        // initialize settings to user's localStorage
        let settings = ['skillSort', 'skillMax', 'decoWarn', 'decoClear']
        settings.forEach( key => {
          if (localStorage.hasOwnProperty(key))
            this.settings[key] = parseInt(localStorage.getItem(key))
        })
      }.bind(this)
      reader.readAsArrayBuffer(file)
    },
    
    setActive (index) {
      debug("[methods] setActive: " + index)
      if (this.saves[index] && this.active != index) {
        this.$store.dispatch('setActive', index)
        this.activeCharm = null
      }
    },
    
    download () {
      debug("[methods] download")
      this.$store.commit('SAVE_CHARMS')
      var binaryData = []
      binaryData.push(this.$store.state.file)
      fileSaver.saveAs (
        new Blob(binaryData, {type: "application/octet-stream"}), 
        'system', false
      )
    },
    
    exportCharms () {
      debug("[methods] exportCharms")
      let charms = []
      
      for (let i = 0; i < this.charmOffsets.length; i++) {
        let charm = this.$store.state.charms[this.charmOffsets[i]]
        charms.push(charm)
      }
      
      let charmsToExport = filterCharmData(charms, true)
      
      fileSaver.saveAs (
        new Blob([stringify(charmsToExport)], {type: "text/json"}),
       'talismans_' + this.saves[this.$store.state.active] + '.txt', false
      )
    },
    
    openModal (modal, props) {
      debug("[methods] openModal: " + modal)
      this.modal.emit('open', modal, props)
    },
    
    closeModal (...args) {
      debug("[methods] closeModal: " + args)
      this.modal.emit('close')
      if (args.length && typeof args[0] === 'string') 
        this.modal.emit(...args)
    },
    
    update (...args) {
      debug("[methods] update: " + args)
      if (args.length < 2) {
        console.log("[App.update] Error: Not enough arguments!")
        return
      }
      let val = args[args.length - 1]
      let key = args[args.length - 2]
      let obj = this

      if (args.length > 2) {
        for (let i = 0; i < args.length - 2; i++) {
          if (args[i] in obj) obj = obj[args[i]]
          else {
            console.log("[App.update] Error: Key " + args[i] + " not found!")
            return
          }
        }
      }
      if (key in obj) obj[key] = val
      else {
        console.log("[App.update] Error: Key " + args[i] + " not found!")
      }
    },
    
    removeCharm (offset) {
      debug("[methods] removeCharm: " + offset)
      // make ABSOLUTELY SURE that equip set charms can't be deleted
      if (this.equipSets[offset]) return
      // if we need a decoration warning, open the modal
      // and only delete if the modal emits a 'confirm' event
      if (this.settings.decoWarn &&
          this.$store.state.charms[offset].filledSlots) {
        this.openModal('delete')
        this.modal.once('confirm', () => {
          this.$store.dispatch('remove', offset)
        })
      }
      else this.$store.dispatch('remove', offset)
    },
    
    setActiveCharm (offset) {
      debug("[methods] setActiveCharm: " + offset)
      if (this.activeCharm && this.activeCharm == offset) 
        this.activeCharm = null
      else this.activeCharm = offset
    },
    
    // new charms will be placed at the last available place
    // in the equipment box, then in slots created by deleting
    // charms as a last resort
    newCharm () {
      debug("[methods] newCharm: " + this.activeCharm)
      let newCharm = {}
      let sourceCharm = this.$store.state.charms[this.activeCharm] || null
      if (this.activeCharm && sourceCharm) newCharm = {
        rarity: sourceCharm.rarity,
        slots: sourceCharm.slots,
        type: sourceCharm.type,
        // why does js default to passing arrays by reference this is dumb
        skills: sourceCharm.skills.slice(),
        skillValues: sourceCharm.skillValues.slice()
      }
      else newCharm = {
        rarity: 7,
        slots: 3,
        type: 327,
        skills: [36, 18],
        skillValues: [5, 10]
      }
      if (this.settings.decoCopy) newCharm.decorations = sourceCharm.decorations
      processDecorations(newCharm)
      
      this.$store.dispatch('add', newCharm)
    },
    
    importCharms () {
      debug("[methods] importCharms")
      this.openModal('import', {
        emptyCount: this.emptyOffsets ? this.emptyOffsets.length : 0,
        deco: this.settings.decoImport
      })
      
      this.modal.once('confirm', (ow, obj) => {
        if (ow && this.charmOffsets.length) {
          this.clearCharms().then((res) => {
            this.$store.dispatch('add', obj)
          })
        }
        else {
          this.$store.dispatch('add', obj)
        }
      })
    },
    
    // all: when set, clearCharms does not track charms with
    // decorations, and deletes indiscriminately instead
    clearCharms () {
      debug("[methods] clearCharms: " + this.settings.decoClear)
      return new Promise((resolve, reject) => {
        let emptyCharmOffsets = []
        let filledCharmOffsets = []
        
        this.charmOffsets.forEach((offset) => {
          if (this.settings.decoClear < 2 &&
              this.$store.state.charms[offset].filledSlots)
            filledCharmOffsets.push(offset)
          else if (!this.equipSets[offset])
            // even if decoClear is Always, we still want to push 
            // each charm offset to a new array before clearing --
            // store freaks out and doesn't delete right otherwise
            emptyCharmOffsets.push(offset)
        })
        // if we have empty charms, our work is done
        if (emptyCharmOffsets.length) {
          this.$store.dispatch('remove', emptyCharmOffsets)
          resolve()
        }
        // if we are here, it means there are no empty charms
        else if (filledCharmOffsets.length) {
          // decoClear is Smart: clear filled charms
          if (this.settings.decoClear) {
            // decoWarn is On: we need a modal
            if (this.settings.decoWarn) {
              this.openModal('delete')
              
              this.modal.once('confirm', () => {
                this.$store.dispatch('remove', filledCharmOffsets)
                resolve()
              })
            }
            // decoWarn is Off: just clear it
            else {
              this.$store.dispatch('remove', filledCharmOffsets)
              resolve()
            }
          }
          // decoClear is Never: do nothing
          else resolve()
        }
        // edge case: clear when there are no charms
        // (right now this should only happen when selecting
        // overwrite while importing charms; we still need 
        // to resolve so such an import will succeed)
        else resolve()
      })
    },
    
    sortCharms (sortKey) {   
      debug("[methods] sortCharms: " + sortKey)
      let sortKeys = [
        'rarity',
        'slots',
        'filledSlots',
        ['skills', 0],
        ['skillValues', 0],
        ['skills', 1],
        ['skillValues', 1]
      ]
      // flips sortOrder if sorting again on the same key;
      // on a new key, sortOrder should always be 1
      if (this.lastSortKey == sortKey) this.sortOrder *= -1
      else this.sortOrder = 1
      this.lastSortKey = sortKey
      
      if (sortKey == 'skill1' || sortKey == 'skill2') {
        // grab index off the '1' or '2' in the sortKey
        let index = parseInt(sortKey.slice(-1)) - 1
        sortKeys = [
          ['skills', index], 
          ['skillValues', index], 
          ['skills', 1 - index], 
          ['skillValues', 1 - index],
          'rarity',
          'slots',
          'filledSlots'
        ]
      }
      else {
        sortKeys.splice(sortKeys.indexOf(sortKey), 1)
        sortKeys.unshift(sortKey)
      }
      
      let sortFn = (a, b) => {
        return compareCharms ( 
          this.$store.state.charms[a],
          this.$store.state.charms[b],
          sortKeys, 
          this.settings.skillSort, this.sortOrder
        )
      }
      this.charmOffsets = this.charmOffsets.sort(sortFn)
    }
  }
}
</script>

<style>
.font-test:before {
  content: '\e800 \e801 \e802 \e803 \e804 \e805 \e806 \f02e \f0c5 \f10c \f192';
  display: none;
  font-family: 'icons';
}


.icon-ok-circled2:before { content: '\e800'; }
.icon-ok-circled:before { content: '\e801'; }
.icon-circle-empty:before { content: '\f10c'; }
.icon-dot-circled:before { content: '\f192'; }

.icon-cancel:before { content: '\e802'; }
.icon-cog:before { content: '\e803'; }
.icon-cog-1:before { content: '\e804'; }
.icon-wrench:before { content: '\e805'; }
.icon-attach-1:before { content: '\e806'; }
.icon-download:before { content: '\f02e'; }


html {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.modal-body * {
  -webkit-touch-callout: default;
  -webkit-user-select: auto;
  -khtml-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
}

body {
  overflow-y: scroll;
}

::selection {
  background: #68bd95; /* WebKit/Blink Browsers */
  color: #fff;
}
/* 74d1a5 68bd95 */
/* b8f5d8 94ebc2 a9efcd a5f0cb */
/* 21ab68 25c178 */

::-moz-selection {
  background: #68bd95; /* Gecko Browsers */
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
  margin: 50px auto 0;
  padding: 0 0 5px;
  border-bottom: 1px solid #bbb;
  box-shadow: 0 3px 2px -2px #ddd;
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
  text-shadow: 0px 1px 2px #eee, 0px 1.5px 1px #ccc;
  font-size: 2em;
}

.header.loaded .outer, .header.loaded h1 {
  /* change 1st value to dist from left (px or %) */
  transform: translate3d(0, 0, 0);
  transition: transform 0.75s ease;
  will-change: transform;
}

.download-transition-enter {
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

.download-transition-enter-active {
  transition: opacity 1s ease;
  transition-delay: 0.2s;
}

/* svg hamburger icon
.menu {
  width: 42px;
  height: 42px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='20' fill='#54de9b'><polygon points='0,0 30,0 30,2 0,2 '/><polygon points='0,9 30,9 30,11 0,11 '/><polygon points='0,18 30,18 30,20 0,20 '/></svg>") no-repeat;
  background-color: #FFF;
  box-shadow: 0 0 10px 2px rgba(255,255,255,0.8);
  background-position: 50% 50%;
  background-size: 28px 20px;
  display: block;
  position: absolute;
  left: 0px;
  bottom: 22px;
}
*/

.button.download {
  padding: 10px 32px;
  line-height: 20px;
  height: 42px;
  position: absolute;
  right: 40px;
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

.settings.button:after {
  content: '\e803 \e804 \e805';
  content: '\e805';
  font-family: 'icons';
  font-size: 18px;
}

.settings.button {
  padding: 10px 0;
  width: 34px;
  text-align: center;
  line-height: 20px;
  height: 42px;
  position: absolute;
  right: 0;
  bottom: 20px;
 
  background-color: #fefefe;
  color: #999;
  /*17a563; */
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #eaeaea, 0 1px 2px #eee;
  transition: all 0.25s;
  
}

.settings.button:hover {
  background-color: #fefefe;
  color: #666; 
}

.app-body .button {
  width: 200px;
  padding-left: 0;
  padding-right: 0;
}

.button b.sort-id {
  width: 2em;
  display: inline-block;
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
  text-decoration: none;
}

a:hover {
  color: #54de9b;
}

#files {
  display: block;
  overflow: hidden;
  padding-bottom: 5px;
  width: 450px;
  margin: 40px auto 20px;
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
  /* border: 1px solid #ccc; */
  box-shadow: 0 0 1px 1px #ccc;
  border-radius: 10px;
  width: 500px;
  margin: 40px auto 10px;
}

.upload {
  box-shadow: 0 0 5px #ccc;
}

.upload, #loading {
  display: block;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 10px;
  height: 21px;
  line-height: 21px;
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

.button.warning {
  background-color: #fefefe;
  border-color: #e3b9b9;
  color: #b95858; /* 17a563; */
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #eaeaea, 0 1px 2px #eee;
  /* transition: all 0.1s; */
}

.button.warning:hover {
  background-color: #f7c7c7;
  background-color: #fefefe;
  border-color: #8b2020;
  border-color: #d08d8d;
  color: #6b1010;
  color: #a03a3a;
  box-shadow: inset 1px 1px 0 #ffd7d7, inset -1px -1px 0 #d8a3a3, 0 1px 2px #eee;
  box-shadow: inset 1px 1px 0 #fff,inset -1px -1px 0 #eaeaea, 0 1px 2px #eee;
  /* transition: all 0.1s; */
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
  margin: 0 auto;
}

#footer.loaded {
  margin: 40px auto 20px;
}

.menu {
  padding-bottom: 20px;
  padding-top: 5px;
  border-bottom: 1px solid #ccc;
  display: inline-block;
}

.loaded .menu {
  padding-bottom: 10px;
  margin: 0 0 10px;
  padding-top: 0;
}

.menu a {
  cursor: pointer;
}

.loaded .copy {
  display: inline-block;
}

.loaded .copy:before {
  content: "·";
  margin-right: 15px;
}

body::-webkit-scrollbar-track {
	border-radius: 0px;
	background-color: transparent;
}

body::-webkit-scrollbar {
  border-radius: 10px;
	width: 16px;
	background-color: #fff;
}

body::-webkit-scrollbar-thumb {
	border-radius: 6px;
	width: 10px;
	background-clip: padding-box;
	border: 2px solid transparent;
	background-color: #ccc;
}

body::-webkit-scrollbar-button {
  height: 0px;
  background-color: #fff;
}

</style>
