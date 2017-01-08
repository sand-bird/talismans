<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <input id="upload" type="file" v-on:change='init' v-show="!file" />
    <div id="save-button" v-on:click='download' v-show="file">Download Save</div>
    <ul id="files">
      <li v-for="(name, index) in names" v-on:click="setActive(index)"
          :class="[{ active: active == index}, 
                   { disabled : !name }]"
      >
        <span>File {{ index + 1 }}:</span>
        <h3 :class="'name'">{{ name || "(none)" }}</h3>
      </li>
    </ul>

    
    <ul id="charms">
      <li class="charms-header">
        <div v-for="column in columns" :class="column.id">
          {{ column.name }}
        </div>
      </li>
      <li v-for="(charm, index) in charms" class="charm">
        
        <div class="rarity styled-select">
          <select v-model="charm.rarity"
                  v-on:change="validateSlots(charm)">
            <option v-for="rarity in rarities" :value="rarity.value">
              {{ rarity.text }}
            </option>
          </select>
        </div>
        
        <div class="slots">
          <span class="minus-slots" 
                v-if="charm.slots"
                v-on:click="charm.slots-=1">-</span> 
            {{ displaySlots(charm) }} 
          <span class="plus-slots" 
                v-if="canIncreaseSlots(charm)"
                v-on:click="charm.slots+=1">+</span>
        </div>
        
        <div class="skill1">
          <select v-model="charm.skills[0]"
                  v-on:change="">
            <option v-for="skillId in getAvailableSkills(charm, 0)" :value="skillId">
              {{ skills[skillId].name }}
            </option>
          </select>
        </div>
        
        <div class="skill1value">
          <select v-model="charm.skillvalues[0]">
            <option v-for="value in getSkillLevels(charm, 0)" :value="value">
              {{ value }}
            </option>
          </select>
        </div>
        
        <div class="skill2">
          <select v-model="charm.skills[1]" >
            <option v-for="skillId in getAvailableSkills(charm, 1)" :value="skillId">
              {{ skills[skillId].name }}
            </option>
          </select>
        </div>
        
        <div class="skill2value">
          <select v-model="charm.skillvalues[1]"
                  v-if="charm.skillvalues[1]" 
                  v-on:DOMNodeRemoved="charm.skills[1] = 0">
            <option v-for="value in getSkillLevels(charm, 1)" :value="value">
              {{ value }}
            </option>
          </select>
        </div>
        
      </li>
    </ul>

  </div>
</template>

<script>
import { loadFiles, loadCharms, processCharm, unpackCharm } from './utils'
import skills from 'json-loader!./skills.json'

