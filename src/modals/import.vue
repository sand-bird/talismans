<template>
  <modal class="import modal" @close="close">    
    <h3 slot="header">Import Talismans</h3>
    <div slot="body">
      <div class="import-description">
        Choose a file to import, or paste text below.
      </div>
      <div class="import-file" >
        <input type="file" class="import-upload upload" v-on:change='checkImportFile' />
      </div>
      <transition name="textbox-transition">
        <textarea class="import-textbox" v-model="importText" @keyup="setError(null)" />
      </transition>
      
      <transition name="import-transition">
        <div class="import-error" 
           v-if="error">
          <span v-html="error" />
        </div>
      </transition>
    </div>
    <div slot="footer">
      <button class="button" @click="submit(false)">Insert</button>
      <button class="button warning" @click="submit(true)">Overwrite</button>
      <button class="button" @click="close">Cancel</button>
    </div>
  </modal>
</template>

<script>
import { processDecorations, filterCharmData, getType } from '../utils'
import modal from '../Modal.vue'

export default {
  name: 'import',
  props: ['props'],
  data () {
    return {
      importText: null,
      error: null
    }
  },
  methods: {
    close (...args) { this.$emit('close', ...args) },
    
    checkImportFile (event) {
      let file = event.target.files[0]
      if (file.type != "text/plain") {
        this.setError("<b>Error: Wrong filetype!</b> " +
                      "Please import plaintext files only.")
        event.target.value = null
        return
      }
      if (file.size > 1000000) { // way more than anyone will ever need
        this.setError("<b>Error: File too large!</b> " +
                      "Please do not import files over 1 GB.")
        event.target.value = null
        return
      }
      this.setError(null)

      let reader = new FileReader()
      
      reader.onload = function (e) {
        this.importText = e.target.result
        console.log(file)
      }.bind(this)
      
      reader.readAsText(file)
    },
    
    submit (ow) {
      let importArr
      try {
        importArr = JSON.parse(this.importText)
      }
      catch (e) {
        console.log(e)
        this.setError (
          "<b>Error: Invalid syntax!</b> Please make sure all brackets, " +
          "commas, and quotes are in the right place, then try again."
        )
        return
      }
      // in case we only have one charm
      if (!Array.isArray(importArr)) importArr = [importArr] 
      
      if (!ow && importArr.length > this.props.emptyCount) {
        this.setError (
          "<b>Error: Not enough space!</b> You are importing " +
          importArr.length + 
          " talismans, <br/>but have " + 
          this.props.emptyCount + " equipment box slot" + 
          (this.props.emptyCount == 1 ? "" : "s") + 
          " available. Please " + 
          (this.props.emptyCount > 0 ? "import fewer talismans or " : "") 
          + "delete some talismans, then try again."
        )
        return
      }
      
      let importCharms = filterCharmData(importArr, this.props.deco)
      console.log(importCharms)
      for (let i = 0; i < importArr.length; i++) {        
        processDecorations(importCharms[i])
        // no reason to export/import type if we can just get it from rarity
        importCharms[i].type = getType(importCharms[i].rarity)
      }
      this.close('confirm', ow, importCharms)
    },
    
    setError(err) {
      this.error = err
    }
  },
  components: { modal }
}
</script>

<style>
.import .modal-container {
  width: 520px;
}

.import .modal-body {
  overflow: hidden;
}

.import .upload, .import-text {
  margin-top: 1px;
  margin-bottom: 1px;
  height: 21px;
}

.import-file {
  padding: 12px 20px;
  width: 100%;
  //border: 1px solid #eee;
  box-shadow: 0 0 1px 1px #eee;
  display: inline-block;
  margin: 1em auto;
  border-radius: 10px;
}

.import-upload {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.import-textbox {
  width: 100%;
  height: calc((1.2em * 18) + 4px);
  line-height: 1.2em;
  font-size: 1rem;
  border: 0;
  box-shadow: 0 0 5px #ccc;
  transition: height 0.5s ease;
  margin: 0;
  resize: none;
}

.textbox-transition-enter {
  height: 21px;
}

.import-error {
  box-shadow: 0 0 1px 1px #ddd;
  //border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0.65em !important;
  margin: 15px 0 5px 0 !important;
  height: auto;
  cursor: default;
  color: #b95858;
  width: 100%;
  max-height: 100px;
}

.import-transition-enter, .import-transition-leave-to {
  max-height: 1px;
  margin: 0 !important;
  padding: 0 0.5em !important;
  opacity: 0;
}

.import-transition-enter-active { 
  transition: max-height 0.6s, margin 0.3s, padding 0.3s, opacity 0.6s ;
  transition-delay: 0s;
}

.import-transition-leave-active {
  transition: max-height 0.4s, margin 0.4s, padding 0.6s, opacity 0.4s ;
  transition-delay: 0s;
}
</style>
