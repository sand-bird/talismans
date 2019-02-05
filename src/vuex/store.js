import Vue from 'vue'
import Vuex from 'vuex'
import { saveCharms } from '../utils'

Vue.use(Vuex)

const addTo = (arr, val) => {
  arr.splice(arr.length, 0, val)
}
const removeFrom = (arr, val) => {
  arr.splice(arr.indexOf(val), 1)
}
var hasChanged = false
const setChangeWarning = () => {
  if (!hasChanged) {
    window.onbeforeunload = function () { return true }
    hasChanged = true
  }
}

export default new Vuex.Store({
  state: {
    // array[3] of strings representing player names.
    // a null value means the save slot is empty.
    saves: [],

    // raw file data (UIntArray8)
    file: null,

    // after data is loaded, will contain a key for every valid offset,
    // with either a charm object or a null value. the null keys are
    // necessary for vuex to watch & update properties on any charm that
    // might exist in that offset later on.
    charms: {},

    // denormalized keys for occupied and unoccupied offsets. used to
    // display and sort charms more efficiently. these days, there's
    // probably a vue equivalent of reselect that could do it better
    charmOffsets: {},
    emptyOffsets: {},

    // if you try to access an equipment set that contains a nonexistent
    // charm, it crashes the game, so we need to prevent the user from
    // deleting any charm that's being used in a set. key is the equip
    // set's offset, and value is an object containing its name and id.
    equipSets: {},
    active: null,
    loaded: false
  },
  getters: {
    charmOffsets: (state) => {
      return state.charmOffsets[state.active]
    },
    emptyOffsets: (state) => {
      return state.emptyOffsets[state.active]
    },
    equipSets: (state) => {
      return state.equipSets[state.active]
    }
  },
  mutations: {
    LOAD_FILE (state, file) {
      state.file = file
    },

    LOAD_SAVES (state, saves) {
      state.saves = saves
    },

    LOAD_CHARMS (state, charms) {
      state.charms = charms
      console.log('state.loadedCharms: true')
      state.loaded = true
    },

    LOAD_OFFSETS (state, offsets) {
      state.charmOffsets = offsets.charmOffsets
      state.emptyOffsets = offsets.emptyOffsets
    },

    LOAD_EQUIPSETS (state, equipSets) {
      state.equipSets = equipSets
    },

    SET_ACTIVE (state, a) {
      state.active = a
    },

    EDIT_CHARM (state, data) {
      let charm = state.charms[data.offset]
      if (charm) charm[data.key] = data.value
    },

    // accepts an array of offsets or a single offset
    DELETE_CHARMS (state, off) {
      if (!Array.isArray(off)) off = [off]
      for (let i = 0; i < off.length; i++) {
        state.charms[off[i]] = null
        removeFrom(state.charmOffsets[state.active], off[i])
        addTo(state.emptyOffsets[state.active], off[i])
      }
    },

    // accepts an array of {offset, charm} objects or a single one
    ADD_CHARMS (state, charms) {
      if (!Array.isArray(charms)) charms = [charms]
      for (let i = 0; i < charms.length; i++) {
        let offset = state.emptyOffsets[state.active].pop()
        state.charms[offset] = charms[i]
        addTo(state.charmOffsets[state.active], offset)
      }
    },

    SAVE_CHARMS (state) {
      saveCharms(state.file, state.charms)
    },

    // used in sorting
    UPDATE_CHARMOFFSETS (state, charmOffsets) {
      state.charmOffsets[state.active] = charmOffsets
    }
  },

  actions: {
    init ({ commit }, data) {
      commit('LOAD_CHARMS', data.charms)
      commit('LOAD_OFFSETS', data.offsets)
      commit('LOAD_EQUIPSETS', data.equipSets)
      commit('SET_ACTIVE', data.active)
      commit('LOAD_SAVES', data.saves)
      setTimeout(() => {
        commit('LOAD_FILE', data.file)
      }, 0)
    },

    edit ({ commit }, data) {
      setChangeWarning()
      setTimeout(() => {
        commit('EDIT_CHARM', data)
      }, 0)
    },

    remove ({ commit }, data) {
      setChangeWarning()
      setTimeout(() => {
        commit('DELETE_CHARMS', data)
      }, 0)
    },

    // needs to be synchronous because the
    // render relies on the add to be finished
    add ({ commit }, data) {
      setChangeWarning()
      commit('ADD_CHARMS', data)
    },

    save ({ commit }) {
      commit('SAVE_CHARMS')
    },

    setActive ({ commit }, data) {
      setTimeout(() => {
        commit('SET_ACTIVE', data)
      }, 0)
    }
  }
})