export default {
  name: 'app',
  data () {
    return {
      title: '☆\'s Talisman Editor',
      file: null,
      names: [],
      active: null,
      charms: [],
      values: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      columns: [
        { name: 'Rarity', id: 'rarity' },
        { name: 'Slots', id: 'slots' },
        { name: 'Skill 1', id: 'skill1' },
        { name: '', id: 'skill1value' },
        { name: 'Skill 2', id: 'skill2' },
        { name: '', id: 'skill2value' }
      ],
      rarities: [
        { text: "Pawn Talisman", value: 1, source: "mystery", slots: 1 },
        { text: "Bishop Talisman", value: 2, source: "mystery", slots: 1 },
        { text: "Knight Talisman", value: 3, source: "shining", slots: 2 },
        { text: "Rook Talisman", value: 4, source: "shining", slots: 2 },
        { text: "Queen Talisman", value: 5, source: "timeworn", slots: 3 },
        { text: "King Talisman", value: 6, source: "timeworn", slots: 3 },
        { text: "Dragon Talisman", value: 7, source: "timeworn", slots: 3 }
      ],
      skills: skills,
      availableSkills: {
        mystery: [[],[]],
        shining: [[],[]],
        timeworn: [[],[]]
      }
    }
  },
  
  methods: {
  
    init (event) {
    
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
        console.log(a)
        vm.active = a
        vm.charms = loadCharms(vm.file, a)
        this.generateAvailableSkills()
      }
      
      reader.readAsArrayBuffer(file)
    },
    
    setActive (index) {
      // todo: make sure to save charms if switching file
    
      if (this.names[index]) {
        this.active = index
        this.charms = loadCharms(this.file, index)
      }
    },
    
    download (event) {
      console.log(event)
    },
    
    displaySlots (charm) {
      let slots = ""
      for (let i = charm.slots; i > 0; i--) {
        slots += "O"
      } 
      return slots
    },
    
    canIncreaseSlots (charm) {
      return (charm.slots < this.rarities[charm.rarity-1].slots)
    },
    
    generateAvailableSkills () {
      ["mystery", "shining", "timeworn"].forEach((source) => {
        for (let i = 1; i < skills.length; i++) {
          if (skills[i][source]) {
            // first step - the skill is available somewhere
            if (skills[i][source][0]) {
              this.availableSkills[source][0].push(skills[i].id)
            }
            if (skills[i][source][1]) {
              this.availableSkills[source][1].push(skills[i].id)
            }
          }
        }
      })
    },
    
    getAvailableSkills (charm, skillSlot) {
      let source = this.rarities[charm.rarity-1].source
      return this.availableSkills[source][skillSlot]
    },
    
    getSkillLevels (charm, skillSlot) {
      let levels = []
      let source = this.rarities[charm.rarity-1].source
      let currSkill = charm.skills[skillSlot]
      let boundSource = skills[currSkill][source]
      if (boundSource) {
        let boundSlot = boundSource[skillSlot]
        if (boundSlot) {
          for (let i = boundSlot[0]; i <= boundSlot[1]; i++) {
            levels.push(i)
          }
        }
      }
      return levels
    },
    
    validateSlots (charm) {
      let source = this.rarities[charm.rarity-1].source
      for (let i = 0; i < 2; i++) {
        if (this.availableSkills[source][i].indexOf(charm.skills[i]) == -1) {
          charm.skills[i] = 0
          charm.skillvalues[i] = 0
        }
      }
      console.log(charm.skills)
    }
  }
}
</script>

<style>
html {
  box-sizing: border-box;
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
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
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

#files {
  display: block;
  border-radius: 20px;
  border: 1px solid #999;
  overflow: hidden;
  width: 450px;
  margin: 20px auto;
  box-shadow: inset 1px 1px #fff, inset -1px -1px #ddd;
}

#files li {
  background-color: #eee;
  width: 149px;
  margin: 0;
  border-right: 1px solid #999;
  float: left;
  padding: 10px 5px;
}

#files li:last-child {
  border-right: none;
  width: 150px;
}

#upload {
  box-shadow: 0 0 5px #ccc
}

#files li.active {
  background-color: #fcfcfc;
  box-shadow: inset 1px 1px #ddd, inset -1px -1px #fff;
}

.name {
  font-size: 20px;
  font-weight: bold;
  line-height: 30px;
  margin: 5px 0 0;
}

.disabled .name {
  font-weight: normal;
  opacity: 0.5;
  font-size:14px;
}



#charms {
  width: auto;
  overflow: hidden;
  display: block;
  text-align: center;
}

.charm, .charms-header {
  display: block;
  width: 650px;
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


#save-button {
  display: inline-block;
  border:1px solid #bfbfbf;
  color: #8c8c8c;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px 40px;
  box-shadow: inset 0 1px 0 0 #fff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2,0 2px 4px 0 #f2f2f2;
  text-shadow: 0 1px 0 #fff;
  background-color: #f9f9f9;
  cursor: pointer;
}

#save-button:hover, #save-button:active {
  border:1px solid #8c8c8c;
  color: #8c8c8c;
  box-shadow: inset 0 1px 0 0 #ffffff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2;
  background-color: #f2f2f2;
}

select {

  /* styling */
  background-color: #fff;
  display: inline-block;
  font: inherit;
  line-height: 1em;
  padding: 5px 25px 5px 5px;
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
    linear-gradient(45deg, transparent 50%, #aaa 50%),
    linear-gradient(135deg, #aaa 50%, transparent 50%);
  background-position:
    calc(96% - 5px) calc(0.75em),
    calc(96%) calc(0.75em);
  background-size:
    5px 5px,
    5px 5px,
    1px 1.5em;
  background-repeat: no-repeat;
}

.skill1value select, .skill2value select {
  padding-right: 0;
  background-image: none;
}

.styled-select select option {
  
   text-align: right;
}

.slots {
  position: relative;
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

</style>
