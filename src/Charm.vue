<template>
<transition name="charm-transition">
<li class="charm-holder" v-if="charm">
  <a class="remove" v-on:click="removeCharm">✖</a>
  
  <div class="charm">
    <div class="rarity styled-select">
      <select v-model="charm.rarity"
              v-on:change="blur($event); validateCharm()">
        <option v-for="rarity in 7" v-if="rarity >= charm.minRarity" :value="rarities[rarity-1].value">
          {{ rarities[rarity-1].text }}
        </option>
      </select>
    </div>
    
    <div class="slots">
      <a class="minus-slots" 
            v-if="canDecreaseSlots"
            v-on:click="charm.slots-=1">➖</a> 
        <span v-for="slot in charm.slots" 
              class="slot" :class="{ filled: charm.filledSlots >= slot }" />
      <a class="plus-slots" 
            v-if="canIncreaseSlots"
            v-on:click="charm.slots+=1">➕</a>
    </div>
    
    <div class="skill1">
      <select v-model="charm.skills[0]"
              v-on:change="blur($event); validateSkillValues(0)">
        <option v-for="skillId in charm.availableSkills[0]" 
                v-if="skillId != charm.skills[1]"
                :value="skillId">
          {{ skillName(skillId) }}
        </option>
      </select>
    </div>
    
    <div class="skill1value">
      <select v-model="charm.skillvalues[0]" @change="blur">
        <option v-for="value in charm.skillLevels[0]" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
    
    <div class="skill2">
      <select v-model="charm.skills[1]"
              v-on:change="blur($event); validateSkillValues(1)">
        <option v-for="skillId in charm.availableSkills[1]" 
                v-if="skillId != charm.skills[0]"
                :value="skillId">
          {{ skillName(skillId) }}
        </option>
      </select>
    </div>
    
    <div class="skill2value">
      <select v-model="charm.skillvalues[1]"
              v-show="charm.skillvalues[1]" v-on:change="blur($event); validateSkillTwo()">
        <option v-for="value in charm.skillLevels[1]" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
    
  </div>
  
  <a class="active-charm-button" v-on:click="setActive">᳃</a>
  
  <div v-if="debug">{{ offset }}<br>{{ charm.data || "new charm" }}</div>
</li> 
</transition>
</template>

<script>
import skills from 'json-loader!./skills.json'
import decorations from 'json-loader!./decorations.json'
import { DEBUG } from './utils'

