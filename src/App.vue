<template>
  <div id="app">
  
    <modal v-if="showModal == 'settings'" class="settings modal" v-on:close="closeModal">
      <h3 slot="header">Settings</h3>
      <div slot="body">
        <div class="options-item">
          <div class="skill-sort label">Skill Sort:</div>
        
          <ul class="skill-sort options"
             @mouseover="setDesc('skillSort')" @mouseout="setDesc(null)">
            <li v-for="option, index in ['ID#', 'A-Z']">
              <span @click="changeSetting('skillSort', index)" 
                    :class="['button', {active: skillSort == index}]">
              {{ option }}
              </span>
            </li>
          </ul>         
        </div>
        
        <div class="options-item">
          <div class="deco-warn label">Decoration Warning:</div>       
          <ul class="deco-warn options"
             @mouseover="setDesc('decoWarn')" @mouseout="setDesc(null)">
            <li v-for="option, index in ['On', 'Off']">
              <span @click="changeSetting('decoWarn', 1-index)"
                    :class="['button', {active: decoWarn == 1-index}]">
                {{ option }}
              </span>
            </li>
          </ul>
          
        </div>
        
        <div class="options-item">
          <div class="deco-delete label">Decoration Deletion:</div>          
          <ul class="deco-delete options" 
             @mouseover="setDesc('decoDelete')" @mouseout="setDesc(null)">
            <li v-for="option, index in ['Auto', 'Manual']">
              <span @click="changeSetting('decoDelete', 1-index)"
                    :class="['button', {active: decoDelete == 1-index}]">
                {{ option }}
              </span>
            </li>
          </ul>       
        </div>
        
        <transition name="settings-transition">
          <p class="options-description" 
             v-if="settingDescription"
             v-html="settingDescription"  
          />
        </transition>
        
      </div>
      <div slot="footer">
        <button class="button" @click="closeModal">OK</button>
      </div>
    </modal>
    
    <modal v-if="showModal == 'contact'" class="contact modal" v-on:close="closeModal">
      <h3 slot="header">Contact</h3>
      <div slot="body">
        <p>Please free to <a href="mailto:sandbird@tuta.io">email me</a> about requests, issues, questions, comments, job offers, or anything else at all.</p>
        <p>You can also post in the <a href="https://gbatemp.net/threads/release-online-mhgen-talisman-editor.457791/">gbatemp thread</a> if you prefer, or for feature requests and bug reports, raise an issue on the <a href="https://github.com/sand-bird/talismans/issues">github repository</a>.</p> 
        <p>Thanks for taking the time to contact me! I really appreciate your feedback, and I'll do my best to respond quickly.</p>
      </div>
      <div slot="footer">
        <button class="button" @click="closeModal">OK</button>
      </div>
    </modal>
    
    <modal v-if="showModal == 'about'" class="about modal" @close="closeModal">    
      <h3 slot="header">About</h3>
      <div slot="body">
        <p><b>☆'s MHGen Talisman Editor</b> is a talisman editor for Monster Hunter Generations.</p>
        <p>Features:
        <ul>
          <li>Comprehensive legality checking</li>
          <li>Save slot selection</li>
          <li>Decoration handling</li>
          <li>Sort talismans by rarity, slots, or skills</li>
          <li>List skills alphabetically or by <span style="font-size:0.9em;">ID</span></li>
          <li>Import and export talismans</li>  
          <li>Add, delete, and clear talismans</li>      
          <li>Copy talismans – select a talisman with the paperclip icon, then click “Add Talisman” to make a copy</li>
        </ul>
        </p>
        <p>Please <a @click="modal('contact')">contact me</a> if you find any issues, and enjoy!</p>
      </div>
      <div slot="footer">
        <button class="button" @click="closeModal">OK</button>
      </div>
    </modal>
    
    <modal v-if="showModal == 'faq'" class="faq modal" @close="closeModal">    
      <h3 slot="header">FAQ</h3>
      <div slot="body">    
        <h4>How do I use this?</h4>
        <ol>
          <li>Using a homebrew save editor like <a href="https://gbatemp.net/threads/release-jks-savemanager-homebrew-cia-save-manager.413143/">JKSM</a>, dump your Monster Hunter Generations <b>extdata</b> to your 3DS's SD card.</li>
          <li>Power off your 3DS, remove the SD card, and connect it to your computer.</li>
          <li>Click <b>Choose File</b>, and locate your extdata file. Usually this is called <span class="inline-mono">system</span> with no extension.</li>
          <li>Edit your talismans and click <b>Save Changes</b> to download a new <span class="inline-mono">system</span> file.</li>
          <li><b>Move or rename the original extdata file on your SD card.</b> Take good care of it! As long as you have this backup, you can always restore your save if something goes wrong. <i>I am not liable if you forget to back up your save.</i></li>
          <li>Copy or move the downloaded <span class="inline-mono">system</span> file into the <b>extdata</b> location on the SD card, and make sure it has the correct filename.</li>
          <li>Unmount the SD card from your computer and insert it back into your 3DS.</li>
          <li>Use your homebrew save editor to import the edited <b>extdata</b> file to Monster Hunter Generations.</li>
        </ol>
        <h4>Can I use it offline?</h4>
        <p>Yes! Instructions for downloading and running the app locally are available on the <a href="http://github.com/sand-bird/talismans">github page</a>. You will need to have <a href="https://nodejs.org/en/">node.js</a> and <a href="http://blog.npmjs.org/post/85484771375/how-to-install-npm">npm</a> installed first.</p>
        <h4>What's an extdata file?</h4>
        <p>An extdata file is a save file from the 3DS's SD card (as opposed to the game cartridge), decrypted by a 3DS homebrew save editor such as <a href="https://gbatemp.net/threads/release-jks-savemanager-homebrew-cia-save-manager.413143/">JKSM</a>.</p> 
        <p>For more information on how to generate an extdata file, the <a href="https://smealum.github.io/3ds/" >official homebrew channel site</a> and the communities on <a href="https://www.reddit.com/r/3dshacks/wiki/index" >reddit</a> and <a href="https://gbatemp.net/forums/3ds-homebrew-development-and-emulators.275/">gbatemp</a> are good places to start learning about 3DS homebrew.</p>
        <h4>Does this overwrite my save?</h4>
        <p>No. Clicking "Save Changes" will download a fresh copy of your save file with the changes you have made. You will need to manually overwrite your original save in order to load the modified data into Monster Hunter Generations.</p>
        <h4>Which games does this support?</h4>
        <p>Only <b>Monster Hunter Generations</b> (the NA / EU release of Monster Hunter X). I don't plan to add support for MHX or the older games, but I do plan to support the English version of Monster Hunter XX when it eventually comes out.</p>
        <h4>What's wrong with <a href="https://gbatemp.net/threads/release-mh-talisman-editor-for-mhx-mhgen-mh4g-mh4u.411182/">jc28735250's talisman editor</a>?</h4>
        <p>Nothing – in fact, since it supports MHX and MH4U, it's actually a lot better than mine. However, it's currently Windows-only, and tends to crash under Wine, so I decided to write a cross-platform editor.</p>
        <h4>Isn't this cheating?</h4>
        <p>Well, yes, in that it allows you to modify your save file in ways that the game's developers did not intend. However, this tool very limited – <b>it only generates <i>legal</i> talismans</b>, meaning they are always possible (however unlikely) to obtain in-game without editing. Even the best talismans in the game will not turn a bad hunter into a good one.</p>
        <h4>Why does this exist?</h4>
        <p>Because talismans in Monster Hunter Generations are randomly generated out of <i>millions</i> of possibilities, the chance of getting a desired or even a useful talisman is extremely low, even after hours of tedious farming.</p>
        <p>I and many others believe that even though Monster Hunter was designed to be this way, in practice, this situation goes against the <i>spirit</i> of the game. Any player who wants high-quality talismans, whether for speedrunning or just to expand their options for viable fashion sets, must either be very lucky or spend potentially hundreds of hours mining rocks in a game that is supposed to be about killing dragons.</p>
        <p>This tool exists to solve that dilemma, letting you spend your time in Monster Hunter actually hunting monsters.</p>
        <h4>Will people who play with me know that I hacked?</h4>
        <p>Nope – it's impossible to know for sure, since anything you can make with this tool, you also could have gotten by being <i>really, really</i> lucky.</p>
        <p>Of course, people might always choose to believe that someone is a hacker anyway, depending on just how “lucky” they are.</p>
        <h4>Why do my skills keep changing?</h4>
        <p>That's the legality checking at work. Different rarities of talisman have different skills (and different levels of those skills) available – for example, a lot of skills, like Critical Up, Evade Distance, and Handicraft, can only be found on talismans that come from a Timeworn Charm (Queen, King, and Dragon rarites). So, if you have a Queen Talisman with Handicraft and you change its rarity to Pawn, the Handicraft skill will be reset to something else.</p>
        <p>Skill compatibility information used in <b>☆'s MHGen Talisman Editor</b> was collected from <a href="https://docs.google.com/spreadsheets/d/1N7lqzdSzNl1o_W8JiYyQz_cXDXJEE_Ur4myI4Uf0F7E/">this spreadsheet</a>. You can view the actual datafile used in the app <a href="https://github.com/sand-bird/talismans/blob/master/src/skills.json">here</a>.</p>
        <h4>Why don't my decorations get copied when I copy a charm?</h4>
        <p></p>
        <h4>You should add {feature}!</h4>
        <p>Sure! <a @click="modal('contact')">Drop me a line.</a></p>
        <h4>I think I found a bug.</h4>
        <p>Oops, sorry about that! Please <a @click="modal('contact')">contact me</a> – I'll do my best to fix it right away.</p>
      </div>
      <div slot="footer">
        <button class="button" @click="closeModal">OK</button>
      </div>
    </modal>
    
    <modal v-if="showModal == 'delete'" @close="closeModal">
      <h3 slot="header">Decoration Warning</h3>
      <div slot="body">This action will delete one or more talismans with decorations. Decorations will be lost.</div>
      <div slot="footer">
        <button class="button" @click="removeCharm(charmToRemove)">OK</button>
        <button class="button" @click="closeModal">Cancel</button> 
      </div>
    </modal>
    
    <modal v-if="showModal == 'import'" class="import modal" @close="closeModal">    
      <h3 slot="header">Import Talismans</h3>
      <div slot="body">
        <div class="import-description">
          Choose a file to import, or paste text below.
        </div>
        <div class="import-file" >
          <input type="file" class="import-upload upload" v-on:change='checkImportFile' />
        </div>
        <transition name="textbox-transition">
          <textarea class="import-textbox" v-model="importText" />
        </transition>
      </div>
      <div slot="footer">
        <button class="button" @click="importCharms(false)">Insert</button>
        <button class="button" @click="importCharms(true)">Overwrite</button>
        <button class="button" @click="closeModal">Cancel</button> 
      </div>
    </modal>
    
    <!----------------
       END OF MODALS 
     ----------------->
    
    <div class="header" :class="{ loaded: renderFinished }"
         v-on:scroll="alert('abcd')" >
      <div class="outer">
        <h1>☆'s MHGen Talisman Editor</h1>
      </div>
      <transition name="download-transition">
        <div class="dl-transition-holder" v-if="renderFinished">
          <div class="download button" v-on:click="download">Save Changes</div>
          <a class="settings button" @click="modal('settings')"></a>
        </div>
      </transition>
    </div>
    
    
    
    <div id="upload-holder" v-show="renderDelay">
      <div class="font-test"></div>
      Please select your extdata file: 
      <input class="upload" type="file" v-on:change='init' v-show="!loading" />
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
      
      
      <div class="button" @click="clearCharms()" v-show="charms">Clear Talismans</div>
      <div class="button" @click="showModal = 'import'" v-show="file">Import Talismans</div>
      <div class="button" @click="exportCharms" v-show="file && charms">Export Talismans</div>
      <!-- <div class="button" v-on:click='test' v-show="charms">Test</div> -->
      <!-- <div class="button" @click="toggleSkillSort" v-show="charms">Skill Sort: <b class="sort-id">{{ skillSort }}</b></div> -->
      
      
      
      
      <ul id="charms">
        
        <li class="charms-header">
          <div v-for="column in columns" 
               :class="[column.id, 
                   {'sort-down': column.id == lastSortKey && sortOrder == -1 },
                   {'sort-up': column.id == lastSortKey && sortOrder == 1 }]" 
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
    
    
    <div id="footer" :class="{loaded: renderFinished}">
      <ul class="menu">
        <li><a @click="showModal = 'about'">About</a></li>·
        <li><a @click="showModal = 'faq'">FAQ</a></li>·
        <li><a href="http://github.com/sand-bird/talismans">Source</a></li>·
        <li><a @click="showModal = 'contact'">Contact</a></li>
      </ul>
      <div class="copy">© 2017 <a href="http://github.com/sand-bird">sand bird</a></div>
    </div>
  </div>
