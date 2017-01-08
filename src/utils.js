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

export const loadCharms = (data, slot) => {
  let equipOffset = getOffset(data, slot, EQUIPMENT_BOX_OFFSET)
  let charms = []
  for (let i = 0; i < EQUIPMENT_BOX_SLOTS; i++) {
    let offset = equipOffset + (EQUIPMENT_BOX_SLOT_SIZE * i)
    if (data.readUInt8(offset) == 6) {
      let charm = {}
      charm.offset = offset
      charm.rarity = data.readUInt8(offset + 1)
      charm.slots = data.readUInt8(offset + 16)
      charm.skills = [data.readUInt8(offset + 12), data.readUInt8(offset + 13)]
      charm.skillvalues = [data.readInt8(offset + 14), data.readInt8(offset + 15)]
      
      // for debugging:
      // charm.data = Buffer.alloc(36)
      // data.copy(charm.data, 0, offset)
      
      charms.push(charm)
    }
  }
  return charms
}
