<script setup>
import {onMounted,onUnmounted,ref} from 'vue'
import CollectionPanel from './components/CollectionPanel.vue'
import GameWorld from './components/GameWorld.vue'
import GachaPanel from './components/GachaPanel.vue'
import NpcDialog from './components/NpcDialog.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import TaskPanel from './components/TaskPanel.vue'
import {state,tickWorld,toast} from './game/store'
const page=ref('world')
const nav=[{id:'world',label:'城市',code:'MAP'},{id:'gacha',label:'抽卡',code:'GAC'},{id:'collection',label:'收藏',code:'COL'},{id:'tasks',label:'任務',code:'DAY'},{id:'settings',label:'設定',code:'SYS'}]
let timer
onMounted(()=>{timer=setInterval(tickWorld,4200)})
onUnmounted(()=>clearInterval(timer))
</script>
<template>
<div class="app-shell">
  <header class="topbar">
    <button class="brand" @click="page='world'"><span class="brand-mark">NC</span><span><b>NPC CITY</b><small>PIXEL LIFE SIM</small></span></button>
    <div class="resources"><span><small>LV</small><b>{{ state.level }}</b></span><span><small>COIN</small><b>{{ state.coins }}</b></span><span><small>TICKET</small><b>{{ state.tickets }}</b></span><span><small>KEY</small><b>{{ state.keys }}</b></span></div>
  </header>
  <div class="app-body">
    <aside class="sidebar"><button v-for="item in nav" :key="item.id" :class="{active:page===item.id}" @click="page=item.id"><span>{{ item.code }}</span><b>{{ item.label }}</b></button></aside>
    <main><GameWorld v-if="page==='world'"/><GachaPanel v-else-if="page==='gacha'"/><CollectionPanel v-else-if="page==='collection'"/><TaskPanel v-else-if="page==='tasks'"/><SettingsPanel v-else/></main>
  </div>
  <nav class="mobile-nav"><button v-for="item in nav" :key="item.id" :class="{active:page===item.id}" @click="page=item.id"><span>{{ item.code }}</span><b>{{ item.label }}</b></button></nav>
  <NpcDialog/>
  <transition name="toast"><div v-if="toast.visible" class="toast" :class="toast.type">{{ toast.text }}</div></transition>
</div>
</template>
