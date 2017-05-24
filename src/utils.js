// shows raw data for each charm if true
export const DEBUG = false

/* -----------------------------------------------
                    O F F S E T S                
   ----------------------------------------------- */

/* the following offsets contain save slot data */

// contains 1 if the slot is used, 0 otherwise
const USED_SLOTS_OFFSET = 0x04
const USED_SLOTS_SIZE = 1

// contains a pointer to the beginning 
// of the data block for that save slot
// (see getOffset for how this is used)
const SLOT_POINTER_OFFSET = 0x10
const SLOT_POINTER_OFFSET_SIZE = 4


/* the following offsets are per save slot, and are 
   in relation to the slot pointer for that save slot
   (ie, slot pointer must be added to the value)  */

const NAME_OFFSET = 0x00
const NAME_SIZE = 32  

const EQUIPMENT_SETS_OFFSET = 0x16DB7
const EQUIPMENT_SETS_SIZE = 5440
const EQUIPMENT_SETS_SLOTS = 40
const EQUIPMENT_SETS_SLOT_SIZE = 136
// offset of charm used in set, relative to start of set
const EQUIPMENT_SET_CHARM_OFFSET = 54

const EQUIPMENT_BOX_OFFSET = 0x4667
const EQUIPMENT_BOX_SIZE = 50400
const EQUIPMENT_BOX_SLOTS = 1400
const EQUIPMENT_BOX_SLOT_SIZE = 36


/* the following offsets are per talisman, and are in 
   relation to the offset of the equipment box slot
   where that talisman is located (ie, equipment box 
   slot offset must be added to the value)  */

const RARITY_OFFSET = 1
const SLOTS_OFFSET = 16
const TYPE_OFFSET = 18
const SKILL1_OFFSET = 12
const SKILL2_OFFSET = 13
const SKILL1VALUE_OFFSET = 14
const SKILL2VALUE_OFFSET = 15
// talismans can have up to 3 decorations slotted.
// a single decoration only occupies one of these 
// words (2 bytes) no matter how many slots it 
// requires. to find how many slots a decoration 
// uses, the decoration must be looked up via id.
const DECORATION1_OFFSET = 6
const DECORATION2_OFFSET = 8
const DECORATION3_OFFSET = 10

/* -----------------------------------------------
                  R E S O U R C E S                
   ----------------------------------------------- */

import DECORATIONS from 'json-loader!./decorations.json'

import SKILLS from 'json-loader!./skills.json'

// avail. skills are stored in a 2d array. for 2nd slot skills, 
// we start with id 0 available, as that represents no skill. 
// the 1st slot must have a skill, so id 0 is NOT an option.
import AVAILABLE_SKILLS from 'json-loader!./avail_skills.json'

// technically, a "talisman" is the equippable item and a "charm" 
// is the source of the talisman. but i like to use "charm" 
// everywhere since it's shorter, so we call these "types" instead.
const TYPES = {
  "325": { name: "mystery", slots: 1 },
  "326": { name: "shining", slots: 2 },
  "327": { name: "timeworn", slots: 3 }
}
const RARITIES = {
  "1": "Pawn Talisman",
  "2": "Bishop Talisman",
  "3": "Knight Talisman",
  "4": "Rook Talisman",
  "5": "Queen Talisman",
  "6": "King Talisman",
  "7": "Dragon Talisman"
}
/*
import { EventEmitter } from 'events'

class Modal extends EventEmitter
*/
/* -----------------------------------------------
               F I L E   M E T H O D S               
   ----------------------------------------------- */

/* takes a save slot id (0 to 2) and an offset relative to a 
   save slot pointer, and computes the absolute offset.  */
const getOffset = (file, slotId, offset) => {
  return (
    file.readUIntLE (
      SLOT_POINTER_OFFSET + (SLOT_POINTER_OFFSET_SIZE * slotId), 
      SLOT_POINTER_OFFSET_SIZE
    ) + offset
  )
}

/* takes a save slot id (0 to 2) and checks if that slot is used */
export const checkSave = (file, slot) => {
  return file.readUInt8(USED_SLOTS_OFFSET + slot)
}

/* returns an array[3]. each index contains the character 
   name for that save, or null if the save slot is unused.  */
