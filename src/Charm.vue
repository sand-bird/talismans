<template>
<transition name="charm-transition">
<li class="charm-holder">
  <a class="remove" v-on:click="removeCharm">✖</a>
  
  <div class="charm">
    <div class="rarity styled-select">
<<<<<<< HEAD
      <select v-model="rarity"
              @change="blur">
        <option v-for="rarity in 7" v-if="rarity >= minRarity" :value="rarity">
          {{ rarityName(rarity) }}
=======
      <select v-model="charm.rarity"
              v-on:change="blur($event); validateCharm()">
        <option v-for="rarity in 7" v-if="rarity >= charm.minRarity" :value="rarities[rarity-1].value">
          {{ rarities[rarity-1].text }}
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
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
<<<<<<< HEAD
      <select v-model="skills[0]" @change="blur">
        <option v-for="skillId in availableSkills[0]" :value="skillId">
=======
      <select v-model="charm.skills[0]"
              v-on:change="blur($event); handleSkillChange(0)">
        <option v-for="skillId in charm.availableSkills[0]" 
                v-if="skillId != charm.skills[1]"
                :value="skillId">
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
          {{ skillName(skillId) }}
        </option>
      </select>
    </div>
    
    <div class="skill1value">
<<<<<<< HEAD
      <select v-model="skillValues[0]" @change="blur" @blur="blur">
        <option v-for="value in skillLevels[0]" :value="value">
=======
      <select v-model="charm.skillvalues[0]" @change="blur">
        <option v-for="value in charm.skillLevels[0]" :value="value">
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
          {{ value }}
        </option>
      </select>
    </div>
    
    <div class="skill2">
<<<<<<< HEAD
      <select v-model="skills[1]" @change="blur">
        <option v-for="skillId in availableSkills[1]" :value="skillId">
=======
      <select v-model="charm.skills[1]"
              v-on:change="blur($event); handleSkillChange(1)">
        <option v-for="skillId in charm.availableSkills[1]" 
                v-if="skillId != charm.skills[0]"
                :value="skillId">
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
          {{ skillName(skillId) }}
        </option>
      </select>
    </div>
    
    <div class="skill2value">
<<<<<<< HEAD
      <select v-model="skillValues[1]" @change="blur"
              v-show="skillValues[1]">
        <option v-for="value in skillLevels[1]" :value="value">
=======
      <select v-model="charm.skillvalues[1]"
              v-show="charm.skillvalues[1]" v-on:change="blur($event); validateSkillTwo()">
        <option v-for="value in charm.skillLevels[1]" :value="value">
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
          {{ value }}
        </option>
      </select>
    </div>
    
  </div>
  
<<<<<<< HEAD
  <a class="active-charm-button" v-on:click="setActive"></a>
  <div v-if="debugOn" style="overflow: hidden">
    <pre style="float:left">{{ offset }}<br>{{ origOffset != offset ? origOffset : null }}</pre>
    <pre style="float:right">{{ data }}</pre>
  </div>
=======
  <a class="active-charm-button" v-on:click="setActive">᳃</a>
  
  <div v-if="debug">{{ offset }}<br>{{ charm.data || "new charm" }}</div>
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
</li> 
</transition>
</template>

<script>
<<<<<<< HEAD
import { getAvailableSkills, getSkillLevels, 
         getSkillName, getRarityName,
         getMaxSlots, DEBUG } from './utils'

/* ---------------------------------------------------------------
        C H A R M   P R O P E R T Y   D E P E N D E N C I E S
   ---------------------------------------------------------------   
 
  filledSlots ----------------------------------> canDecreaseSlots 
                                             |
                                .--> slots --+      
  rarity        .--> maxSlots --|            |
    |           |               '---------------> canIncreaseSlots
    |           |
    '--> type --+----------------------.                       
                |                      |
                '--> availableSkills   +--> skillLevels
                         |             |       |
  minRarity              '--> skills --'       '--> skillValues
                                 ^                      |
                                 '----------------------'
*/
=======
import skills from 'json-loader!./skills.json'
import decorations from 'json-loader!./decorations.json'
import { DEBUG } from './utils'
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8

