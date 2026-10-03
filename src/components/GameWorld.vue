<script setup>
import {computed,ref} from 'vue'
import PixelNpc from './PixelNpc.vue'
import {
  NPCS,ROOMS,SCENES,assignNpc,endRoomVisit,housedNpcIds,ownedNpcList,
  playerRoomAction,residentRoomAction,selectedNpcId,state,unassignNpc,
  unlockRoom,unlockScene,visitScene
} from '../game/store'

const selectedRoom=ref(null)
const current=computed(()=>SCENES.find(s=>s.id===state.currentScene))
const selectedRoomData=computed(()=>ROOMS.find(r=>r.id===selectedRoom.value))
const roomNpc=roomId=>NPCS.find(n=>n.id===state.roomResidents[roomId])
const selectedResident=computed(()=>selectedRoom.value?roomNpc(selectedRoom.value):null)
const selectedResidentRuntime=computed(()=>selectedResident.value?state.npcState[selectedResident.value.id]:null)
const visitor=computed(()=>state.roomVisit.active?NPCS.find(n=>n.id===state.roomVisit.npcId):null)
const visitorRuntime=computed(()=>visitor.value?state.npcState[visitor.value.id]:null)
const unassigned=computed(()=>ownedNpcList.value.filter(n=>!housedNpcIds.value.includes(n.id)))
const presentNpcs=computed(()=>{
  if(state.currentScene==='apartment'){
    return ownedNpcList.value.filter(n=>!housedNpcIds.value.includes(n.id)&&state.npcState[n.id]?.scene==='apartment')
  }
  return ownedNpcList.value.filter(n=>housedNpcIds.value.includes(n.id)&&state.npcState[n.id]?.scene===state.currentScene)
})
const housedCount=computed(()=>housedNpcIds.value.length)

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
  else unassignNpc(roomId)
}

function roomStyle(i){
  return{'--col':i%3,'--row':i<3?0:1}
}

function openChat(npcId){
  if(!npcId)return
  selectedRoom.value=null
  selectedNpcId.value=npcId
}

function interactResident(action){
  if(!selectedResident.value)return
  residentRoomAction(selectedResident.value.id,action)
}

function chatResident(){
  if(!selectedResident.value)return
  const runtime=selectedResidentRuntime.value
  if(runtime?.scene!=='apartment'&&!(state.roomVisit.active&&state.roomVisit.npcId===selectedResident.value.id)){
    const scene=SCENES.find(s=>s.id===runtime?.scene)
    return window.alert(selectedResident.value.name+' 現在在'+(scene?.name||'外面')+'，不在房間。')
  }
  openChat(selectedResident.value.id)
}
</script>

