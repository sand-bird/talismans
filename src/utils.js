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
  let names = []
  // see which names we got
  for (let i = 0; i <= 2; i++) {
    if (data.readUInt8(i+4)) {
      let offset = getOffset(data, i, 0)
      names[i] = data.toString('utf8', offset, offset + 32)
    }
    else names[i] = null;
  }
  return names
}

export const loadCharms = (data, slot) => {
  let equipOffset = getOffset(data, slot, EQUIPMENT_BOX_OFFSET)
  let charms = []
  for (let i = 0; i < EQUIPMENT_BOX_SIZE; i++) {
    let offset = equipOffset + EQUIPMENT_BOX_SLOT_SIZE * i
    if (data.readUInt8(offset) == 6) {
      let charm = {}
      charm.offset = offset
      charm.data = Buffer.alloc(EQUIPMENT_BOX_SLOT_SIZE)
      data.copy(charm.data, 0, offset, offset + EQUIPMENT_BOX_SLOT_SIZE)
      charms.push(charm)
    }
  }
  return charms
}

export const unpackCharm = (charm) => {
  charm.rarity = charm.data.readUInt8(1)
  charm.slots = charm.data.readUInt8(16)
  charm.skills = [charm.data.readUInt8(12), charm.data.readUInt8(13)]
  charm.skillvalues = [charm.data.readInt8(14), charm.data.readInt8(15)]
  return charm
}

export const processCharm = (charm) => {
  let processedCharm = {}
  processedCharm.rarity = charm.data.readUInt8(1)
  processedCharm.slots = charm.data.readUInt8(16)
  processedCharm.skills = [charm.data.readUInt8(12), charm.data.readUInt8(13)]
  processedCharm.skillvalues = [charm.data.readInt8(14), charm.data.readInt8(15)]
  processedCharm.offset = charm.offset
  processedCharm.data = charm.data
  return processedCharm
}


export const test = (input) => { alert(input) }
