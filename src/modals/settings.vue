<template>
  <modal class="settings modal" v-on:close="close">
    <h3 slot="header">Settings</h3>
    <div slot="body">
    
      <div class="options-item skill-sort"
           @mouseover="setDesc('skillSort')" @mouseout="setDesc(null)">
        <div class="label">Skill Sort:</div>
        <ul class="options" @mouseover.stop>
          <li v-for="option, index in ['A-Z', 'ID#']"
              @mouseover="setDesc('skillSort' + option)">
            <span @click="changeSetting('skillSort', 1-index)" 
                  :class="['button', {active: settings.skillSort == 1-index}]">
            {{ option }}
            </span>
          </li>
        </ul>         
      </div>
      
      <div class="options-item skill-max"
           @mouseover="setDesc('skillMax')" @mouseout="setDesc(null)">
        <div class="label">Auto-Max Skills:</div>
        <ul class="options" @mouseover.stop>
          <li v-for="option, index in ['On', 'Off']"
              @mouseover="setDesc('skillMax' + option)">
            <span @click="changeSetting('skillMax', 1-index)" 
                  :class="['button', {active: settings.skillMax == 1-index}]">
            {{ option }}
            </span>
          </li>
        </ul>         
      </div>
      
      <div class="options-item deco-warn"
           @mouseover="setDesc('decoWarn')" @mouseout="setDesc(null)">
        <div class="label">Decoration Warning:</div>       
        <ul class="options" @mouseover.stop>
          <li v-for="option, index in ['On', 'Off']"
              @mouseover="setDesc('decoWarn' + option)">
            <span @click="changeSetting('decoWarn', 1-index)"
                  :class="['button', {active: settings.decoWarn == 1-index}]">
              {{ option }}
            </span>
          </li>
        </ul>
      </div>
      
      <div class="options-item deco-delete" 
           @mouseover="setDesc('decoClear')" @mouseout="setDesc(null)">
        <div class="label">Clear Decorations:</div>          
        <ul class=" options" @mouseover.stop>
          <li v-for="option, index in ['Always', 'Smart', 'Never']"
              @mouseover="setDesc('decoClear' + option)">
            <span @click="changeSetting('decoClear', 2-index)"
                  :class="['button', {active: settings.decoClear == 2-index}]">
              {{ option }}
            </span>
          </li>
        </ul>       
      </div>
      
      <transition name="secret-transition">
      <div class="secret" v-show="showSecret">
        <div class="options-item deco-import"
             @mouseover="setDesc('decoImport')" @mouseout="setDesc(null)">
          <div class="label">Import Decorations:</div>          
          <ul class="options" @mouseover.stop>
            <li v-for="option, index in ['On', 'Off']"
                @mouseover="setDesc('decoImport' + option)">
              <span @click="changeSetting('decoImport', 1-index)"
                    :class="['button', {active: settings.decoImport == 1-index}]">
                {{ option }}
              </span>
            </li>
          </ul>       
        </div>

        <div class="options-item deco-copy"
             @mouseover="setDesc('decoCopy')" @mouseout="setDesc(null)">
          <div class=" label">Copy Decorations:</div>          
          <ul class="options" @mouseover.stop>
            <li v-for="option, index in ['On', 'Off']"
                @mouseover="setDesc('decoCopy' + option)">
              <span @click="changeSetting('decoCopy', 1-index)"
                    :class="['button', {active: settings.decoCopy == 1-index}]">
                {{ option }}
              </span>
            </li>
          </ul>       
        </div>
      
      </div>
      </transition> 
            
      <transition name="settings-transition">
        <p class="options-description" 
           v-if="settingDescription"
           v-html="settingDescription"  
           @mouseover="setDesc('last')" @mouseout="setDesc(null)"
        />
      </transition>
      
    </div>
    <div slot="footer">
      <button class="button" @click="close"
        @mouseover="setDesc('last')" @mouseout="setDesc(null)">OK</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

