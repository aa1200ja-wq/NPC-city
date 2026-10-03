<script setup>
import {computed,ref} from 'vue'
import PixelNpc from './PixelNpc.vue'
import {NPCS,ROOMS,SCENES,assignNpc,ownedNpcList,selectedNpcId,state,unlockRoom,unlockScene,visitScene} from '../game/store'

const selectedRoom=ref(null)
const current=computed(()=>SCENES.find(s=>s.id===state.currentScene))
const presentNpcs=computed(()=>ownedNpcList.value.filter(n=>state.npcState[n.id]?.scene===state.currentScene))
const unassigned=computed(()=>ownedNpcList.value.filter(n=>!Object.values(state.roomResidents).includes(n.id)))
const roomNpc=roomId=>NPCS.find(n=>n.id===state.roomResidents[roomId])

function roomClick(room){
  if(!state.unlockedRooms.includes(room.id))return unlockRoom(room.id)
  selectedRoom.value=room.id
}
function assign(roomId,e){
  const id=e.target.value
  if(id)assignNpc(id,roomId)
  selectedRoom.value=null
}
const roomStyle=i=>({
  '--col':i%3,
  '--row':i<3?0:1
})
</script>

<template>
<section class="world-shell">
  <div class="scene-tabs">
    <button v-for="scene in SCENES" :key="scene.id" :class="{active:state.currentScene===scene.id,locked:!state.unlockedScenes.includes(scene.id)}" @click="state.unlockedScenes.includes(scene.id)?visitScene(scene.id):unlockScene(scene.id)">
      <span>{{ scene.icon }}</span>{{ scene.name }}<small v-if="!state.unlockedScenes.includes(scene.id)">LOCK</small>
    </button>
  </div>

  <div class="pixel-world" :class="'theme-'+current.theme">
    <div class="world-title"><small>DAY {{ String(state.day).padStart(2,'0') }}</small><h2>{{ current.name }}</h2></div>

    <template v-if="state.currentScene==='apartment'">
      <div class="corridor"></div>

      <button
        v-for="(room,i) in ROOMS"
        :key="room.id"
        class="room-block"
        :class="{locked:!state.unlockedRooms.includes(room.id),player:room.id==='player'}"
        :style="roomStyle(i)"
        @click="roomClick(room)"
      >
        <span class="door"></span>
        <b>{{ room.name }}</b>
        <small v-if="!state.unlockedRooms.includes(room.id)">鑰匙 ×{{ room.cost }}｜Lv.{{ room.level }}</small>
        <small v-else-if="roomNpc(room.id)">住戶｜{{ roomNpc(room.id).name }}</small>
        <small v-else>{{ room.id==='player'?'HOME':'空房' }}</small>
      </button>

      <div class="elevator"><span>▲</span><b>電梯</b><span>▼</span></div>
    </template>

    <template v-else>
      <div class="scene-props"><div class="prop p1"></div><div class="prop p2"></div><div class="prop p3"></div><div class="prop p4"></div><div class="prop p5"></div></div>
    </template>

    <PixelNpc
      v-for="npc in presentNpcs"
      :key="npc.id"
      :npc="npc"
      :runtime="state.npcState[npc.id]"
      @click="selectedNpcId.value=npc.id"
    />

    <div v-if="presentNpcs.length===0" class="empty-world">
      <b>這裡現在沒有人。</b>
      <span>抽到角色、安排入住後，他們會自己在已解鎖場景間活動。</span>
    </div>
  </div>

  <div v-if="selectedRoom==='player'" class="room-detail-backdrop" @click.self="selectedRoom=null">
    <section class="player-room-card">
      <header>
        <div><small>PLAYER ROOM / 101</small><h3>我的房間</h3></div>
        <button @click="selectedRoom=null">×</button>
      </header>

      <div class="player-room-scene">
        <div class="room-window"><i></i><i></i></div>
        <div class="room-bed"><span></span></div>
        <div class="room-desk"><span></span></div>
        <div class="room-rug"></div>
        <div class="room-shelf"><i></i><i></i><i></i></div>
        <div class="player-avatar">
          <span class="player-shadow"></span>
          <span class="player-hair"></span>
          <span class="player-face"></span>
          <span class="player-body"></span>
          <span class="player-legs"></span>
        </div>
      </div>

      <div class="player-room-info">
        <div><small>RESIDENT</small><b>你</b></div>
        <div><small>ROOM</small><b>101</b></div>
        <div><small>STATUS</small><b>在家</b></div>
      </div>

      <p>這裡是玩家自己的生活空間。之後換裝、家具、收藏展示與角色拜訪都可以從這個房間往下擴充。</p>
    </section>
  </div>

  <div v-if="selectedRoom&&selectedRoom!=='player'" class="room-assign">
    <div><small>ROOM ASSIGN</small><b>{{ ROOMS.find(r=>r.id===selectedRoom)?.name }}</b></div>
    <select @change="assign(selectedRoom,$event)" :value="state.roomResidents[selectedRoom]||''">
      <option value="">選擇住戶</option>
      <option v-if="roomNpc(selectedRoom)" :value="roomNpc(selectedRoom).id">{{ roomNpc(selectedRoom).name }}（目前）</option>
      <option v-for="npc in unassigned" :key="npc.id" :value="npc.id">{{ npc.name }}｜{{ npc.rarity }}</option>
    </select>
    <button @click="selectedRoom=null">關閉</button>
  </div>
</section>
</template>
