<template>
  <modal class="contact modal" @close="close">
    <h3 slot="header">Contact</h3>
    <div slot="body">
      <p>Please free to <a href="mailto:sandbird@tuta.io">email me</a> about requests, issues, questions, comments, job offers, or anything else at all.</p>
      <p>You can also post in the <a href="https://gbatemp.net/threads/release-online-mhgen-talisman-editor.457791/">gbatemp thread</a> if you prefer, or for feature requests and bug reports, raise an issue on the <a href="https://github.com/sand-bird/talismans/issues">github repository</a>.</p> 
      <p>Thanks for taking the time to contact me! I really appreciate your feedback, and I'll do my best to respond quickly.</p>
    </div>
    <div slot="footer">
      <button class="button" @click="close">OK</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

export default {
  name: 'contact',
  methods: {
    close () { this.$emit('close') }
  },
  components: { modal }
}
</script>

<style>
.contact .modal-container {
  width: 480px;
}
</style>
