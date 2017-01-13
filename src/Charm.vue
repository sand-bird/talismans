<template>

<li class="charm-holder" v-if="charm">
  <a class="remove" v-on:click="removeCharm">✖</a>
  
  <div class="charm">
    <div class="rarity styled-select">
      <select v-model="charm.rarity"
              v-on:change="validateCharm">
        <option v-for="rarity in rarities" :value="rarity.value">
          {{ rarity.text }}
        </option>
      </select>
    </div>
    
    <div class="slots">
      <a class="minus-slots" 
            v-if="charm.slots"
            v-on:click="charm.slots-=1">➖</a> 
        <span v-for="slot in charm.slots" 
              class="slot" :class="{ filled: charm.decorations[slot-1] }" />
      <a class="plus-slots" 
            v-if="canIncreaseSlots"
            v-on:click="charm.slots+=1">➕</a>
    </div>
    
    <div class="skill1">
      <select v-model="charm.skills[0]"
              v-on:change="validateSlots(0)">
        <option v-for="skillId in availableSkills[0]" :value="skillId">
          {{ skills[skillId].name }}
        </option>
      </select>
    </div>
    
    <div class="skill1value">
      <select v-model="charm.skillvalues[0]">
        <option v-for="value in skillLevels[0]" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
    
    <div class="skill2">
      <select v-model="charm.skills[1]" >
        <option v-for="skillId in availableSkills[1]" :value="skillId">
          {{ skills[skillId].name }}
        </option>
      </select>
    </div>
    
    <div class="skill2value">
      <select v-model="charm.skillvalues[1]"
              v-if="charm.skills[1]" 
              v-on:DOMNodeRemoved="charm.skills[1] = 0">
        <option v-for="value in skillLevels[1]" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
    
  </div>
</li> 
</template>

<script>
import skills from 'json-loader!./skills.json'

export default {
  name: 'charm',
  props: ['charm', 'offset', 'availableSkillsList'],
  data () {
    return { 
      rarities: [
        { text: "Pawn Talisman", value: 1, source: "mystery", slots: 1 },
        { text: "Bishop Talisman", value: 2, source: "mystery", slots: 1 },
        { text: "Knight Talisman", value: 3, source: "shining", slots: 2 },
        { text: "Rook Talisman", value: 4, source: "shining", slots: 2 },
        { text: "Queen Talisman", value: 5, source: "timeworn", slots: 3 },
        { text: "King Talisman", value: 6, source: "timeworn", slots: 3 },
        { text: "Dragon Talisman", value: 7, source: "timeworn", slots: 3 }
      ],
      skills: skills
    }
  },
  
  updated () {
    //console.log("updated skill " + this.offset)
  },
  
  computed: {
  
    displaySlots () {
      let slots = ""
      for (let i = this.charm.slots; i > 0; i--) {
        slots += "O"
      } 
      return slots
    },
    
    canIncreaseSlots () {
      return (this.charm.slots < this.rarities[this.charm.rarity-1].slots)
    },
    
    availableSkills () {
      //console.log('calculated available skills for ' + this.offset)
      let source = this.rarities[this.charm.rarity-1].source
      let availSkills = []
      for (let slot = 0; slot < 2; slot++) {
        availSkills[slot] = this.availableSkillsList[source][slot]
      }
      return availSkills
    },
    
    skillLevels () {
      //console.log("calculating skill levels for charm " + this.offset)
      let skillLvls = []
      for (let slot = 0; slot < 2; slot++) {
        skillLvls.push(this.getSkillLevels(slot))
      }
      return skillLvls
    },
  },
  
  methods: {
    
    validateCharm () {
      let source = this.rarities[this.charm.rarity-1].source
      
      /* SKILLS ------
         validates the skills appearing in each slot
         based on what is available for the selected charm type */
      
      for (let slot = 0; slot < 2; slot++) {
        let availSkillsForSlot = this.availableSkillsList[source][slot]
        if (availSkillsForSlot.indexOf(this.charm.skills[slot]) == -1) {
        
          /* first entry in availSkillsForSlot should always be a
             skill in slot0 and no skill in slot1. first skillValue
             should be 1 if slot0 (skill must have positive value), 
             or 0 if slot1 (the 2nd slot is empty by default).  */

          this.charm.skills[slot] = availSkillsForSlot[0]
          this.charm.skillvalues[slot] = 1 - slot
        }
      }
      
      /* SLOTS ------
         validates the number of slots in the charm
         based on max available for the selected charm type */
      
      let maxSlots = this.rarities[this.charm.rarity-1].slots
      // TODO: equipped decoration testing goes here
      if (this.charm.slots > maxSlots) this.charm.slots = maxSlots
    },
    
    getSkillLevels (slot) {
      let levels = []
      let source = this.rarities[this.charm.rarity - 1].source
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
    },
    
    validateSkillValue (slot) {
      // - force skillvalue to 0 when skill goes to 0
      // - force skillvalue to skillLevels.last 
      //   when current skillvalue exceeds skillLevels for newSkill
      // - same thing with minimums in the case of slot 2
    },
    
    validateSlots(i) {
      console.log(i)
    },
    
    removeCharm (event) {
      this.$emit('remove', this.offset)
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

.charm, .charms-header {
  display: block;
  width: 680px;
  overflow: hidden;
  margin: 5px auto;
  box-shadow: 0 1px 1px #eee;
  position: relative;
  border-radius: 5px;
}

.charm {
  border: 1px solid #ccc;
}

.charm:nth-child(2n + 1) {
  background-color: #fcfcfc;
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

.remove:hover {
  color: 
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
    calc(96% - 5px) calc(0.75em),
    calc(96%) calc(0.75em);
  background-size:
    5px 5px,
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
  left: 8px;
}

.plus-slots {
  right: 8px;
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
