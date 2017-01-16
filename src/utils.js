const FIRST_CHAR_SLOT_USED = 0x04
const CHAR_SLOT_USED_SIZE = 1

const FIRST_CHARACTER_OFFSET = 0x10
const CHARACTER_OFFSET_SIZE = 4

const NAME_OFFSET = 0x00
const NAME_SIZE = 32  

const EQUIPMENT_BOX_OFFSET = 0x4667 
const EQUIPMENT_BOX_SIZE = 50415 
const EQUIPMENT_BOX_SLOTS = 1400 
const EQUIPMENT_BOX_SLOT_SIZE = 36

const RARITY_OFFSET = 1
const SLOTS_OFFSET = 16
const TYPE_OFFSET = 18
const SKILL1_OFFSET = 12
const SKILL2_OFFSET = 13
const SKILL1VALUE_OFFSET = 14
const SKILL2VALUE_OFFSET = 15
const DECORATION1_OFFSET = 6
const DECORATION2_OFFSET = 8
const DECORATION3_OFFSET = 10


const getOffset = (data, slot, offset) => {
  return data.readUIntLE(0x10 + (4 * slot), 4) + offset
}

export const loadFiles = (data) => {
  if (!Buffer.isBuffer(data)) {
    console.log("Error! data is not buffer")
    return
  }
  let files = []
  // see which names we got
  for (let i = 0; i <= 2; i++) {
    if (data.readUInt8(i+4)) {
      let offset = getOffset(data, i, 0)
      files[i] = data.toString('utf8', offset, offset + 32)
    }
    else files[i] = null;
  }
  return files
}

/* we return an object whose keys are the offsets for
   _both_ charms and empty spaces. this is so that vue won't
   re-render the entire charms list each time we add or remove
   a charm from it. modifying an element in an array counts
   as modifying the array itself, and will cause v-for to
   re-render, but modifying a property of an object does not.  */
export const loadCharms = (data, slot) => {
  let equipOffset = getOffset(data, slot, EQUIPMENT_BOX_OFFSET)
  let charms = {}
  for (let i = 0; i < EQUIPMENT_BOX_SLOTS; i++) {
    let offset = equipOffset + (EQUIPMENT_BOX_SLOT_SIZE * i)
    let equipType = data.readUInt8(offset)
    if (equipType == 6) {
      // found charm, process it
      let charm = {}
      charm.offset = offset
      charm.rarity = data.readUInt8(offset + RARITY_OFFSET)
      charm.slots = data.readUInt8(offset + SLOTS_OFFSET)
      charm.type = data.readUInt16LE(offset + TYPE_OFFSET)
      
      charm.skills = [
        data.readUInt8(offset + SKILL1_OFFSET), 
        data.readUInt8(offset + SKILL2_OFFSET)
      ]
      charm.skillvalues = [
        data.readInt8(offset + SKILL1VALUE_OFFSET), 
        data.readInt8(offset + SKILL2VALUE_OFFSET)
      ]
      charm.decorations = [
        data.readUInt16LE(offset + DECORATION1_OFFSET), 
        data.readUInt16LE(offset + DECORATION2_OFFSET), 
        data.readUInt16LE(offset + DECORATION3_OFFSET)
      ]
      
      // for debugging:
      // charm.data = Buffer.alloc(36)
      // data.copy(charm.data, 0, offset)
      
      charms[offset] = charm
    }
    else if (equipType == 0) {
      // found empty space - save offset so we can add charms
      charms[offset] = null
    }
  }
  return charms
}

export const saveCharms = (data, slot, charms) => {
  let offsets = Object.keys(charms)
  for (let i = 0; i < offsets.length; i++) {
    let offset = parseInt(offsets[i])
    let charm = charms[offset]
    if (charm) {
      console.log(charm)
      data.writeUInt8(6, offset)
      data.writeUInt8(charm.rarity, offset + RARITY_OFFSET)
      data.writeUInt8(charm.slots, offset + SLOTS_OFFSET)
      data.writeUInt16LE(charm.type, offset + TYPE_OFFSET)
      
      data.writeUInt8(charm.skills[0], offset + SKILL1_OFFSET)
      data.writeUInt8(charm.skills[1], offset + SKILL2_OFFSET)

      data.writeInt8(charm.skillvalues[0], offset + SKILL1VALUE_OFFSET)
      data.writeInt8(charm.skillvalues[1], offset + SKILL2VALUE_OFFSET)
    }
    else {
      data.fill(0, offset, offset + 35)
    }
  }
}