</template>

<script>
import { loadSaves, loadOffsets, loadCharms, 
         saveCharms, getRawCharm, compareCharms } from './utils'
import charm from './Charm.vue'
import modal from './Modal.vue'
import fileSaver from 'file-saver'

const settingDescriptions = {
  "skillSort": "<b>Skill Sort:</b> Determines the order skills are listed in the dropdown menu, and the order talismans are listed when sorted by skills.",
  "decoWarn": "<b>Decoration Warning:</b> Whether to display a warning message when deleting talismans with decorations.",
  "decoDelete": "<b>Decoration Deletion:</b> Whether to automatically delete talismans with decorations when clearing or overwriting talismans."
}

export default {
  name: 'app',
  data () {
    return {
      /* render control flags */
      
      showModal: null,
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
      
      
      //allCharmOffsets: {},
      //allEmptyOffsets: {},
      //active: null,
      importText: null,
      
      /* display strings */
      
      skillSort: 0,
      decoWarn: 1,
      decoDelete: 0,
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
    charm, modal
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
        console.log("(computed) charmOffsets")
        // return this.allCharmOffsets[this.active]
        return this.$store.getters.charmOffsets
      },
      set (val) {
        this.$store.commit('UPDATE_CHARMOFFSETS', val)
      }
    },
    
    emptyOffsets () {
      console.log("(computed) emptyOffsets")
      return this.$store.getters.emptyOffsets
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
      
        this.$store.dispatch('init', {
          charms: loadCharms(file),
          offsets: loadOffsets(file),
          active: a
        })
        
        // unfinished code to generate a demo state
        // (let's use our own offsets: 1001, 1002, ... 2001, 2002, etc)
        // (use import charms to match the ones in system(6) to custom offs)
        /*
        let demo = {}
        demo.charms = this.$store.state.charms,
        demo.charmOffsets = {}
        demo.charmOffsets[0] = this.$store.state.charmOffsets[1].slice(0,10)
        demo.charmOffsets[1] = []
        demo.emptyOffsets = {}
        demo.emptyOffsets[0] = this.$store.state.emptyOffsets[1].slice(0,10)
        demo.emptyOffsets[1] = this.$store.state.emptyOffsets[0].slice(0,10)
        demo.active = 0,
        
        fileSaver.saveAs(new Blob([JSON.stringify(demo, null, '  ')], {type: "text/json"}), 'state.json', false)
        */
        
        this.$store.dispatch('loadFile', file)

      }.bind(this)
      
      reader.readAsArrayBuffer(file)
    },
    
    setActive (index) {
      if (this.saves[index] && this.active != index) {
        //this.active = index
        this.$store.dispatch('setActive', index)
        this.activeCharm = null
      }
    },
    
    changeSetting (setting, value) {
      this[setting] = value
      this.setDesc(setting)
    },
    
    setDesc(setting) {
      if (settingDescriptions[setting]) {
        this.settingDescription = settingDescriptions[setting]
        clearTimeout(this.settingTimeout)
      }
      else { 
        this.settingTimeout = setTimeout(() => {
          this.settingDescription = null 
        }, 500)
      }
    },
    
    download () {
      this.$store.commit('SAVE_CHARMS')
      var binaryData = []
      binaryData.push(this.$store.state.file)
      fileSaver.saveAs(new Blob(binaryData, {type: "application/octet-stream"}), 'system', false)
    },
    
    exportCharms () {
      let charms = []
      for (let i = 0; i < this.charmOffsets.length; i++)
        charms.push(this.$store.state.charms[this.charmOffsets[i]])
      fileSaver.saveAs(new Blob([JSON.stringify(charms, null, '  ')], {type: "text/json"}), 'charm.txt', false)
    },
    
    test () {
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
        this.modal('delete')
        this.charmToRemove = offset
      }
      else this.removeCharm(offset)
    },
    
    removeCharm (offset) {
      console.log("removed " + offset)
      this.$store.dispatch('remove', offset)
      this.closeModal()
    },
    
    setActiveCharm (offset) {
      if (this.activeCharm && this.activeCharm == offset) this.activeCharm = null
      else this.activeCharm = offset
    },
    
    // new charms will be placed at the last available place
    // in the equipment box, then in slots created by deleting
    // charms as a last resort
    newCharm () {
      let newCharm = {}
      let sourceCharm = this.$store.state.charms[this.activeCharm] || null
      if (this.activeCharm && sourceCharm) newCharm = {
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
        rarity: 7,
        slots: 3,
        type: 327,
        skills: [36, 18],
        skillValues: [5, 10],
        decorations: [0, 0, 0],
        minRarity: 1,
        filledSlots: 0
      }
      this.$store.dispatch('add', newCharm)
    },
    
    checkImportFile (event) {
      let file = event.target.files[0]

      let reader = new FileReader()
      
      reader.onload = function (e) {
        this.importText = e.target.result
        console.log(file)
      }.bind(this)
      
      reader.readAsText(file)
    },
    
    importCharms (overwrite) {
      if (overwrite) this.clearCharms().then((res) => {
        this.$store.dispatch('add', JSON.parse(this.importText))
        this.closeModal()
      })
    },
    
    // all: when set, clearCharms does not track charms with
    // decorations, and deletes indiscriminately instead
    clearCharms () {
      return new Promise((resolve, reject) => {
        let offsetsToRemove = []
        let filledCharmOffsets = []
        this.charmOffsets.forEach((offset) => {
          if (this.$store.state.charms[offset].filledSlots && this.decoDelete)
            filledCharmOffsets.push(offset)
          else
            offsetsToRemove.push(offset)
        })
        
        if (offsetsToRemove.length) {
          this.$store.dispatch('remove', offsetsToRemove)
          resolve()
        }
        else if (filledCharmOffsets.length) {
          this.modal('delete')
          this.charmToRemove = filledCharmOffsets
          console.log(this.charmToRemove)
        }
      })
    },
    
    sortCharms (sortKey) {
    
      let sortKeys = [
        'rarity',
        'slots',
        'filledSlots',
        ['skills', 0],
        ['skillValues', 0],
        ['skills', 1],
        ['skillValues', 1]
      ]
    
      if (this.lastSortKey == sortKey) this.sortOrder *= -1
      else this.sortOrder = 1
      
      this.lastSortKey = sortKey
      
      let sortFn = () => { return 1 }
  
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
      
      sortFn = (a, b) => {
        return compareCharms (
          this.$store.state.charms[a],
          this.$store.state.charms[b],
          
          ...sortKeys
        
        ) * this.sortOrder
      }

      this.charmOffsets = this.charmOffsets.sort(sortFn)
    },
    
    closeModal () {
      this.showModal = null
      this.charmToRemove = null
      this.importText = null
    },
    
    modal (modal) {
      this.closeModal()
      this.$nextTick(() => {
        this.showModal = modal
      })
    }
  }
}
</script>

