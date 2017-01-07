<template>
  <div id="app">
    <h1>{{ title }}</h1>
    <input id="upload" type="file" v-on:change='init' v-show="!file" />
    <div id="save-button" v-on:click='download' v-show="file">Download Save</div>
    <ul id="files">
      <li v-for="(name, index) in names" v-on:click="setActive(index)"
          :class="[{ active: active == index}, 
                   { disabled : !name }]"
      >
        <span>File {{ index + 1 }}:</span>
        <h3 :class="'name'">{{ name || "(none)" }}</h3>
      </li>
    </ul>
    
    <charms :charms="charms" />
  </div>
</template>

<script>
import { getNames, getCharms } from './utils'
import charms from './Charms.vue'

export default {
  name: 'app',
  data () {
    return {
      title: '☆\'s Talisman Editor',
      file: null,
      names: [],
      active: null,
      charms: []
    }
  },
  components: {
    charms
  },
  methods: {
  
    init (event) {
    
      if (event.target.files[0].size != 4000815) {
        alert("Wrong file size!")
        event.target.value = null
        return
      }
      
      let file = event.target.files[0]

      let reader = new FileReader()
      let vm = this
      
      reader.onload = (e) => {
        vm.file = Buffer.from(e.target.result)
        vm.names = getNames(vm.file)
        // finds first occupied file and inits it to active
        let a = vm.names.findIndex((n) => { return n != null })
        console.log(a)
        vm.active = a
        vm.charms = getCharms(vm.file, a)
      }
      
      reader.readAsArrayBuffer(file)
    },
    
    setActive (index) {
    
      if (this.names[index]) {
        this.active = index
        this.charms = getCharms(this.file, index)
      }
    },
    
    download (event) {
      alert("download")
    }
  }
}
</script>

<style>
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

#files {
  display: block;
  border-radius: 20px;
  border: 1px solid #999;
  overflow: hidden;
  width: 450px;
  margin: 20px auto;
  box-shadow: inset 1px 1px #fff, inset -1px -1px #ddd;
}

#files li {
  background-color: #eee;
  width: 149px;
  margin: 0;
  border-right: 1px solid #999;
  float: left;
  padding: 10px 5px;
}

#files li:last-child {
  border-right: none;
  width: 150px;
}

#upload {
  box-shadow: 0 0 5px #ccc
}

#files li.active {
  background-color: #fcfcfc;
  box-shadow: inset 1px 1px #ddd, inset -1px -1px #fff;
}

.name {
  font-size: 20px;
  font-weight: bold;
  line-height: 30px;
  margin: 5px 0 0;
}

.disabled .name {
  font-weight: normal;
  opacity: 0.5;
  font-size:14px;
}


#save-button {
 display: inline-block;
 border:1px solid #bfbfbf;
 color: #8c8c8c;
 border-radius: 5px 5px 5px 5px;
 -webkit-border-radius: 5px 5px 5px 5px;
 -moz-border-radius: 5px 5px 5px 5px;
 font-family: Verdana;
 width: auto;
 height: auto;
 font-size: 16px;
 padding: 10px 40px;
 box-shadow: inset 0 1px 0 0 #fff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2,0 2px 4px 0 #f2f2f2;
 -moz-box-shadow: inset 0 1px 0 0 #fff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2,0 2px 4px 0 #f2f2f2;
 -webkit-box-shadow: inset 0 1px 0 0 #fff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2,0 2px 4px 0 #f2f2f2;
 text-shadow: 0 1px 0 #fff;
 background-image: linear-gradient(to top, #f2f2f2, #f2f2f2);
 background-color: #f2f2f2;
 cursor: pointer;
}
#save-button:hover, #save-button:active{
 border:1px solid #8c8c8c;
 color: #8c8c8c;
 box-shadow: inset 0 1px 0 0 #ffffff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2;
 -moz-box-shadow: inset 0 1px 0 0 #ffffff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2;
 -webkit-box-shadow: inset 0 1px 0 0 #ffffff,inset 0 -1px 0 0 #d9d9d9,inset 0 0 0 1px #f2f2f2;
 background-color: #f2f2f2;
}

</style>
