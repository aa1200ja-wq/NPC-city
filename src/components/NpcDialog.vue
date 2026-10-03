<script setup>
import {computed,ref,watch} from 'vue'
import {modelReply,ruleReply} from '../game/ai'
import {NPCS,selectedNpcId,state,talkToNpc} from '../game/store'
const input=ref(''),lines=ref([]),busy=ref(false)
const npc=computed(()=>NPCS.find(n=>n.id===selectedNpcId.value))
const runtime=computed(()=>npc.value?state.npcState[npc.value.id]:null)
watch(()=>selectedNpcId.value,id=>{if(!id)return;const n=NPCS.find(x=>x.id===id);lines.value=[{who:n.name,text:n.quote}];input.value=''})
async function send(){
 const text=input.value.trim();if(!text||busy.value||!npc.value)return
 lines.value.push({who:'你',text});input.value='';talkToNpc(npc.value.id,text);busy.value=true
 try{const reply=state.aiMode==='local'?await modelReply(npc.value,runtime.value,text):ruleReply(npc.value,runtime.value,text);lines.value.push({who:npc.value.name,text:reply})}
 catch{lines.value.push({who:npc.value.name,text:ruleReply(npc.value,runtime.value,text)})}
 finally{busy.value=false}
}
</script>
<template>
<div v-if="npc" class="dialog-backdrop" @click.self="selectedNpcId.value=null">
  <section class="npc-dialog">
    <header><div class="mini-portrait" :style="{'--npc':npc.color}"><span></span></div><div><small>{{ npc.rarity }}｜AFFINITY {{ runtime.affinity }}</small><h3>{{ npc.name }}</h3><p>{{ runtime.status }}｜{{ runtime.mood }}</p></div><button @click="selectedNpcId.value=null">×</button></header>
    <div class="dialog-lines"><p v-for="(line,i) in lines" :key="i" :class="{me:line.who==='你'}"><b>{{ line.who }}</b><span>{{ line.text }}</span></p><p v-if="busy"><b>{{ npc.name }}</b><span>……</span></p></div>
    <form @submit.prevent="send"><input v-model="input" maxlength="80" placeholder="跟他說點什麼…"><button class="primary">送出</button></form>
    <small class="ai-badge">{{ state.aiMode==='local'?'LOCAL AI':'RULE BRAIN' }}</small>
  </section>
</div>
</template>
