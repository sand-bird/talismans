<template>
  <modal class="delete modal" @close="close">
    <h3 slot="header">Decoration Warning</h3>
    <div slot="body">This action will delete one or more talismans with decorations. Decorations will be lost.</div>
    <div slot="footer">
      <button class="button" @click="close('confirm')">OK</button>
      <button class="button" @click="close">Cancel</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

export default {
  name: 'delete',
  methods: {
    close (...args) { this.$emit('close', ...args) }
  },
  components: { modal }
}
</script>
