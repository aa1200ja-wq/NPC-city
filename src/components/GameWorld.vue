<script setup>
import {computed,ref} from 'vue'
import PixelNpc from './PixelNpc.vue'
import {NPCS,ROOMS,SCENES,assignNpc,ownedNpcList,selectedNpcId,state,unlockRoom,unlockScene,visitScene} from '../game/store'

const selectedRoom=ref(null)
const current=computed(()=>SCENES.find(s=>s.id===state.currentScene))
const selectedRoomData=computed(()=>ROOMS.find(r=>r.id===selectedRoom.value))
const selectedResident=computed(()=>selectedRoom.value?roomNpc(selectedRoom.value):null)
const presentNpcs=computed(()=>ownedNpcList.value.filter(n=>state.npcState[n.id]?.scene===state.currentScene))
const unassigned=computed(()=>ownedNpcList.value.filter(n=>!Object.values(state.roomResidents).includes(n.id)))
const roomNpc=roomId=>NPCS.find(n=>n.id===state.roomResidents[roomId])

function roomClick(room){
  if(!state.unlockedRooms.includes(room.id)){
    unlockRoom(room.id)
    if(state.unlockedRooms.includes(room.id))selectedRoom.value=room.id
    return
  }
  selectedRoom.value=room.id
}
function assign(roomId,e){
  const id=e.target.value
  if(id)assignNpc(id,roomId)
}
const roomStyle=i=>({'--col':i%3,'--row':i<3?0:1})
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
        <small v-else>{{ room.id==='player'?'HOME':'空房｜點擊管理' }}</small>
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

  <div v-if="selectedRoom" class="room-detail-backdrop" @click.self="selectedRoom=null">
    <section class="player-room-card">
      <header>
        <div>
          <small>{{ selectedRoom==='player'?'PLAYER ROOM':'RESIDENT ROOM' }} / {{ selectedRoomData?.name?.slice(0,3) }}</small>
          <h3>{{ selectedRoom==='player'?'我的房間':selectedRoomData?.name }}</h3>
        </div>
        <button @click="selectedRoom=null">×</button>
      </header>

      <div class="player-room-scene" :class="{resident:selectedRoom!=='player'}">
        <div class="room-window"><i></i><i></i></div>
        <div class="room-bed"><span></span></div>
        <div class="room-desk"><span></span></div>
        <div class="room-rug"></div>
        <div class="room-shelf"><i></i><i></i><i></i></div>

        <div v-if="selectedRoom==='player'" class="player-avatar">
          <span class="player-shadow"></span><span class="player-hair"></span><span class="player-face"></span><span class="player-body"></span><span class="player-legs"></span>
        </div>

        <div v-else-if="selectedResident" class="resident-avatar" :style="{'--resident':selectedResident.color}">
          <span class="player-shadow"></span><span class="player-hair"></span><span class="player-face"></span><span class="player-body"></span><span class="player-legs"></span>
          <b>{{ selectedResident.name }}</b>
        </div>

        <div v-else class="empty-room-sign"><b>空房</b><span>選擇一名已取得的角色入住</span></div>
      </div>

      <template v-if="selectedRoom==='player'">
        <div class="player-room-info">
          <div><small>RESIDENT</small><b>你</b></div>
          <div><small>ROOM</small><b>101</b></div>
          <div><small>STATUS</small><b>在家</b></div>
        </div>
        <p>這裡是玩家自己的生活空間。之後換裝、家具、收藏展示與角色拜訪都可以從這個房間往下擴充。</p>
      </template>

      <template v-else>
        <div class="player-room-info">
          <div><small>ROOM</small><b>{{ selectedRoomData?.name?.slice(0,3) }}</b></div>
          <div><small>RESIDENT</small><b>{{ selectedResident?.name || '尚未入住' }}</b></div>
          <div><small>STATUS</small><b>{{ selectedResident?'已入住':'空房' }}</b></div>
        </div>

        <div class="resident-room-controls">
          <label>
            <small>安排住戶</small>
            <select @change="assign(selectedRoom,$event)" :value="state.roomResidents[selectedRoom]||''">
              <option value="">選擇角色</option>
              <option v-if="selectedResident" :value="selectedResident.id">{{ selectedResident.name }}（目前）</option>
              <option v-for="npc in unassigned" :key="npc.id" :value="npc.id">{{ npc.name }}｜{{ npc.rarity }}</option>
            </select>
          </label>
          <p v-if="ownedNpcList.length===0">目前還沒有可入住角色，先到「抽卡」取得角色。</p>
          <p v-else>選擇角色後會立即安排入住；之後可以繼續擴充拜訪、房間事件與住戶生活行為。</p>
        </div>
      </template>
    </section>
  </div>
</section>
</template>
