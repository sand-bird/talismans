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
        <textarea class="import-textbox" v-model="importText" />
      </transition>
    </div>
    <div slot="footer">
      <button class="button" @click="close('confirm', false, importText)">Insert</button>
      <button class="button" @click="close('confirm', true, importText)">Overwrite</button>
      <button class="button" @click="close">Cancel</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

export default {
  name: 'import',
  //props: ['toDelete'],
  data () {
    return {
      importText: null
    }
  },
  methods: {
    close (...args) { this.$emit('close', ...args) },
    
    checkImportFile (event) {
      let file = event.target.files[0]
      if (file.type != "text/plain") {
        alert("Error! Wrong filetype for import file!")
        event.target.value = null
        return
      }
      if (file.size > 500000) { // 500kb, should be plenty
        console.log("Error! File size too big! (Max 500kb)")
        event.target.value = null
        return
      }

      let reader = new FileReader()
      
      reader.onload = function (e) {
        this.importText = e.target.result
        console.log(file)
      }.bind(this)
      
      reader.readAsText(file)
    }
  },
  components: { modal }
}
</script>

<style>
.import .modal-container {
  width: 560px;
}

.import .upload, .import-text {
  margin-top: 1px;
  margin-bottom: 1px;
  height: 21px;
}

.import-file {
  padding: 12px 20px;
  width: 100%;
  border: 1px solid #eee;
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
  height: 30vh;
  border: 0;
  box-shadow: 0 0 5px #ccc;
  transition: height 0.5s ease;
  margin: 0;
}

.textbox-transition-enter {
  height: 21px;
}
</style>
