<template>
{{ compTest }}
  <ul id="charms">
    <li class="charms-header">
      <div v-for="column in columns" :class="column.id">
        {{ column.name }}
      </div>
    </li>
    <li v-for="charm in processedCharms" class="charm">
      
      <div class="rarity">
        <select v-model="charm.rarity">
          <option v-for="rarity in rarities" :value="rarity.value">
            {{ rarity.text }}
          </option>
        </select>
      </div>
      
      <div class="slots">
        {{ charm.slots }}
      </div>
      
      <div class="skill1">
        <select v-model="charm.skills[0]">
          <option v-for="skill in skills" :value="skill.id">
            {{ skill.name }}
          </option>
        </select>
      </div>
      
      <div class="skill1value">
      </div>
      
      <div class="skill2">
        <select v-model="charm.skills[1]">
          <option v-for="skill in skills" :value="skill.id">
            {{ skill.name }}
          </option>
        </select>
      </div>
      
      <div class="skill2value">
      </div>
      
    </li>
  </ul>
</template>

<script>
import skills from 'json-loader!./skills.json'
import { processCharm } from './utils'
export default {
  name: 'charms',
  props: ['charms'],
  data () {
    return {
      columns: [
        { name: 'Rarity', 
          id: 'rarity' },
        { name: 'Slots', 
          id: 'slots' },
        { name: 'Skill 1', 
          id: 'skill1' },
        { name: '', 
          id: 'skill1value' },
        { name: 'Skill 2', 
          id: 'skill2' },
        { name: '',
          id: 'skill2value' }
      ],
      rarities: [
        { text: "Pawn Talisman", 
          value: 1 },
        { text: "Bishop Talisman", 
          value: 2 },
        { text: "Knight Talisman", 
          value: 3 },
        { text: "Rook Talisman", 
          value: 4 },
        { text: "Queen Talisman", 
          value: 5 },
        { text: "King Talisman", 
          value: 6 },
        { text: "Dragon Talisman", 
          value: 7 }
      ],
      skills: skills
    }
  },
  computed: {
    compTest () {
      console.log( skills )
      return skills
    },
    processedCharms () {
      let pc = []
      this.charms.forEach((charm) => {
        pc.push(processCharm(charm))
      })
      return pc
    }
  },
  methods: {
    displaySlots (charm) {
      let slots = ""
      for (let i = charm.slots; i > 0; i--) {
        slots += "O"
      } 
      return slots;
    },
    displayRarity (charm) {
      let names = ["Pawn", "Bishop", "Knight", "Rook", "Queen", "King", "Dragon"]
      return (names[charm.rarity - 1] + " Talisman")
    },
    displaySkills (charm, slot) {
      let skillid = charm.skills[slot]
      if (skillid) return (skills[skillid-1].name)
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

table th, table td {
  padding: 10px;
  margin: 0px;
  border-top: 1px solid #ff0;
  border-bottom: 2px solid #0ff;
}

table td:first-child {
  border-radius: 5px 0 0 5px;
  border: 1px solid #f0f;
  border-right: none;
}


table {
  /*border-collapse: collapse;*/
  margin: 0 auto;
}

table .skill1, table .skill2 {
  text-align: right;
}

#charms {
  width: auto;
  overflow: hidden;
  display: block;
  text-align: center;
}

.charm, .charms-header {
  display: block;
  width: 600px;
  border: 1px solid #ccc;
  overflow: hidden;
  margin: 4px auto;
  border-radius: 5px;
  box-shadow: 0 1px 1px #eee;
}

.charm div, .charms-header div {
  display: inline-block;
  padding: 1px;
  float: left;
  height: 50px;
  line-height: 50px;
}

.charms-header div {
  border-right: 1px solid #ccc;
}

.charms-header div.skill2 {
  border-right: none;
}

.charm div {
  border-right: 1px solid #eee;
}

.charm div.skill2value {
  border-right: none;
}

.rarity {
  width: 25%;
}

.slots {
  width: 15%;
}

.skill1, .skill2 {
  width: 22.5%;
}

.charms-header .skill1, .charms-header .skill2 {
  width: 30%;
  margin-left: 0;
}

.skill1value, .skill2value {
  width: 7.5%;
}

.charms-header .skill1value, .charms-header .skill2value {
  display: none;
}

</style>
