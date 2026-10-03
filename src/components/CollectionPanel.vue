<script setup>
import {computed,ref} from 'vue'
import {CGS,CLOTHES,EVENTS,NPCS,SCENES,state,triggerEvent} from '../game/store'
const tab=ref('npc')
const tabs=[{id:'npc',label:'角色'},{id:'cg',label:'CG'},{id:'scene',label:'場景'},{id:'clothes',label:'服裝'},{id:'event',label:'事件'}]
const ownedCount=computed(()=>state.ownedNpcs.length)
</script>
<template>
<section class="panel-page">
  <header class="page-head"><div><small>COLLECTION</small><h2>收藏館</h2></div><div class="ticket-count">{{ ownedCount }}/{{ NPCS.length }} 住戶</div></header>
  <div class="collection-tabs"><button v-for="t in tabs" :key="t.id" :class="{active:tab===t.id}" @click="tab=t.id">{{ t.label }}</button></div>
  <div v-if="tab==='npc'" class="collection-grid">
    <article v-for="npc in NPCS" :key="npc.id" class="collect-card" :class="{locked:!state.ownedNpcs.includes(npc.id)}">
      <div class="portrait" :style="{'--npc':npc.color}"><span></span></div><small>{{ npc.rarity }}｜{{ npc.id.toUpperCase() }}</small>
      <h3>{{ state.ownedNpcs.includes(npc.id)?npc.name:'???' }}</h3><p>{{ state.ownedNpcs.includes(npc.id)?npc.personality:'尚未抽到此角色' }}</p>
    </article>
  </div>
  <div v-else-if="tab==='cg'" class="cg-grid">
    <article v-for="cg in CGS" :key="cg.id" class="cg-card" :class="{locked:!state.unlockedCgs.includes(cg.id)}">
      <div class="cg-preview"><span>{{ state.unlockedCgs.includes(cg.id)?'CG':'?' }}</span></div><b>{{ state.unlockedCgs.includes(cg.id)?cg.name:'未解鎖回憶' }}</b><small>{{ cg.hint }}</small>
    </article>
  </div>
  <div v-else-if="tab==='scene'" class="collection-grid">
    <article v-for="s in SCENES.filter(x=>x.card)" :key="s.id" class="collect-card" :class="{locked:!state.ownedScenes.includes(s.card)}"><div class="big-symbol">{{ s.icon }}</div><h3>{{ s.name }}</h3><p>{{ state.ownedScenes.includes(s.card)?'場景卡已取得，可依城市等級開放。':'尚未取得場景卡' }}</p></article>
  </div>
  <div v-else-if="tab==='clothes'" class="collection-grid">
    <article v-for="c in CLOTHES" :key="c.id" class="collect-card" :class="{locked:!state.ownedClothes.includes(c.id)}"><div class="big-symbol">FIT</div><small>{{ c.rarity }}</small><h3>{{ c.name }}</h3><p>{{ state.ownedClothes.includes(c.id)?'已加入換裝庫':'尚未取得' }}</p></article>
  </div>
  <div v-else class="collection-grid">
    <article v-for="e in EVENTS" :key="e.id" class="collect-card" :class="{locked:!state.ownedEvents.includes(e.id)}"><div class="big-symbol">EVT</div><small>{{ e.rarity }}</small><h3>{{ e.name }}</h3><p>{{ e.text }}</p><button v-if="state.ownedEvents.includes(e.id)" class="primary" @click="triggerEvent(e.id)">觸發事件</button></article>
  </div>
</section>
</template>