<style>
@font-face {
  font-family: 'icons';
  src: url('dist/icons.ttf?67942823') format('truetype');
  font-weight: normal;
  font-style: normal;
}

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

.settings:after {
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


.options-item {
  width: 100%;
  font-size: 0;
  margin: 15px 0;
  overflow: hidden;
}

.modal .options-item .label {
  font-size: 1rem;
  display: inline-block;
  float: left;
  margin-top: 0;
  line-height: 38px;
}

.options-item .description {
  display: none;
}

.options {
  display: inline-block;
  font-size: 0;
  float: right;
}

.modal .options li {
  padding: 0;
  margin: 0;
  font-size: 1rem;
  display: inline-block;
  text-align: center;
/*  min-width: 70px; */
}

.options span {
  display: inline-block;
  margin: 0;
  padding: 8px 16px;
}

.options li:first-child {
  text-align: right;
}
.options li:last-child {
  text-align: left;
}

.options li:first-child span {
  border-radius: 20px 0 0 20px;
}

.options li:last-child span {
  border-radius: 0 20px 20px 0;
}

.options input {
  display: none;
}

.options-description {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0.5em !important;
  margin: 25px 0 5px 0 !important;
  height: 4.9em;
}

.settings-transition-enter, .settings-transition-leave-to {
  height: 1px;
  margin: 0 !important;
  padding: 0 0.5em !important;
  opacity: 0;
}

.settings-transition-enter-active, .settings-transition-leave-active {
  transition: all 0.4s ease-in-out;
  transition-delay: 0s;
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
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 500px;
  margin: 40px auto 0;
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

.import-file {
  padding: 12px 20px;
  width: 100%;
  border: 1px solid #eee;
  display: inline-block;
  margin: 1em auto;
  border-radius: 10px;
}

.import-upload {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.import-textbox {
  width: 100%;
  height: 30vh;
  border: 0;
  box-shadow: 0 0 5px #ccc;
  transition: height 0.5s ease;
  margin: 0;
}

.textbox-transition-enter {
  height: 21px;
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

body::-webkit-scrollbar {
  border-radius: 10px;
}

body::-webkit-scrollbar-track
{
	border-radius: 0px;
	background-color: #fff;
}

body::-webkit-scrollbar
{
	width: 12px;
	background-color: #fff;
}

body::-webkit-scrollbar-thumb
{
	border-radius: 10px;
	background-color: #ccc;
}

body::-webkit-scrollbar-button
{
  height: 5px;
  background-color: #fff;
}


</style>
