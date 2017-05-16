<template>
<transition name="charm-transition">
<li class="charm-holder">
  <a class="remove" v-on:click="removeCharm">✖</a>
  
  <div class="charm">
    <div class="rarity styled-select">
      <select v-model="rarity"
              @change="blur">
        <option v-for="rarity in 7" v-if="rarity >= minRarity" :value="rarity">
          {{ rarityName(rarity) }}
        </option>
      </select>
    </div>
    
    <div class="slots">
      <a class="minus-slots" 
            v-if="canDecreaseSlots"
            @click="slots-=1">➖</a> 
        <span v-for="slot in slots" 
              class="slot" :class="{ filled: filledSlots >= slot }" />
      <a class="plus-slots"
            v-if="canIncreaseSlots"
            @click="slots+=1">➕</a>
    </div>
    
    <div class="skill1">
      <select v-model="skills[0]" @change="blur" 
              @focus="track(0)">
        <option v-for="skillId in availableSkills[0]" :value="skillId">
          {{ skillName(skillId) }}
        </option>
      </select>
    </div>
    
    <div class="skill1value">
      <select v-model="skillValues[0]" @change="blur">
        <option v-for="value in skillLevels[0]" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
    
    <div class="skill2">
      <select v-model="skills[1]" @change="blur" 
              @focus="track(1)">
        <option v-for="skillId in availableSkills[1]" :value="skillId">
          {{ skillName(skillId) }}
        </option>
      </select>
    </div>
    
    <div class="skill2value">
      <select v-model="skillValues[1]" @change="blur"
              v-show="skillValues[1]">
        <option v-for="value in skillLevels[1]" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
    
  </div>
  
  <a class="active-charm-button" v-on:click="setActive"></a>
  <div v-if="debugOn" style="overflow: hidden">
    <pre style="float:left">{{ offset }}<br>{{ origOffset != offset ? origOffset : null }}</pre>
    <pre style="float:right">{{ data }}</pre>
  </div>
</li> 
</transition>
</template>

<script>
import { getAvailableSkills, getSkillLevels, 
         getSkillName, getRarityName,
         getMaxSlots, DEBUG } from './utils'

