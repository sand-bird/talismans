<template>
  <modal class="about modal" @close="close">
    <h3 slot="header">About</h3>
    <div slot="body">
      <p>
        <b>☆'s MHGen Talisman Editor</b>
        <span style="font-size:0.9em;">
          (v. <a @click="open('changelog')">{{require('../../package.json').version}}</a>)
        </span>
        is a talisman editor for Monster Hunter Generations.
      </p>
      <p>Features:
      <ul>
        <li>Comprehensive legality checking</li>
        <li>Save slot selection</li>
        <li>Obsessively robust decoration handling</li>
        <li>Sort talismans by rarity, slots, or skills</li>
        <li>List skills alphabetically or by ID</li>
        <li>Import and export talismans</li>
        <li>Add, delete, and clear talismans</li>
        <li>Copy talismans – select a talisman with the paperclip icon, then click “Add Talisman” to make a copy</li>
        <li>Demo mode: try it out without a save file!</li>
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
  margin: 0.15em 10px;
}

small, small a {
  line-height: 1.25rem;
  vertical-align: top;
}
</style>
