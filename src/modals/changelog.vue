<template>
  <modal class="changelog modal" @close="close">    
    <h3 slot="header">Changelog</h3>
    <div slot="body" class="body">
      <h3>1.0.2</h3>
      <ul>
        <li>Added basic in-use handling – now checks for talismans used in equipment sets, and does not permit them to be deleted</li>
        <li>Added changelog</li>
      </ul>
      <h3>1.0.1</h3>
      <ul>
        <li>Fixed bug with downloading saved changes</li>
        <li>Added secret decoration settings</li>
      </ul>
      <h1>1.0.0</h1>
      <ul>
        <li>Rewrite and re-release at <a href="http://sand-bird.github.io/talismans">sand-bird.github.io/talismans</a></li>
        <li>Fixed bug with changing save files</li>
        <li>Added talisman import and export</li>
        <li>Added settings menu</li>
        <li>Added option to sort and display skills alphabetically</li>
        <li>Added various links and documentation, including About and FAQ pages and <a href="http://github.com/sand-bird/talismans">download instructions</a></li></li>
      </ul>
    </div>
    <div slot="footer">
      <button class="button" @click="close">OK</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

export default {
  name: 'changelog',
  methods: {
    close () { this.$emit('close') },
    open (modal) { this.$emit('open', modal) }
  },
  components: { modal }
}
</script>

<style>
.changelog .modal-container {
  width: 550px;
}

.changelog .modal-body {
  max-height: calc(60vh - 125px);
}

.changelog.modal li {
  margin: 0.15em 10px;
}

.changelog.modal h1 {
  text-align: left;
  margin: 1em 0 0;
  font-size: 1.3rem;
  font-weight: bold;
}

.changelog.modal h2 {
  text-align: left;
  margin: 1.15em 0 0;
  font-size: 1.15rem;
  font-weight: bold;
}

.changelog.modal .body h3 {
  text-align: left;
  margin: 1.3em 0 0;
  font-size: 1rem;
  font-weight: bold;
}

.changelog.modal .body > *:first-child {
  margin-top: 0.25rem;
}

.changelog.modal .body > *:last-child {
  margin-bottom: 0.75rem;
}
</style>