export const loadSaves = (file) => {
  if (!Buffer.isBuffer(file)) {
    console.log("Error! file is not buffer")
    return
  }
  let saves = []
  // see which names we got
  for (let i = 0; i <= 2; i++) {
    /* since CHAR_SLOT_USED_SIZE is 1 (byte), 
       we use readUInt8, which reads 1 byte  */
    if (checkSave(file, i)) {
      let nameOffset = getOffset(file, i, NAME_OFFSET)
      let name = file.toString('utf8', nameOffset, nameOffset + 32)
      saves[i] = name.slice(0, name.indexOf('\0'))
    }
    else saves[i] = null
  }
  return saves
}

export const loadEquipSets = (file) => {
  let equipSets = {}
  
  for (let slot = 0; slot < 3; slot++) {
    if (!checkSave(file, slot)) continue
    
    let equipSetsOffset = getOffset(file, slot, EQUIPMENT_SETS_OFFSET)
    
    let equipSetsForSlot = {}
    for (let i = 0; i < EQUIPMENT_SETS_SLOTS; i++) {
      let offset = equipSetsOffset + (EQUIPMENT_SETS_SLOT_SIZE * i)
      let charmBoxSlot = file.readUInt16LE(offset + EQUIPMENT_SET_CHARM_OFFSET)
      if (charmBoxSlot == 0xFFFF) continue
      let charmOffsetFromBox = charmBoxSlot * EQUIPMENT_BOX_SLOT_SIZE
      let charmOffsetFromSave = EQUIPMENT_BOX_OFFSET + charmOffsetFromBox
      let charmOffset = getOffset(file, slot, charmOffsetFromSave)
      let equipSet = {}
      let name =  file.toString('utf8', offset, offset + 10)
      equipSet.name = name.slice(0, name.indexOf('\0'))
      // we want to pad single digits with a 0 like it does in the game
      equipSet.id = ('0' + (i+1)).slice(-2)
      
      equipSetsForSlot[charmOffset] = equipSet
    }
    equipSets[slot] = equipSetsForSlot
  }
  return equipSets
}

/* takes a save slot id and returns arrays of charmOffsets 
   (for displaying charms in a sortable way) and emptyOffsets 
   (for adding new charms). 

   these are contained in OBJECTS with keys 0, 1, 2 corresponding 
   to save slot ids where those offsets can be found. they can't 
   be arrays because of spooky vue action when watched arrays are 
   updated/accessed by index.  */
export const loadOffsets = (file) => {
  
  let emptyOffsets = {}
  let charmOffsets = {}
  
  for (let slot = 0; slot < 3; slot++) {
  
    // skips this iteration if slot is empty (!0 == true)
    if (!checkSave(file, slot)) continue
    
    let emptyOffsForSlot = []
    let charmOffsForSlot = []
    let equipOffset = getOffset(file, slot, EQUIPMENT_BOX_OFFSET)

    for (let i = 0; i < EQUIPMENT_BOX_SLOTS; i++) {
      let offset = equipOffset + (EQUIPMENT_BOX_SLOT_SIZE * i)
      let equipType = file.readUInt8(offset)
      
      if (equipType == 6) {
        // found a charm
        charmOffsForSlot.push(offset)
      }
      else if (equipType == 0) {
        // found empty space - save offset so we can add charms
        emptyOffsForSlot.push(offset)
      }
    }
    emptyOffsets[slot] = emptyOffsForSlot.reverse()
    charmOffsets[slot] = charmOffsForSlot
  }
  
  return { emptyOffsets: emptyOffsets, charmOffsets: charmOffsets }
}

/* gathers every charm on every save and returns one big object. 
   vuex handles the rest  */
