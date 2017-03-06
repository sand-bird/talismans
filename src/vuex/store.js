import Vue from 'vue'
import Vuex from 'vuex'
import { saveCharms } from '../utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    file: null,
    charms: {},
    charmOffsets: [null, null, null],
    emptyOffsets: [null, null, null],
    active: null,
    loaded: false
  },
  getters: {
    charmOffsets: (state) => {
      return state.charmOffsets[state.active]
    },
    emptyOffsets: (state) => {
      return state.emptyOffsets[state.active]
    }
  },
  mutations: {
    LOAD_FILE (state, file) {
      state.file = file
    },
    
    LOAD_CHARMS (state, charms) {
      state.charms = charms
      console.log("state.loadedCharms: true")
      state.loaded = true
    },
    
    LOAD_OFFSETS (state, offsets) {
      for (let slot = 0; slot < 3; slot++) {
        if (offsets[slot]) {
          state.charmOffsets[slot] = offsets[slot].charmOffsets
          state.emptyOffsets[slot] = offsets[slot].emptyOffsets
        }
      }
    },
    
    SET_ACTIVE (state, a) {
      state.active = a
    },
    
    EDIT_CHARM (state, data) {
      let charm = state.charms[data.offset]
      charm[data.key] = data.value
    },
    
    // accepts an array of offsets or a single offset
    DELETE_CHARMS (state, off) {
      if (Array.isArray(off))
        for (let i = 0; i < off.length; i++) {
          state.charms[off[i]] = null
          
        }
      else state.charms[off] = null
    },
    
    ADD_CHARM (state, data) {
      state.charms[data.offset] = data.charm
      state.charmOffsets[state.active].splice(
        state.charmOffsets[state.active].length,
        null, data.offset
      )
    },
    
    SAVE_CHARMS (state) {
      saveCharms(state.file, state.charms)
    }
  },
  actions: {
    
    init ({ commit, state }, data) {
      commit('LOAD_CHARMS', data.charms)
      commit('LOAD_OFFSETS', data.offsets)
      commit('SET_ACTIVE', data.active)
    },
    
    loadFile ({ commit, state }, file) {
    setTimeout(() => {
        commit('LOAD_FILE', file)
      }, 0)
    },
    
    edit ({commit, state}, data) {
      setTimeout(() => {
        commit('EDIT_CHARM', data)
      }, 0)
    },
    
    remove ({commit, state}, data) {
      setTimeout(() => {
        commit('DELETE_CHARMS', data)
      }, 0)
    },
    
    // needs to be synchronous because the render
    // relies on the add to be finished
    add ({commit, state}, data) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('ADD_CHARM', data)
          resolve()
        }, 0)
      })
    },
    
    save ({ commit, state }, data) {
      commit('SAVE_CHARMS')
    }
  }
})