export default {
  name: 'charm',
  props: [ 'offset' ],
  data () {
<<<<<<< HEAD
    return { debugOn: DEBUG, origOffset: this.offset }
  },
=======
    return { 
      rarities: [
        { text: "Pawn Talisman", value: 1 },
        { text: "Bishop Talisman", value: 2 },
        { text: "Knight Talisman", value: 3 },
        { text: "Rook Talisman", value: 4 },
        { text: "Queen Talisman", value: 5 },
        { text: "King Talisman", value: 6 },
        { text: "Dragon Talisman", value: 7 }
      ],
      types: {
        "325": { name: "mystery", slots: 1 },
        "326": { name: "shining", slots: 2 },
        "327": { name: "timeworn", slots: 3 }
      },
      debug: DEBUG
    }
  },
  
  created () {
    this.getFilledSlots()
    this.getMinRarity()
    this.getAvailableSkills()
    this.getSkillLevels()
  },
  
  updated () {
  
    console.log("updated charm " + this.offset)
  },
  
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
  computed: {

    /* mutable properties fetched from state */
    
    rarity: {
      get () { 
        this.debug("[computed] rarity: get"); 
        return this.get("rarity") 
      },
      set (val) { 
        this.debug("[computed] rarity: set"); 
        this.set("rarity", val) 
      }
    },
    type: {
      get () { 
        this.debug("[computed] type: get"); 
        return this.get("type") 
      },
      set (val) { 
        this.debug("[computed] type: set"); 
        this.set("type", val) 
      }
    },
    slots: {
      get () { 
        this.debug("[computed] slots: get"); 
        return this.get("slots") 
      },
      set (val) { 
        this.debug("[computed] slots: set"); 
        this.set("slots", val) 
      }
    },
    
    
    /* immutable properties fetched from state */
    
    // skill arrays won't accept computed setters, must be watched
    skills () {
      this.debug("[computed] skills"); 
      return this.get("skills") 
    },
    skillValues () { 
      this.debug("[computed] skillValues"); 
      return this.get("skillValues") 
    },
    
    // restrictions based on decorations attached to the charm
    minRarity () { 
      this.debug("[computed] minRarity"); 
      return this.get("minRarity") 
    },
    filledSlots () { 
      this.debug("[computed] filledSlots"); 
      return this.get("filledSlots") 
    },
    
    // for debugging
    data () {
      if (DEBUG) return this.get("data")
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
      return getAvailableSkills(this.type)
    },
    
    skillLevels () {
      this.debug("[computed] skillLevels")
      return getSkillLevels(this.type, this.skills)
    }
    
  },
  
  watch: {
  
    /* skill array updaters */
    skills (val) {
      this.debug("[watch] skills: " + val)
      this.set("skills", val)
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
  
    /* when the available skills change, checks if our current
       skill is valid and chooses a default one if not.
       also updates the skillValue in that case 
       (though i think this is redundant)  */
    availableSkills (val) {
      this.debug("[watch] availableSkills: " + val)
      for (let slot = 0; slot < 2; slot++) {
        // if the available skills for the slot no longer contain
        // the current skill selected for that slot:
        if (val[slot].indexOf(this.skills[slot] == -1)) {
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
        let minLevel = val[slot].slice(-1)[0]
        let maxLevel = val[slot][0]
        
        // force skillvalue to minimum for negative 
        // skillValues in excess of new skillLevels
        // (should only happen in 2nd slot)
        if (this.skillValues[slot] < minLevel)
          this.skillValues[slot] = minLevel
          
<<<<<<< HEAD
        // if skillvalue is already valid, do nothing
        // (make changeable with a setting? probably people 
        // would like to have skillValues auto max out)  
        else if (this.skillValues <= maxLevel)
          return
        
        // otherwise, just force skillValue to maximum
        else this.skillValues[slot] = maxLevel
=======
          for (let slot = 0; slot < 2; slot++) {
            if (this.charm.availableSkills[slot].indexOf(this.charm.skills[slot]) == -1) {
              
              console.log("current skill not found! setting new skill...")
              
              this.charm.skills[slot] = this.charm.availableSkills[slot][0]
              this.handleSkillChange(slot)
              
              console.log(this.charm.skills)
              console.log(this.charm.skillvalues)
            }
          }
        }
      }
      
      /* SLOTS -------
         validates the number of slots in the charm
         based on max available for the selected charm type */
         
      console.log("validating slots for charm " + this.offset)
      
      let maxSlots = this.types[this.charm.type.toString()].slots
      // TODO: equipped decoration testing goes here
      if (this.charm.slots > maxSlots) {
        this.charm.slots = maxSlots
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
      }
    },
    
<<<<<<< HEAD
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
=======
    validateSkillTwo () {
      if (this.charm.skillvalues[1] == 0) {
        this.charm.skills[1] = 0
      }
    },
    
    doGetSkillLevels (slot) {
      let levels = []
      let source = this.types[this.charm.type.toString()].name
      
      /* just in case someone screwed up
         maybe not the best place for this? but it gets run
         before anything else that relies on charm.skills[i]
         so if we fix it here it SHOULD be fine */
      if (isNaN(this.charm.skills[slot])) {
        this.charm.skills[slot] = 0
      }
      if (this.charm.skills[slot]) {
        let currSkill = this.charm.skills[slot]
        let boundSource = skills[currSkill][source]
        if (boundSource) {
          let boundSlot = boundSource[slot]
          if (boundSlot) {
            for (let i = boundSlot[1]; i >= boundSlot[0]; i--) {
              levels.push(i)
            }
          }
        }
        return levels
      }
      else return [0]
    },
    
    handleSkillChange (slot) {
      console.log("skill " + (slot+1) + " changed for charm " + this.offset + ", validating skill values")
      
      this.charm.skillLevels[slot] = this.doGetSkillLevels(slot)
      
      console.log(this.charm.skillLevels[slot])
      
      /* if-else chain to decide what to do with the skillvalue
         when the skill is changed. since we are now forcing it
         to the max available level by default, a couple of these
         cases are obsolete, but i'll leave them in just in ~case~  */
      
      // because we want to show the largest numbers on top in the 
      // select dropdown, the skillLevels array goes from max to min
      let minLevel = this.charm.skillLevels[slot].slice(-1)[0]
      let maxLevel = this.charm.skillLevels[slot][0]
      
      // force skillvalue to 0 when skill goes to 0 
      if (this.charm.skills[slot] == 0) {
        console.log("found 0 skill in slot " + slot + " of charm " + this.offset)
        this.charm.skillvalues[slot] = 0
      }
      // for negative skillvalues in excess of new skillLevels,
      // force skillvalue to minLevel
      // (should only happen in 2nd slot)
      else if (this.charm.skillvalues[slot] < minLevel) {
        this.charm.skillvalues[slot] = minLevel
      }
      // when current skillvalue exceeds skillLevels for newSkill,
      // force skillvalue to maxLevel
      else if (this.charm.skillvalues[slot] > maxLevel) {
        this.charm.skillvalues[slot] = maxLevel
      }
      // when allocating a new skill,
      // force skillvalue to maxLevel
      // (because of the if-else chain we already know that
      // the skill for this slot is nonzero)
      // (should also only happen in 2nd slot)
      else if (this.charm.skillvalues[slot] == 0) {
        console.log("new skill, forcing to max")
        this.charm.skillvalues[slot] = maxLevel
      }
      // force skillvalue to maxLevel by default
      else this.charm.skillvalues[slot] = maxLevel
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
    },
    
    removeCharm (event) {
      this.$emit('remove', this.offset)
    },
    
    setActive (event) {
      this.$emit('active', this.offset)
    },
    
    blur (e) {
      e.target.blur()
    }
    
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
  line-height: 50px;
  top: 2px;
  cursor: pointer;
}

.active-charm-button {
  position: absolute;
<<<<<<< HEAD
  right: -24px;
  font-size: 20px;
  line-height: 50px;
  top: 2px;
  cursor: pointer;
}

.active-charm-button:before {
  content: '\e806';
  font-family: 'icons';
=======
  right: -25px;
  font-size: 24px;
  line-height: 50px;
  top: 2px;
  cursor: pointer;
>>>>>>> 2c5fc82a52cf5431c60e24fd2960cd80caf370a8
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