export default {
  name: 'charm',
  props: [ 'offset', 'skillSort', 'skillMax' ],
  data () {
    return { 
      debugOn: DEBUG, 
      origOffset: this.offset,
      currentSkillSlot: null,
      currentSkill: null,
      currentSkillValue: null
    }
  },
  computed: {

    /* mutable properties fetched from state */
    
    // integer from 0 (pawn) to 6 (dragon)
    rarity: {
      get () { 
        this.debug("[computed] rarity: get")
        return this.get("rarity") 
      },
      set (val) { 
        this.debug("[computed] rarity: set")
        this.set("rarity", val) 
      }
    },
    // integer representing the type of charm 
    // corresponding to the talisman's rarity:
    // mystery (325), shining (326), or timeworn (327)
    type: {
      get () { 
        this.debug("[computed] type: get")
        return this.get("type") 
      },
      set (val) { 
        this.debug("[computed] type: set")
        this.set("type", val) 
      }
    },
    // integer from 0 to 3, just a counter
    slots: {
      get () { 
        this.debug("[computed] slots: get")
        return this.get("slots") 
      },
      set (val) { 
        this.debug("[computed] slots: set")
        this.set("slots", val) 
      }
    },
    
    
    /* immutable properties fetched from state */
    
    // skill arrays won't accept computed setters; must be watched.
    // each is an array of length 2, containing integers, whose indices 
    // correspond respectively to the two skill slots in a charm.
    skills () {
      this.debug("[computed] skills")
      return this.get("skills") 
    },
    skillValues () { 
      this.debug("[computed] skillValues") 
      return this.get("skillValues") 
    },
    
    // restrictions based on decorations attached to the charm.
    // set in utils when data is read (or in App when charm is created)
    minRarity () { 
      this.debug("[computed] minRarity") 
      return this.get("minRarity") 
    },
    filledSlots () { 
      this.debug("[computed] filledSlots") 
      return this.get("filledSlots") 
    },
    
    
    /* computed properties relying on functions stored in utils.js */
    
    maxSlots () {
      this.debug("[computed] maxSlots")
      return getMaxSlots(this.type)
    },
 
    canIncreaseSlots () {
      this.debug("[computed] canIncreaseSlots")
      return (this.slots < this.maxSlots)
    },
    
    canDecreaseSlots () {
      this.debug("[computed] canDecreaseSlots")
      return (this.slots > this.filledSlots)
    },
    
    availableSkills () {
      this.debug("[computed] availableSkills")
      return getAvailableSkills(this.type, this.skillSort)
    },
    
    skillLevels () {
      this.debug("[computed] skillLevels")
      return getSkillLevels(this.type, this.skills)
    },
    
    
    // for debugging
    data () {
      if (DEBUG) return this.get("data")
    }
    
  },
  
  watch: {
  
    /* skill array updaters */
    skills (val) {
      this.debug("[watch] skills: " + val)
      this.set("skills", val)
      // settings skills[1] to something nonzero should also 
      // set the skillValue to nonzero. this goes here instead 
      // of the skillLevels watcher for consistency with the
      // skillValues watcher below, and for edge cases where 
      // someone loads a save with already-illegal data.
      if (val[1] && !this.skillValues[1]) {
        this.debug("[watch] skills: setting skillValue")
        if (this.skillMax)
          this.skillValues[1] = this.max(this.skillLevels[1])
        else
          this.skillValues[1] = 1
      }
      
      if (this.skillMax) {
        let slot = this.currentSkillSlot
        console.log("current slot: " + slot)
        if (val[slot] > this.currentSkillValue)
          this.skillValues[slot] = this.max(this.skillLevels[slot])
      }
    },
    skillValues (val) { 
      this.debug("[watch] skillValues: " + val)
      this.set("skillValues", val)
      // setting skillValues[1] to 0 should set the skill to 0.
      // nothing else updates based on skillValues, so this 
      // must be done manually here. (uses val[1] because only 
      // the second slot can have 0 (none) for a skill)
      if (!val[1] && this.skills[1]) {
        this.debug("[watch] skillValues: setting skill")
        this.skills[1] = 0
      }
    },
    
    /* update the type (mystery, shining, timeworn) when the 
       charm's rarity is changed (used for skills & slots)  */
    rarity (val) {
      this.debug("[watch] rarity: " + val)
      let type = this.type
      
      if (val > 4) type = 327
      else if (val > 2) type = 326
      else type = 325
     
      if (type != this.type) this.type = type
    },
  
    /* when the available skills change, checks if our current skill 
       is valid and chooses a default one if not. also updates the 
       skillValue in that case (though i think this is redundant)  */
    availableSkills (val) {
      this.debug("[watch] availableSkills: " + val)
      for (let slot = 0; slot < 2; slot++) {
        // if the available skills for the slot no longer contain
        // the current skill selected for that slot:
        if (val[slot].indexOf(this.skills[slot]) == -1) {
          // set the skill to the first available skill
          // (should be 0 (no skill) if this is slot 2)
          this.skills[slot] = val[slot][0]
          // set the skillValue to the max available
          this.skillValues[slot] = this.skillLevels[slot][0]
        }
      }
    },
    
    /* when the available skillLevels change, checks if our
       skillValues are valid and changes them if necessary  */
    skillLevels (val) {
      this.debug("[watch] skillLevels: " + val)
      for (let slot = 0; slot < 2; slot++) {
        // i really wanted to use Math.min(...arr), but i 
        // figured there'd be too much of a performance hit :(
        let minLevel = this.min(val[slot])
        let maxLevel = this.max(val[slot])
        
        // force skillvalue to minimum for negative 
        // skillValues in excess of new skillLevels
        // (should only happen in 2nd slot)
        if (this.skillValues[slot] < minLevel)
          this.skillValues[slot] = minLevel
          
        // if skillvalue is already valid, do nothing 
        else if (this.skillValues[slot] <= maxLevel)
          continue
        
        // otherwise, just force skillValue to maximum
        else this.skillValues[slot] = maxLevel
      }
    },
    
    maxSlots (val) {
      this.debug("[watch] maxSlots: " + val)
      if (this.slots > val) this.slots = val
    }
  
  },
  
  methods: {
  
    debug (msg) {
      if (DEBUG) console.log(this.offset + " " + msg)
    },
  
    get (prop) {
      this.debug("[methods] get: " + prop)
      return this.$store.state.charms[this.offset][prop]
    },
    
    set (key, value) {
      this.debug("[methods] set: " + key + ", " + value)
      this.$store.dispatch('edit', {
        offset: this.offset,
        key: key,
        value: value
      })
    },
  
    skillName (skillId) {
      //this.debug("[methods] skillName: " + skillId)
      return getSkillName(skillId)
    },
    
    rarityName (rarityId) {
      //this.debug("[methods] rarityName: " + rarityId)
      return getRarityName(rarityId)
    },
    
    removeCharm (event) {
      this.$emit('remove', this.offset)
    },
    
    setActive (event) {
      this.$emit('active', this.offset)
    },
    
    track (i) { 
      this.currentSkillSlot = i 
      this.currentSkill = this.skills[i]
      this.currentSkillValue = this.skillValues[i]
    },
    
    min (arr) { return arr.slice(-1)[0] },
    
    max (arr) { return arr[0] },
    
    blur (e) { e.target.blur() }
    
  } 
}
</script>

