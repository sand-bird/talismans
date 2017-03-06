// shows raw data for each charm if true
export const DEBUG = true

/* -----------------------------------------------
                    O F F S E T S                
   ----------------------------------------------- */

/* the following offsets contain save slot data */

// contains 1 if the slot is used, 0 otherwise
const USED_SLOTS_OFFSET = 0x04
const USED_SLOTS_SIZE = 1

// contains a pointer to the beginning 
// of the data block for that save slot
const SLOT_POINTER_OFFSET = 0x10
const SLOT_POINTER_OFFSET_SIZE = 4


/* the following offsets are per save slot, and are 
   in relation to the slot pointer for that save slot
   (ie, slot pointer must be added to the value)  */

const NAME_OFFSET = 0x00
const NAME_SIZE = 32  

const EQUIPMENT_BOX_OFFSET = 0x4667
// dunno what the extra 15 bytes is for
const EQUIPMENT_BOX_SIZE = 50415
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
      saves[i] = file.toString('utf8', nameOffset, nameOffset + 32).replace(/\0/g, '')
    }
    else saves[i] = null
  }
  return saves
}

/* takes a save slot id and returns a charmOffsets array (for
   displaying charms in a sortable way & further decoupling
   App.vue from the data) and an emptyOffsets array (for adding 
   new charms). 
   
   currently executed each time the user changes the active
   save slot and returns only that save's offsets. will probably 
   change it to run once on init and store all offsets for all 
   saves in one 2d array (speed at the cost of memory)  */
export const loadOffsets = (file) => {
  let offsets = [null, null, null]
  for (let slot = 0; slot < 3; slot++) {
  
    // skips this iteration if slot is empty (!0 == true)
    if (!checkSave(file, slot)) continue
    
    let equipOffset = getOffset(file, slot, EQUIPMENT_BOX_OFFSET)
    let emptyOffsets = []
    let charmOffsets = []
    let data = {}
    for (let i = 0; i < EQUIPMENT_BOX_SLOTS; i++) {
      let offset = equipOffset + (EQUIPMENT_BOX_SLOT_SIZE * i)
      let equipType = file.readUInt8(offset)
      if (equipType == 6) {
        // found a charm
        charmOffsets.push(offset)
      }
      else if (equipType == 0) {
        // found empty space - save offset so we can add charms
        emptyOffsets.push(offset)
      }
    }
    data.emptyOffsets = emptyOffsets
    data.charmOffsets = charmOffsets
    
    offsets[slot] = data
  }
  
  return offsets
}

/* gathers every charm on every save and returns 
   one big object. vuex handles the rest  */
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
          charm.data = Buffer.alloc(36)
          file.copy(charm.data, 0, offset)
        }
        
        /* properties from file */
        
        charm.offset = offset
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
        
        // 
        let filled = 0
        for (let i = 0; i < 3; i++) {
          let decoration = charm.decorations[i]
          if (decoration) filled += DECORATIONS[decoration].slots
        } 
        charm.filledSlots = filled
        
        // restrict the rarities the user can select to those which 
        // have enough slots to accommodate all equipped decorations
        if (this.filledSlots == 3) charm.minRarity = 5
        else if (this.filledSlots == 2) charm.minRarity = 3
        else charm.minRarity = 1
        
        charms[offset] = charm
      }
      /// ??????????
      else if (equipType == 0) {
        charms[offset] = null
      }
      
    }
  }
  return charms
}


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
    }
    else {
      // charm has been deleted
      file.fill(0, offset, offset + 35)
    }
  }
}

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
             C H A R M   M E T H O D S               
   ----------------------------------------------- */

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

export const getAvailableSkills = (type) => {
  let availSkills = []
  for (let slot = 0; slot < 2; slot++) {
    availSkills[slot] = getAvailableSkillsForSlot(type, slot)
  }
  return availSkills
}

const getAvailableSkillsForSlot = (type, slot) => {
  return AVAILABLE_SKILLS[TYPES[type].name][slot]
}