export default {
  name: 'charm',
  props: ['charm', 'offset', 'availableSkillsList'],
  data () {
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
  
  computed: {

    canIncreaseSlots () {
      return (this.charm.slots < this.types[this.charm.type.toString()].slots)
    },
    canDecreaseSlots () {
      return (this.charm.slots > this.charm.filledSlots)
    }
    
  },
  
  methods: {
    skillName (skillId) {
      return skills[skillId].name
    },
  
    getFilledSlots () {
      console.log('calculating filled slots for ' + this.offset)
      let filled = 0
      for (let i = 0; i < this.charm.decorations.length; i++) {
        let decoration = this.charm.decorations[i]
        if (decoration) filled += decorations[decoration].slots
      } 
      this.charm.filledSlots = filled
    },
    
    /* currently, as decorations can't be modified (only deleted
       along with their charm), we need to restrict the rarities
       the user can select to those which have enough slots
       to accomodate all equipped decorations */
    getMinRarity () {
      if (this.charm.filledSlots == 3) this.charm.minRarity = 5
      else if (this.charm.filledSlots == 2) this.charm.minRarity = 3
      else this.charm.minRarity = 1
    },
    
    getAvailableSkills () {
      console.log('calculating available skills for ' + this.offset)
      let source = this.types[this.charm.type].name
      let availSkills = []
      for (let slot = 0; slot < 2; slot++) {
        availSkills[slot] = this.availableSkillsList[source][slot]
      }
      this.charm.availableSkills = availSkills
    },
    
    getSkillLevels () {
      console.log("calculating skill levels for " + this.offset)
      let skillLvls = []
      for (let slot = 0; slot < 2; slot++) {
        skillLvls[slot] = this.doGetSkillLevels(slot)
      }
      this.charm.skillLevels = skillLvls
    },
    
    
    validateCharm () {
      let source = this.types[this.charm.type.toString()].name
      
      /* TYPE -------
          changes the charm type (timeworn, shining or mystery)
          according to the selected rarity */
      
      console.log("validating type for charm " + this.offset)
      let oldType = this.charm.type
      
      if (this.charm.rarity > 4) this.charm.type = 327
      else if (this.charm.rarity > 2) this.charm.type = 326
      else this.charm.type = 325
      
      if (this.charm.type != oldType) {
        
        console.log("charm type modified!")
        console.log("validating skills for charm " + this.offset)
        
        let oldSkills = this.charm.availableSkills
        this.getAvailableSkills()
        console.log(oldSkills[0])
        console.log(this.charm.availableSkills[0])
        if (this.charm.availableSkills != oldSkills) {
          
          console.log("available skills modified!")
          
          for (let slot = 0; slot < 2; slot++) {
            if (this.charm.availableSkills[slot].indexOf(this.charm.skills[slot]) == -1) {
              
              console.log("current skill not found! setting new skill...")
              
              this.charm.skills[slot] = this.charm.availableSkills[slot][0]
              this.validateSkillValues(slot)
              
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
      }
      
      
    },
    
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
    
    validateSkillValues (slot) {
      console.log("validating skill values for charm " + this.offset)
      
      this.charm.skillLevels[slot] = this.doGetSkillLevels(slot)
      
      console.log(this.charm.skillLevels[slot])
      
      let minLevel = this.charm.skillLevels[slot].slice(-1)[0]
      let maxLevel = this.charm.skillLevels[slot][0]
      
      // force skillvalue to 0 when skill goes to 0 
      if (this.charm.skills[slot] == 0) {
        console.log("found 0 skill in slot " + slot + " of charm " + this.offset)
        this.charm.skillvalues[slot] = 0
      }
      // force skillvalue to skillLevels.last 
      // when current skillvalue exceeds skillLevels for newSkill
      else if (this.charm.skillvalues[slot] > maxLevel) {
        this.charm.skillvalues[slot] = maxLevel
      }
      // force skillvalue to max when allocating a new skill
      // (because of the if-else chain we already know that
      // the skill for this slot is nonzero)
      // (should also only happen in 2nd slot)
      else if (this.charm.skillvalues[slot] == 0) {
        console.log("new skill, forcing to max")
        this.charm.skillvalues[slot] = maxLevel
      }
      // force skillvalue to skillLevels.first 
      // for negative skillvalues in excess of new skillLevels
      // (should only happen in 2nd slot)
      else if (this.charm.skillvalues[slot] < minLevel) {
        this.charm.skillvalues[slot] = minLevel
      }
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
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
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
  right: -25px;
  font-size: 24px;
  line-height: 50px;
  top: 2px;
  cursor: pointer;
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

  background-image:
    linear-gradient(45deg, transparent 50%, #42b983 50%),
    linear-gradient(135deg, #42b983 50%, transparent 50%);
  background-position:
    calc(100% - 10px) calc(0.75em),
    calc(100% - 5px) calc(0.75em);
  background-size:
    5px 4px,
    5px 5px;
  background-repeat: no-repeat;
}

select:hover {
  background-image:
    linear-gradient(45deg, transparent 50%, #54de9b 50%),
    linear-gradient(135deg, #54de9b 50%, transparent 50%);
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
    calc(96% - 5px) calc(0.75em),
    calc(96% - 1px) calc(0.75em);
  background-size:
    4px 4px,
    4px 4px;
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