export const loadCharms = (file) => {
  let charms = {}
  for (let slot = 0; slot < 3; slot++) {
    // skips this iteration if slot is empty (!0 == true)
    if (!checkSave(file, slot)) continue
    
    let equipOffset = getOffset(file, slot, EQUIPMENT_BOX_OFFSET)
    
    for (let i = 0; i < EQUIPMENT_BOX_SLOTS; i++) {
      let offset = equipOffset + (EQUIPMENT_BOX_SLOT_SIZE * i)
      let equipType = file.readUInt8(offset)
      if (equipType == 6) {
        // found charm, process it
        let charm = {}
        
        if (DEBUG) {
          charm.data = getRawCharm(file, offset)
        }
        
        /* properties from file */
        
        charm.rarity = file.readUInt8(offset + RARITY_OFFSET)
        charm.slots = file.readUInt8(offset + SLOTS_OFFSET)
        charm.type = file.readUInt16LE(offset + TYPE_OFFSET)
        charm.skills = [
          file.readUInt8(offset + SKILL1_OFFSET), 
          file.readUInt8(offset + SKILL2_OFFSET)
        ]
        charm.skillValues = [
          file.readInt8(offset + SKILL1VALUE_OFFSET), 
          file.readInt8(offset + SKILL2VALUE_OFFSET)
        ]
        charm.decorations = [
          file.readUInt16LE(offset + DECORATION1_OFFSET), 
          file.readUInt16LE(offset + DECORATION2_OFFSET), 
          file.readUInt16LE(offset + DECORATION3_OFFSET)
        ]
        
        /* calculated properties (not saved but still important) */
        processDecorations(charm)
        
        charms[offset] = charm
      }
      // store.charms should have every offset, even empty ones,
      // because of vue/vuex watched property magic
      else if (equipType == 0) {
        charms[offset] = null
      }
      
    }
  }
  return charms
}

/* writes the contents of the charms object into the given file */
export const saveCharms = (file, charms) => {
  let offsets = Object.keys(charms)
  for (let i = 0; i < offsets.length; i++) {
    let offset = parseInt(offsets[i])
    let charm = charms[offset]
    if (charm) {
      file.writeUInt8(6, offset)
      file.writeUInt8(charm.rarity, offset + RARITY_OFFSET)
      file.writeUInt8(charm.slots, offset + SLOTS_OFFSET)
      file.writeUInt16LE(charm.type, offset + TYPE_OFFSET)
      
      file.writeUInt8(charm.skills[0], offset + SKILL1_OFFSET)
      file.writeUInt8(charm.skills[1], offset + SKILL2_OFFSET)

      file.writeInt8(charm.skillValues[0], offset + SKILL1VALUE_OFFSET)
      file.writeInt8(charm.skillValues[1], offset + SKILL2VALUE_OFFSET)
      
      file.writeUInt16LE(charm.decorations[0], offset + DECORATION1_OFFSET)
      file.writeUInt16LE(charm.decorations[1], offset + DECORATION2_OFFSET)
      file.writeUInt16LE(charm.decorations[2], offset + DECORATION3_OFFSET)
    }
    else {
      // charm has been deleted
      file.fill(0, offset, offset + 35)
    }
  }
}

/* used for debugging - fetches the charm's data in buffer 
   format and returns it as a prettified string  */
export const getRawCharm = (file, offset) => {
  let buf = Buffer.alloc(36)
  file.copy(buf, 0, offset)
  
  return buf.toString('hex')
    // split bytes with space
    .match(/.{1,2}/g).join(" ")
    // trim and newline
    .match(/.{1,54}/g).map(s => s.trim()).join("\n")
}

/* -----------------------------------------------
                A P P   M E T H O D S             
   ----------------------------------------------- */

/* used in the sort function for comparing charms in App.vue. 

   charmA, charmB: charms to sort; objects, not offsets, 
                   since we don't have access to the store 
                   here in utils.js
   
             alph: 1 or 0; tells us when to sort skills 
                   by name instead of by id
         
            order: 1 or -1; flips the return value to
                   sort in reverse
         
         notfirst: not passed; starts null and is set true
                   when compareCharms recurses
   
   if both charms have the same value for key[0], the 
   next key is used, and so on recursively until the 
   keys array is empty.  */
export const compareCharms = (charmA, charmB, keys, alph, order, notfirst) => {
  
  // when sortOrder is -1, unflips every key but the first one
  if (notfirst) order = 1
  
  if (keys.length) {
    var valueA, valueB, key
    if (Array.isArray(keys[0])) {
      key = keys[0][0]
      let index = keys[0][1]
      valueA = charmA[key][index]
      valueB = charmB[key][index]
    }
    else {
      key = keys[0]
      valueA = charmA[key]
      valueB = charmB[key]
    }

    if (key == 'skills') {
      // we swap the names of a and b because when sorting skills 
      // we want the default order to be [ascending, descending], 
      // while the default for the others is [descending, ascending]
      [valueA, valueB] = [valueB, valueA]
      if (alph) {
        valueA = getSortName(valueA, order)
        valueB = getSortName(valueB, order)
      }
    }
    
    return (valueA < valueB ? order : valueA > valueB ? (order * -1) :
            compareCharms(charmA, charmB, keys.slice(1), alph, order, true))
  }
  else return 0
}

