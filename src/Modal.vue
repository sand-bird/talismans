// shamelessly ripped from vue's modal example

<template>
  <transition name="modal">
    <div class="modal-mask" @click="close">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>

          <div class="modal-header">
            <slot name="header"></slot>
          </div>

          <div class="modal-body">
            <slot name="body"></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'modal',
  props: [],
  data () {
    return { 
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .3);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 400px;
  margin: 0px auto;
  padding: 20px 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0.25em;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
  padding: 0 10px;
  max-height: calc(80vh - 125px);
  overflow-y: auto;
}

.modal-body > div > *:first-child:not(input) {
  padding-top: 0;
  margin-top: 0.5em;
}

.modal-body > div > p:last-child {
  padding-bottom: 0;
  margin-bottom: 0.75em;
}

/*
.modal-body div > *:last-child:not(input) {
  padding-bottom: 0;
  margin-bottom: 0.5em;
}
*/

.modal-default-button {
  float: right;
}

.modal a:hover {
  cursor: pointer;
}

.modal p {
  text-align: left;
  margin: 1.15em 0;
}

.modal ul {
  margin: 0.5em;
  list-style-type: disc;
}

.modal ol {
  margin: 0.5em;
  padding: 0;
  list-style-type: decimal;
}

.modal li {
  display: list-item;
  text-align: left;
  padding-left: 0.25em;
  margin: 0.35em 10px;
}

.modal p, .modal li {
  line-height: 1.25em;
}

.modal-body::-webkit-scrollbar {
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-track
{
	border-radius: 4px;
	background-color: #eee;
}

.modal-body::-webkit-scrollbar
{
	width: 12px;
	background-color: #F5F5F5;
}

.modal-body::-webkit-scrollbar-thumb
{
	border-radius: 4px;
	background-color: #ccc;
}

.modal h4 {
  text-align: left;
  font-size: 1.05em;
  padding-top: 0.5em;
}

code {
  font-family:monospace;
  font-size:1.1em;
  padding:0 0.2em;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
