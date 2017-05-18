<template>
  <modal class="about modal" @close="close">    
    <h3 slot="header">About</h3>
    <div slot="body">
      <p><b>☆'s MHGen Talisman Editor</b> is a talisman editor for Monster Hunter Generations.</p>
      <p>Features:
      <ul>
        <li>Comprehensive legality checking</li>
        <li>Save slot selection</li>
        <li>Decoration handling</li>
        <li>Sort talismans by rarity, slots, or skills</li>
        <li>List skills alphabetically or by <span style="font-size:0.9em;">ID</span></li>
        <li>Import and export talismans</li>  
        <li>Add, delete, and clear talismans</li>      
        <li>Copy talismans – select a talisman with the paperclip icon, then click “Add Talisman” to make a copy</li>
      </ul>
      </p>
      <p>Please <a @click="open('contact')">contact me</a> if you find any issues, and enjoy!</p>
    </div>
    <div slot="footer">
      <button class="button" @click="close">OK</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

export default {
  name: 'about',
  methods: {
    close () { this.$emit('close') },
    open (modal) { this.$emit('open', modal) }
  },
  components: { modal }
}
</script>

<style>
.about .modal-container {
  width: 540px;
}

.about.modal li {
  margin: 0.1em 10px;
}
</style>
