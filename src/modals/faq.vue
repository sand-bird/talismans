<template>
  <modal class="faq modal" @close="close">    
    <h3 slot="header">FAQ</h3>
    <div slot="body">    
      <h4>How do I use this?</h4>
      <ol>
        <li>Using a homebrew save editor like <a href="https://gbatemp.net/threads/release-jks-savemanager-homebrew-cia-save-manager.413143/">JKSM</a>, dump your Monster Hunter Generations <b>extdata</b> to your 3DS's SD card.</li>
        <li>Power off your 3DS, remove the SD card, and connect it to your computer.</li>
        <li>Click <b>Choose File</b>, and locate your extdata file. Usually this is called <span class="inline-mono">system</span> with no extension.</li>
        <li>Edit your talismans and click <b>Save Changes</b> to download a new <span class="inline-mono">system</span> file.</li>
        <li><b>Move or rename the original extdata file on your SD card.</b> Take good care of it! As long as you have this backup, you can always restore your save if something goes wrong. <i>I am not liable if you forget to back up your save.</i></li>
        <li>Copy or move the downloaded <code>system</code> file into the <b>extdata</b> location on the SD card, and make sure it has the correct filename.</li>
        <li>Unmount the SD card from your computer and insert it back into your 3DS.</li>
        <li>Use your homebrew save editor to import the edited <b>extdata</b> file to Monster Hunter Generations.</li>
      </ol>
      <h4>Can I use it offline?</h4>
      <p>Yes! Instructions for downloading and running the app locally are available on the <a href="http://github.com/sand-bird/talismans">github page</a>. You will need to have <a href="https://nodejs.org/en/">node.js</a> and <a href="http://blog.npmjs.org/post/85484771375/how-to-install-npm">npm</a> installed first.</p>
      <h4>What's an extdata file?</h4>
      <p>An extdata file is a save file from the 3DS's SD card (as opposed to the game cartridge), decrypted by a 3DS homebrew save editor such as <a href="https://gbatemp.net/threads/release-jks-savemanager-homebrew-cia-save-manager.413143/">JKSM</a>.</p> 
      <p>For more information on how to generate an extdata file, the <a href="https://smealum.github.io/3ds/" >official homebrew channel site</a> and the communities on <a href="https://www.reddit.com/r/3dshacks/wiki/index" >reddit</a> and <a href="https://gbatemp.net/forums/3ds-homebrew-development-and-emulators.275/">gbatemp</a> are good places to start learning about 3DS homebrew.</p>
      <h4>Does this overwrite my save?</h4>
      <p>No. Clicking "Save Changes" will download a fresh copy of your save file with the changes you have made. You will need to manually place this downloaded save file in the correct place on your SD card in order to load the modified data into Monster Hunter Generations.</p>
      <h4>Which games does this support?</h4>
      <p>Only <b>Monster Hunter Generations</b> (the NA / EU release of Monster Hunter X). I don't plan to add support for MHX or the older games, but I do plan to support the English version of Monster Hunter XX when it eventually comes out.</p>
      <h4>What's wrong with <a href="https://gbatemp.net/threads/release-mh-talisman-editor-for-mhx-mhgen-mh4g-mh4u.411182/">jc28735250's talisman editor</a>?</h4>
      <p>Nothing – in fact, since it supports MHXX, MHX, and MH4U, it's actually a lot better than mine. However, it's currently Windows-only, and tends to crash under Wine, so I decided to write a cross-platform editor.</p>
      <h4>Isn't this cheating?</h4>
      <p>Well, yes, in that it allows you to modify your save file in ways that the game's developers did not intend. However, this tool very limited – <b>it only generates <i>legal</i> talismans</b>, meaning they are always possible (however unlikely) to obtain in-game without editing. Even the best talismans in the game will not turn a bad hunter into a good one.</p>
      <h4>Why does this exist?</h4>
      <p>Because talismans in Monster Hunter Generations are randomly generated out of <i>millions</i> of possibilities, the chance of getting a desired or even a useful talisman is extremely low, even after hours of tedious farming.</p>
      <p>I and many others believe that even though Monster Hunter was designed to be this way, in practice, this situation goes against the <i>spirit</i> of the game. Any player who wants high-quality talismans, whether for speedrunning or just to expand their options for viable fashion sets, must either be very lucky or spend potentially hundreds of hours mining rocks in a game that is supposed to be about killing dragons.</p>
      <p>This tool exists to solve that dilemma, letting you spend your time in Monster Hunter actually hunting monsters.</p>
      <h4>Will people who play with me know that I hacked?</h4>
      <p>Nope – it's impossible to know for sure, since anything you can make with this tool, you also could have gotten by being <i>really, really</i> lucky.</p>
      <p>Of course, people might always choose to believe that someone is a hacker anyway, depending on just how “lucky” they are.</p>
      <h4>Why do my skills keep changing?</h4>
      <p>That's the legality checking at work. Different rarities of talisman have different skills (and different levels of those skills) available – for example, a lot of skills, like Critical Up, Evade Distance, and Handicraft, can only be found on talismans that come from a Timeworn Charm (Queen, King, and Dragon rarites). So, if you have a Queen Talisman with Handicraft and you change its rarity to Pawn, the Handicraft skill will be reset to something else.</p>
      <p>Skill compatibility information used in <b>☆'s MHGen Talisman Editor</b> was collected from <a href="https://docs.google.com/spreadsheets/d/1N7lqzdSzNl1o_W8JiYyQz_cXDXJEE_Ur4myI4Uf0F7E/">this spreadsheet</a>. You can view the actual datafile used in the app <a href="https://github.com/sand-bird/talismans/blob/master/src/skills.json">here</a>.</p>
      <h4>Where did my decorations go?</h4>
      <p>Decorations can't be copied: if you copy a talisman, or if you export your talismans and then import them back again, the decorations are reset. This was my effort to draw a line between “circumventing obnoxious RNG” and plain old “cheating” – and, while the implementation here might be a little draconian, I still stand by it in principle.</p>
      <p>But, well, hey – if you bothered to read (or scroll) through this whole thing, you're exactly the kind of person who makes this all worthwhile. So, by way of thanks, here's a little secret: open the settings menu, and type <code>cheatercheaterwimpwimp</code>. Enjoy!  
      <h4>You should add {feature}!</h4>
      <p>Sure! <a @click="open('contact')">Drop me a line.</a></p>
      <h4>I think I found a bug.</h4>
      <p>Oops, sorry about that! Please <a @click="open('contact')">contact me</a> – I'll do my best to fix it right away.</p>
    </div>
    <div slot="footer">
      <button class="button" @click="close">OK</button>
    </div>
  </modal>
</template>

<script>
import modal from '../Modal.vue'

export default {
  name: 'faq',
  methods: {
    close () { this.$emit('close') },
    open (modal) { this.$emit('open', modal) }
  },
  components: { modal }
}
</script>

<style>
.faq .modal-container {
  width: 690px;
  padding-right: 18px;
}

.faq .modal-body {
  padding-right: 20px;
  padding-left: 8px;
}
</style>