<template>
<section class="world-shell">
  <div class="scene-tabs">
    <button
      v-for="scene in SCENES"
      :key="scene.id"
      :class="{active:state.currentScene===scene.id,locked:!state.unlockedScenes.includes(scene.id)}"
      @click="state.unlockedScenes.includes(scene.id)?visitScene(scene.id):unlockScene(scene.id)"
    >
      <span>{{ scene.icon }}</span>{{ scene.name }}
      <small v-if="!state.unlockedScenes.includes(scene.id)">LOCK</small>
    </button>
  </div>

  <div class="pixel-world" :class="'theme-'+current.theme">
    <div class="world-title">
      <small>DAY {{ String(state.day).padStart(2,'0') }}</small>
      <h2>{{ current.name }}</h2>
    </div>

    <div v-if="state.currentScene==='apartment'" class="apartment-summary">
      <span>走廊等待 {{ unassigned.length }}</span>
      <span>已入住 {{ housedCount }}</span>
    </div>

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
      <div class="scene-props">
        <div class="prop p1"></div><div class="prop p2"></div><div class="prop p3"></div>
        <div class="prop p4"></div><div class="prop p5"></div>
      </div>
    </template>

    <PixelNpc
      v-for="npc in presentNpcs"
      :key="npc.id"
      :npc="npc"
      :runtime="state.npcState[npc.id]"
      @click="selectedNpcId.value=npc.id"
    />

    <div v-if="presentNpcs.length===0" class="empty-world">
      <b>{{ state.currentScene==='apartment'?'目前走廊沒有人。':'這裡現在沒有人。' }}</b>
      <span v-if="state.currentScene==='apartment'">未入住角色才會待在走廊；安排房間後會進入自己的生活行程。</span>
      <span v-else>已入住的 NPC 會依自己的生活狀態在已解鎖場景間活動。</span>
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

      <div class="player-room-scene" :class="{resident:selectedRoom!=='player',visiting:selectedRoom==='player'&&visitor}">
        <div class="room-window"><i></i><i></i></div>
        <div class="room-bed"><span></span></div>
        <div class="room-desk"><span></span></div>
        <div class="room-rug"></div>
        <div class="room-shelf"><i></i><i></i><i></i></div>

        <div v-if="selectedRoom==='player'" class="player-avatar" :class="{withVisitor:visitor}">
          <span class="player-shadow"></span>
          <span class="player-hair"></span>
          <span class="player-face"></span>
          <span class="player-body"></span>
          <span class="player-legs"></span>
          <b class="avatar-name">你</b>
        </div>

        <div
          v-if="selectedRoom==='player'&&visitor"
          class="visitor-avatar"
          :style="{'--resident':visitor.color}"
          @click="openChat(visitor.id)"
        >
          <span class="player-shadow"></span>
          <span class="player-hair"></span>
          <span class="player-face"></span>
          <span class="player-body"></span>
          <span class="player-legs"></span>
          <b>{{ visitor.name }}</b>
        </div>

        <template v-if="selectedRoom!=='player'">
          <div
            v-if="selectedResident&&selectedResidentRuntime?.scene==='apartment'"
            class="resident-avatar"
            :style="{'--resident':selectedResident.color}"
            @click="openChat(selectedResident.id)"
          >
            <span class="player-shadow"></span>
            <span class="player-hair"></span>
            <span class="player-face"></span>
            <span class="player-body"></span>
            <span class="player-legs"></span>
            <b>{{ selectedResident.name }}</b>
          </div>

          <div v-else-if="selectedResident" class="empty-room-sign">
            <b>{{ selectedResident.name }} 外出了</b>
            <span>{{ SCENES.find(s=>s.id===selectedResidentRuntime?.scene)?.name || '目前不在房間' }}</span>
          </div>

          <div v-else class="empty-room-sign">
            <b>空房</b>
            <span>選擇一名已取得的角色入住</span>
          </div>
        </template>
      </div>

      <template v-if="selectedRoom==='player'">
        <div v-if="visitor" class="visit-event-card">
          <small>RANDOM VISIT｜串門事件</small>
          <h4>{{ visitor.name }} 來找你</h4>
          <p>「{{ state.roomVisit.message }}」</p>
          <div class="room-action-grid">
            <button class="primary" @click="openChat(visitor.id)">一起聊天</button>
            <button @click="endRoomVisit()">結束拜訪</button>
          </div>
        </div>

        <div class="player-room-info">
          <div><small>ENERGY</small><b>{{ state.playerEnergy }}/100</b></div>
          <div><small>MOOD</small><b>{{ state.playerMood }}</b></div>
          <div><small>VISITOR</small><b>{{ visitor?.name || '目前沒有' }}</b></div>
        </div>

        <div class="room-action-grid player-actions">
          <button @click="playerRoomAction('rest')">休息一下</button>
          <button @click="playerRoomAction('tidy')">整理房間</button>
          <button @click="playerRoomAction('coffee')">泡咖啡｜20 金幣</button>
        </div>

        <p>101 是你的生活據點。已入住的 NPC 有機會隨機來串門；串門時會直接出現在你的房間裡。</p>
      </template>

      <template v-else>
        <div class="player-room-info">
          <div><small>RESIDENT</small><b>{{ selectedResident?.name || '尚未入住' }}</b></div>
          <div><small>STATUS</small><b>{{ selectedResidentRuntime?.status || '—' }}</b></div>
          <div><small>AFFINITY</small><b>{{ selectedResidentRuntime?.affinity ?? 0 }}/100</b></div>
        </div>

        <div class="resident-room-controls">
          <label>
            <small>安排住戶</small>
            <select @change="assign(selectedRoom,$event)" :value="state.roomResidents[selectedRoom]||''">
              <option value="">空房／讓目前住戶搬出</option>
              <option v-if="selectedResident" :value="selectedResident.id">{{ selectedResident.name }}（目前）</option>
              <option v-for="npc in unassigned" :key="npc.id" :value="npc.id">{{ npc.name }}｜{{ npc.rarity }}</option>
            </select>
          </label>

          <template v-if="selectedResident">
            <div class="resident-stats">
              <span>飢餓 {{ selectedResidentRuntime?.hunger ?? 0 }}/100</span>
              <span>心情 {{ selectedResidentRuntime?.mood || '普通' }}</span>
              <span>{{ selectedResidentRuntime?.scene==='apartment'?'目前在家':'目前外出' }}</span>
            </div>

            <div class="room-action-grid">
              <button @click="interactResident('knock')">敲門</button>
              <button class="primary" @click="chatResident">聊天</button>
              <button @click="interactResident('snack')">送小點心｜30 金幣</button>
              <button @click="interactResident('invite')">邀請來我房間</button>
            </div>
          </template>

          <p v-if="ownedNpcList.length===0">目前還沒有可入住角色，先到「抽卡」取得角色。</p>
          <p v-else-if="!selectedResident">選一名角色入住後，他會離開走廊，開始有自己的房間、外出行程與串門事件。</p>
          <p v-else>住戶有房之後才會進入完整生活系統；搬出後會回到走廊等待下一間房。</p>
        </div>
      </template>
    </section>
  </div>
</section>
</template>