const settingDescriptions = {
  skillSort: "<b>Skill Sort:</b> Determines the order skills are listed in the dropdown menu, and the order talismans are listed when sorted by skills.",
  'skillSortA-Z': "<b>Skill Sort - A-Z:</b> Sort skills in alphabetical order.",
  'skillSortID#': "<b>Skill Sort - ID#:</b> Sort skills by their ID number in the game's data. Good for grouping skills by type, or for people used to Kiranico's skills page.",
  skillMax: "<b>Auto-Max Skills:</b> When selecting a new skill, whether to automatically set the skill's level to the highest possible amount.",
  skillMaxOn: "<b>Auto-Max Skills - On:</b> When changing skills, conveniently maxes out the new skill by default.",
  skillMaxOff: "<b>Auto-Max Skills - Off:</b> When changing skills, keeps the previous skill's level when possible. Good for making minor adjustments.",
  decoWarn: "<b>Decoration Warning:</b> Whether to display a warning message when deleting talismans with decorations.",
  decoWarnOn: "<b>Decoration Warning - On:</b> Show a warning popup when clearing, overwriting, and deleting talismans with decorations.",
  decoWarnOff: "<b>Decoration Warning - Off:</b> Do not warn or require confirmation when clearing, overwriting, or deleting talismans with decorations.",
  decoClear: "<b>Clear Decorations:</b> Whether to automatically delete talismans with decorations when clearing or overwriting talismans.",
  decoClearAlways: "<b>Clear Decorations - Always:</b> Treat talismans with decorations just like empty talismans when clearing and overwriting.",
  decoClearSmart: "<b>Clear Decorations - Smart:</b> Clear talismans with decorations when there are no empty talismans present. Otherwise, only clear empty talismans.",
  decoClearNever: "<b>Clear Decorations - Never:</b> Never clear talis-mans with decorations. If there are no empty talismans present, clearing will do nothing.",
  decoImport: "<b>Import Decorations:</b> Whether to read or ignore decoration data when importing talismans.",
  decoImportOn: "<b>Import Decorations - On:</b> Adds decorations to the list of talisman properties to read and save. (By default: rarity, slots, skills, and skill values.)",
  decoImportOff: "<b>Import Decorations - Off:</b> Decoration data is <br>still exported when exporting talismans, but will be ignored when importing.",
    decoCopy: "<b>Copy Decorations:</b> Whether to copy decorations when copying talismans (click the paperclip icon next to a talisman, then click Add Talisman).",
  decoCopyOn: "<b>Copy Decorations - On:</b> Decorations are copied when copying talismans.",
  decoCopyOff: "<b>Copy Decorations - Off:</b> Decorations are ignored when copying talismans."
}

export default {
  name: 'settings',
  props: ['settings'],
  data () {
    return {
      settingDescription: null,
      settingTimeout: null,
      secret: "cheatercheaterwimpwimp",
      i: 0,
      showSecret: this.settings.secret
    }
  },
  methods: {
    close () { this.$emit('close') },
    
    changeSetting (setting, value) {
      this.settings[setting] = value
      localStorage.setItem(setting, value)
      this.$emit('update', 'settings', setting, value)
    },
    
    setDesc(setting) {
      if (settingDescriptions[setting]) {
        this.settingDescription = settingDescriptions[setting]
        clearTimeout(this.settingTimeout)
      }
      else if (setting == 'last') 
        clearTimeout(this.settingTimeout)
      else { 
        this.settingTimeout = setTimeout(() => {
          this.settingDescription = null 
        }, 500)
      }
    },
    
    doSecret (e) {
      if (e.key == this.secret[this.i]) this.i++
      else this.i = 0
      if (this.i == this.secret.length) {
        this.showSecret = !this.showSecret
        this.$emit('secret')
      }
    }
  },
  components: { modal },
  mounted () {
    document.addEventListener("keydown", this.doSecret)
  },
  destroyed () {
    document.removeEventListener("keydown", this.doSecret)
  }
}
</script>

<style>
.settings .modal-container {
  width: 440px;
}

.settings .modal-body {
  overflow-y: hidden;
}

.options-item {
  width: 100%;
  font-size: 0;
  margin: 6px 0;
  padding: 0.1px;
  overflow: hidden;
  float: left;
}

.options-item.deco-delete {
  margin: 9px 0 6px 0;
}

.modal .options-item .label {
  font-size: 1rem;
  display: inline-block;
  float: left;
  margin-top: 0;
  line-height: 38px;
  cursor: default;
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
  padding: 8px 10px;
  border-radius: 0;
  min-width: 60px;
  text-align: center;
}

.options li:first-child span {
  border-radius: 10px 0 0 10px;
  padding-left: 16px;
}

.options li:last-child span {
  border-radius: 0 10px 10px 0;
  padding-right: 16px;
}

.deco-delete.options li:first-child span {
  padding-left: 12px;
}

.deco-delete.options li:last-child span {
  padding-right: 12px;
}

.options input {
  display: none;
}

.options-description {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0.5em 0.85em !important;
  margin: 12px 0 5px 0 !important;
  height: 4.9em;
  cursor: default;
  float:left;
  width: 100%;
}

.settings-transition-enter, .settings-transition-leave-to {
  height: 1px;
  margin: 0 !important;
  padding: 0 0.85em !important;
  opacity: 0;
}

.settings-transition-enter-active, .settings-transition-leave-active {
  transition: all 0.4s ease-in-out;
  transition-delay: 0s;
}

.secret {
  max-height: 500px;
  margin: 10px 0 0;
  padding: 10px 0 0;
  display: inline-block;
  float: left;
  border-top: 1px solid #eee;
}

.secret .options-item:first-child {
  display: inline-block;
}

.secret-transition-enter, .secret-transition-leave-to {
  max-height: 0px;
  margin: 0;
  opacity: 0;
  border-top: 0;
  padding: 0;
}

.secret-transition-enter-active {
  transition: max-height 1s ease-in, margin 0.5s ease-in-out, padding 0.5s ease-in-out, opacity 0.8s ease-in-out;
  transition-delay: 0s;
}

.secret-transition-leave-active {
  transition: max-height 0.25s ease-in, margin 0.25s ease-out, opacity 0.25s ease-in;
}
</style>