/* we pass order here so that we can make blank slot2 skills stay 
   at the bottom no matter which sortOrder we are using.  */
const getSortName = (skill, order) => {
  return (SKILLS[skill].name || (order == 1 ? '\uffff' : ''))
}

const validateCharm = (charm) => {
  // validate type
  if (charm.rarity > 4) charm.type = 327
  else if (charm.rarity > 2) charm.type = 326
  else charm.type = 325
  
  // validate skills
  for (let slot = 0; slot < 2; slot++) {
    let avail = AVAILABLE_SKILLS[TYPES[charm.type].name][slot]
    if (avail.indexOf(charm.skills[slot]) == -1) {
      charm.skills[slot] = avail[0]
      let maxSkill = SKILLS[charm.skill][TYPES[charm.type].name][slot][1]
      charm.skillValues[slot] = levels[0]
    }
    else {
      let levels = getSkillLevelsForSlot(charm.type, charm.skills[slot], slot)
      if (levels.indexOf(charm.skillValues[slot]) == -1) {
        charm.skillValues[slot] = levels[0]
      }
    }
  }
}

/* -----------------------------------------------
             C H A R M   M E T H O D S               
   ----------------------------------------------- */

export const getType = (rarity) => {
  if (rarity > 4) return 327
  else if (rarity > 2) return 326
  else return 325
}

export const getMaxSlots = (type) => {
  return TYPES[type].slots
}

export const getSkillName = (skill) => {
  return SKILLS[skill].name
}

export const getRarityName = (rarity) => {
  return RARITIES[rarity.toString()]
}

export const getSkillLevels = (type, skills) => {
  let source = TYPES[type].name
  let skillLevels = []
  for (let slot = 0; slot < 2; slot++) {
    skillLevels[slot] = getSkillLevelsForSlot(type, skills[slot], slot)
  }
  return skillLevels
}

const getSkillLevelsForSlot = (type, skill, slot) => {
  let levels = []
  let source = TYPES[type].name
  
  if (skill) {
    let boundSource = SKILLS[skill][source]
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
}

export const getAvailableSkills = (type, alph) => {
  let availSkills = []
  for (let slot = 0; slot < 2; slot++) {
    availSkills[slot] = getAvailableSkillsForSlot(type, slot, alph)
  }
  return availSkills
}

const getAvailableSkillsForSlot = (type, slot, alph) => {
  let skills = AVAILABLE_SKILLS[TYPES[type].name][slot]
  if (alph == 1) return skills.sort((a, b) => {
    let na = SKILLS[a].name
    let nb = SKILLS[b].name
    return (na > nb ? 1 : na < nb ? -1 : 0)
  })
  else return skills.sort((a, b) => {
    return (a > b ? 1 : a < b ? -1 : 0)
  })
}

export const processDecorations = (charm) => {
  if (charm.decorations && charm.decorations.length == 3) {
    let filled = 0
    for (let i = 0; i < 3; i++) {
      let decoration = charm.decorations[i]
      if (decoration && DECORATIONS[decoration])
        filled += DECORATIONS[decoration].slots
    } 
    charm.filledSlots = filled

    // restrict the rarities the user can select to those which 
    // have enough slots to accommodate all equipped decorations
    if (charm.filledSlots == 3) charm.minRarity = 5
    else if (charm.filledSlots == 2) charm.minRarity = 3
    else charm.minRarity = 1
  }
  else {
    charm.decorations = [0, 0, 0]
    charm.filledSlots = 0
    charm.minRarity = 1
  }
}

export const filterCharmData = (charms, useDeco) => {
  let filtered = []
  charms.forEach( charm => {
    let nc = {}
    nc.rarity = charm.rarity
    nc.slots = charm.slots
    nc.skills = charm.skills.slice()
    nc.skillValues = charm.skillValues.slice()
    if (useDeco) nc.decorations = charm.decorations.slice()
    
    filtered.push(nc)
  })
  return filtered
}