<style>
html, * {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.charm-transition-enter {
  opacity: 0;
}

.charm-transition-leave-active {
  opacity: 0;
}

.charm-transition-enter .charm,
.charm-transition-leave-active .charm {
  -webkit-transform: scale(0.95);
  transform: scale(0.95);
}

.charm-transition {
  transition: all .2s ease;
}

.charm, .charms-header {
  display: block;
  width: 680px;
  overflow: hidden;
  margin: 5px auto;
  box-shadow: 0 1px 1px #eee;
  position: relative;
  border-radius: 5px;
  transition: all .3s ease;
}

.charm {
  border: 1px solid #ccc;
}

.charm:nth-child(2n + 1) {
  background-color: #fcfcfc;
}

.active-charm .charm {
  border-color: #54de9b !important;
  box-shadow: 0 0 3px #54de9b;
}

.active-charm .charm div {
  border-color: #bff3da !important;
}

.charm div, .charms-header div {
  display: inline-block;
  padding: 1px;
  float: left;
  height: 50px;
  line-height: 50px;
}

.charms-header div {
  border: 1px solid #ccc;
  background-color: #fcfcfc;
  box-shadow: inset -1px -1px 0 #eaeaea, inset 1px 1px 0 #fff;
  cursor: pointer;
  text-shadow: 0 1px 0 #fff, 0 -1px 0 #eee;
  border-right: none;
}

.charms-header div:first-child {
  border-radius: 5px 0 0 5px;
}

.charms-header div:hover + div {
  border-left: 1px solid #aaa;
}

.charms-header div:last-child {
  border-radius: 0 5px 5px 0;
  border-right: 1px solid #ccc;
}

.charms-header div:hover {
  background-color: #fefefe;
  color: #000;
  border-color: #aaa;
}

.charms-header div:after {
  /* styling */ 
  width: 0;
  height: 5px;
  display: inline-block;
  content: " ";
  margin-left: 0;
  vertical-align: middle;
}

.charms-header div.sort-up:after {
  width: 10px;
  margin-left: 0.5em;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%2342b983'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;

  background-position: 0 0;
  background-size: 9px;
  background-repeat: no-repeat;
}

.charms-header div.sort-down:after {
  width: 10px;
  margin-left: 0.5em;
  margin-bottom: 3px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%2342b983'><polygon points='0,50 100,50 50,0'/></svg>") no-repeat;

  background-position: 0 calc(50% + 2px);
  background-size: 9px;
  background-repeat: no-repeat;
}

.charm div {
  border-right: 1px solid #eee;
}

.charm div.skill2value {
  border-right: none;
}

.charm-holder {
  position: relative;
  display: block;
  width: 680px;
  margin: 0 auto;
  transition: opacity .2s ease;
}

.remove {
  position: absolute;
  left: -30px;
  font-size: 24px;
  height:50px;
  line-height: 50px;
  top: 6px;
  cursor: pointer;
}

.active-charm-button {
  position: absolute;
  right: -24px;
  font-size: 20px;
  line-height: 50px;
  top: 2px;
  cursor: pointer;
}

.active-charm-button:before {
  content: '\e806';
  font-family: 'icons';
}

.rarity {
  width: 25%;
}

.slots {
  width: 17%;
  position: relative;
}

.skill1, .skill2 {
  width: 21%;
}

.charms-header .skill1, .charms-header .skill2 {
  width: 29%;
  margin-left: 0;
}

.skill1value, .skill2value {
  width: 8%;
}

.charms-header .skill1value, .charms-header .skill2value {
  display: none;
}

select {
  width: 94%;

  /* styling */
  background-color: #fff;
  display: inline-block;
  font: inherit;
  line-height: 1em;
  padding: 5px 20px 5px 5px;
  border-radius: 5px;
  border: 0;
  

  /* reset */

  margin: 0;      
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;

  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='#42b983'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;

  background-position: calc(100% - 10px) calc(50% + 2px);
  background-size: 9px;
}

select:hover {
background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='#54de9b'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
  background-position: calc(100% - 10px) calc(50% + 2px);
  background-size: 9px;
}

.skill1value, .skill2value {
  text-align: left;
  position: relative;
}

.skill1value select, .skill2value select {
  width: 2.6em;
  position: relative;
  left: 50%;
  margin-left: -1.3em;
  padding: 5px 10px 5px 5px;
  
  background-position:
    calc(100% - 5px) calc(50% + 2px);
  background-size: 8px;
}

.minus-slots {
  left: 7px;
}

.plus-slots {
  right: 7px;
}

.plus-slots, .minus-slots {
  position: absolute;
  padding: 2px;
  line-height: 46px;
  cursor: pointer;
}

.slot:before {
  content: "◯";
  font-size: 16px;
}

.slot.filled:before {
  content: "⬤";
  color: #555;
}

</style>
