import { computed,reactive,watch } from 'vue'
import { CGS,CLOTHES,DAILY_TASKS,EVENTS,GACHA_POOLS,NPCS,ROOMS,SCENES } from './data'

const KEY='npc-city-save-v1'
const rand=(min,max)=>Math.round(min+Math.random()*(max-min))
const pick=list=>list[Math.floor(Math.random()*list.length)]

function fresh(){
 return{
  version:2,
  day:1,
  level:1,
  exp:0,
  coins:800,
  tickets:20,
  keys:1,
  currentScene:'apartment',
  unlockedRooms:['player'],
  unlockedScenes:['apartment'],
  ownedNpcs:[],
  ownedScenes:[],
  ownedClothes:[],
  ownedEvents:[],
  unlockedCgs:[],
  npcState:{},
  roomResidents:{},
  roomVisit:{active:false,npcId:null,source:null,message:'',startedAt:0},
  playerEnergy:80,
  playerMood:'普通',
  taskProgress:{draw:0,talk:0,visit:1,event:0},
  claimedTasks:[],
  history:['你搬進了 NPC City 的 101 號房。'],
  aiMode:'rules'
 }
}

function load(){
 try{
  const raw=localStorage.getItem(KEY)
  return raw?{...fresh(),...JSON.parse(raw)}:fresh()
 }catch{
  return fresh()
 }
}

export const state=reactive(load())
export const toast=reactive({text:'',type:'info',visible:false})
export const selectedNpcId=reactive({value:null})
export const gachaResult=reactive({items:[],open:false})

watch(state,()=>localStorage.setItem(KEY,JSON.stringify(state)),{deep:true})

export const ownedNpcList=computed(()=>NPCS.filter(n=>state.ownedNpcs.includes(n.id)))
export const housedNpcIds=computed(()=>Object.values(state.roomResidents).filter(Boolean))
export const housedNpcList=computed(()=>NPCS.filter(n=>housedNpcIds.value.includes(n.id)))
export const taskList=computed(()=>DAILY_TASKS.map(t=>({...t,progress:Math.min(t.target,state.taskProgress[t.id]||0),claimed:state.claimedTasks.includes(t.id)})))

export function notify(text,type='info'){
 toast.text=text
 toast.type=type
 toast.visible=true
 setTimeout(()=>toast.visible=false,2300)
}

function ensureNpc(id){
 if(!state.npcState[id]){
  state.npcState[id]={
   scene:'apartment',
   x:rand(20,80),
   y:rand(46,61),
   status:'idle',
   mood:'普通',
   hunger:rand(15,55),
   affinity:0,
   outfit:'default',
   lastTalk:''
  }
 }
 return state.npcState[id]
}

function weightedCharacter(){
 const roll=Math.random()
 const rarity=roll<.08?'SSR':roll<.34?'SR':'R'
 const set=NPCS.filter(n=>n.rarity===rarity)
 return set[Math.floor(Math.random()*set.length)]
}

function addUnique(list,id,duplicateCoins=80){
 if(list.includes(id)){
  state.coins+=duplicateCoins
  return false
 }
 list.push(id)
 return true
}

function rollCard(poolId){
 if(poolId==='character'){
  const n=weightedCharacter()
  const isNew=addUnique(state.ownedNpcs,n.id,n.rarity==='SSR'?240:100)
  ensureNpc(n.id)
  return{type:'character',id:n.id,name:n.name,rarity:n.rarity,isNew}
 }
 if(poolId==='scene'){
  const set=SCENES.filter(s=>s.card)
  const s=set[Math.floor(Math.random()*set.length)]
  const isNew=addUnique(state.ownedScenes,s.card,120)
  return{type:'scene',id:s.card,name:s.name,rarity:s.id==='mall'?'SSR':'SR',isNew}
 }
 if(poolId==='clothes'){
  const c=CLOTHES[Math.floor(Math.random()*CLOTHES.length)]
  const isNew=addUnique(state.ownedClothes,c.id,90)
  return{type:'clothes',id:c.id,name:c.name,rarity:c.rarity,isNew}
 }
 const e=EVENTS[Math.floor(Math.random()*EVENTS.length)]
 const isNew=addUnique(state.ownedEvents,e.id,100)
 return{type:'event',id:e.id,name:e.name,rarity:e.rarity,isNew}
}

export function draw(poolId,count=1){
 if(!GACHA_POOLS[poolId])return
 if(state.tickets<count)return notify('抽卡券不足','warn')
 state.tickets-=count
 gachaResult.items=Array.from({length:count},()=>rollCard(poolId))
 gachaResult.open=true
 state.taskProgress.draw=(state.taskProgress.draw||0)+count
 state.history.unshift('完成 '+count+' 次「'+GACHA_POOLS[poolId].name+'」抽卡。')
}

export function unlockRoom(roomId){
 const room=ROOMS.find(r=>r.id===roomId)
 if(!room||state.unlockedRooms.includes(roomId))return
 if(state.level<room.level)return notify('公寓等級不足','warn')
 if(state.keys<room.cost)return notify('房間鑰匙不足','warn')
 state.keys-=room.cost
 state.unlockedRooms.push(roomId)
 notify(room.name+' 已解鎖','success')
}

export function roomOfNpc(npcId){
 return Object.keys(state.roomResidents).find(roomId=>state.roomResidents[roomId]===npcId)||null
}

export function assignNpc(npcId,roomId){
 if(!state.ownedNpcs.includes(npcId)||!state.unlockedRooms.includes(roomId)||roomId==='player')return

 const previousResident=state.roomResidents[roomId]
 if(previousResident&&previousResident!==npcId){
  const previousRuntime=ensureNpc(previousResident)
  previousRuntime.scene='apartment'
  previousRuntime.status='idle'
 }

 Object.keys(state.roomResidents).forEach(k=>{
  if(state.roomResidents[k]===npcId)delete state.roomResidents[k]
 })

 state.roomResidents[roomId]=npcId
 const runtime=ensureNpc(npcId)
 runtime.scene='apartment'
 runtime.status='resting'
 runtime.x=rand(20,80)
 runtime.y=rand(46,61)

 const npc=NPCS.find(n=>n.id===npcId)
 const room=ROOMS.find(r=>r.id===roomId)
 state.history.unshift((npc?.name||'住戶')+' 搬進了 '+(room?.name||roomId)+'。')
 notify((npc?.name||'住戶')+' 已入住，已離開走廊','success')
}

export function unassignNpc(roomId){
 const npcId=state.roomResidents[roomId]
 if(!npcId)return
 const npc=NPCS.find(n=>n.id===npcId)
 delete state.roomResidents[roomId]
 const runtime=ensureNpc(npcId)
 runtime.scene='apartment'
 runtime.status='idle'
 runtime.x=rand(20,80)
 runtime.y=rand(46,61)
 if(state.roomVisit.active&&state.roomVisit.npcId===npcId)endRoomVisit(false)
 state.history.unshift((npc?.name||'住戶')+' 搬回走廊等待新的房間。')
 notify((npc?.name||'住戶')+' 已搬出，回到走廊','info')
}

export function unlockScene(sceneId){
 const scene=SCENES.find(s=>s.id===sceneId)
 if(!scene||state.unlockedScenes.includes(sceneId))return
 if(state.level<scene.level)return notify('城市等級不足','warn')
 if(scene.card&&!state.ownedScenes.includes(scene.card))return notify('需要先抽到對應場景卡','warn')
 state.unlockedScenes.push(sceneId)
 notify(scene.name+' 開放了','success')
}

export function visitScene(sceneId){
 if(!state.unlockedScenes.includes(sceneId))return unlockScene(sceneId)
 if(state.currentScene!==sceneId){
  state.currentScene=sceneId
  state.taskProgress.visit=(state.taskProgress.visit||0)+1
 }
}

export function talkToNpc(npcId,message){
 const r=ensureNpc(npcId)
 r.affinity=Math.min(100,r.affinity+2)
 r.lastTalk=message
 state.taskProgress.talk=(state.taskProgress.talk||0)+1
 if(npcId==='npc001'&&r.affinity>=30)addUnique(state.unlockedCgs,'cg_001_30',0)
 if(npcId==='npc001'&&r.affinity>=60)addUnique(state.unlockedCgs,'cg_001_60',0)
 if(npcId==='npc003'&&r.affinity>=30)addUnique(state.unlockedCgs,'cg_003_30',0)
 if(npcId==='npc005'&&r.affinity>=30)addUnique(state.unlockedCgs,'cg_005_30',0)
}

export function residentRoomAction(npcId,action){
 if(!housedNpcIds.value.includes(npcId))return notify('這名角色還沒有自己的房間','warn')
 const npc=NPCS.find(n=>n.id===npcId)
 const r=ensureNpc(npcId)

 if(action==='knock'){
  if(r.scene!=='apartment'&&!(state.roomVisit.active&&state.roomVisit.npcId===npcId)){
   const scene=SCENES.find(s=>s.id===r.scene)
   return notify((npc?.name||'住戶')+' 現在在'+(scene?.name||'外面')+'，不在房間','warn')
  }
  r.affinity=Math.min(100,r.affinity+1)
  r.mood='被你打擾但不討厭'
  state.history.unshift('你去敲了 '+(npc?.name||'住戶')+' 的門。')
  return notify((npc?.name||'住戶')+' 開門了','success')
 }

 if(action==='snack'){
  if(state.coins<30)return notify('金幣不足，需要 30','warn')
  state.coins-=30
  r.affinity=Math.min(100,r.affinity+4)
  r.hunger=Math.max(0,r.hunger-25)
  r.mood='心情不錯'
  state.history.unshift('你送了 '+(npc?.name||'住戶')+' 一份小點心。')
  return notify('好感 +4｜飢餓下降','success')
 }

 if(action==='invite'){
  return startRoomVisit(npcId,'invite')
 }
}

export function playerRoomAction(action){
 if(action==='rest'){
  state.playerEnergy=Math.min(100,(state.playerEnergy||0)+25)
  state.playerMood='放鬆'
  state.history.unshift('你在 101 房休息了一會。')
  return notify('體力 +25','success')
 }
 if(action==='tidy'){
  state.playerEnergy=Math.max(0,(state.playerEnergy||0)-5)
  state.playerMood='充實'
  state.history.unshift('你整理了自己的房間。')
  return notify('房間整理完成','success')
 }
 if(action==='coffee'){
  if(state.coins<20)return notify('金幣不足，需要 20','warn')
  state.coins-=20
  state.playerEnergy=Math.min(100,(state.playerEnergy||0)+12)
  state.playerMood='清醒'
  state.history.unshift('你在房間泡了一杯咖啡。')
  return notify('體力 +12','success')
 }
}

const visitLines=[
 '我剛好經過，就過來坐一下。',
 '你在家嗎？我想來晃一下。',
 '今天不太想一個人待著。',
 '我帶了點東西，順便來看看你。',
 '沒什麼事，只是突然想來找你。'
]

export function startRoomVisit(npcId,source='random'){
 if(state.roomVisit.active)return false
 if(!housedNpcIds.value.includes(npcId)){
  if(source!=='random')notify('只有已入住的 NPC 才能來串門','warn')
  return false
 }
 const npc=NPCS.find(n=>n.id===npcId)
 const r=ensureNpc(npcId)
 r.scene='apartment'
 r.status='visiting'
 r.mood='來串門'
 state.roomVisit={
  active:true,
  npcId,
  source,
  message:pick(visitLines),
  startedAt:Date.now()
 }
 state.history.unshift((npc?.name||'住戶')+' 來 101 房串門。')
 notify((npc?.name||'有人')+' 來敲你的門了','success')
 return true
}

export function endRoomVisit(showToast=true){
 if(!state.roomVisit.active)return
 const npcId=state.roomVisit.npcId
 const npc=NPCS.find(n=>n.id===npcId)
 if(npcId){
  const r=ensureNpc(npcId)
  r.status='resting'
  r.scene='apartment'
 }
 state.roomVisit={active:false,npcId:null,source:null,message:'',startedAt:0}
 if(showToast)notify((npc?.name||'訪客')+' 回自己的房間了','info')
}

export function triggerRandomVisit(force=false){
 if(state.roomVisit.active)return false
 const candidates=housedNpcList.value
 if(candidates.length===0){
  if(force)notify('目前沒有已入住的 NPC，先安排一間房給他','warn')
  return false
 }
 if(!force&&Math.random()>=.05)return false
 const npc=pick(candidates)
 return startRoomVisit(npc.id,force?'debug':'random')
}

export function triggerEvent(eventId){
 if(!state.ownedEvents.includes(eventId))return notify('你還沒有這張事件卡','warn')
 const e=EVENTS.find(x=>x.id===eventId)
 if(!e)return
 addUnique(state.unlockedCgs,e.cg,0)
 state.taskProgress.event=(state.taskProgress.event||0)+1
 state.history.unshift('事件發生：'+e.name+'｜'+e.text)
 notify('事件「'+e.name+'」已發生，CG 已收錄','success')
}

export function claimTask(id){
 const t=DAILY_TASKS.find(x=>x.id===id)
 if(!t||state.claimedTasks.includes(id))return
 if((state.taskProgress[id]||0)<t.target)return notify('任務尚未完成','warn')
 state.claimedTasks.push(id)
 Object.entries(t.reward).forEach(([k,v])=>state[k]=(state[k]||0)+v)
 state.exp+=25
 if(state.exp>=100){
  state.exp-=100
  state.level+=1
  state.keys+=1
  state.history.unshift('公寓升到 Lv.'+state.level)
 }
 notify('獎勵已領取','success')
}

const statuses=['idle','eating','coffee','reading','resting','shopping']

export function tickWorld(){
 const housed=new Set(housedNpcIds.value)

 ownedNpcList.value.forEach(npc=>{
  const r=ensureNpc(npc.id)
  r.hunger=Math.min(100,r.hunger+rand(1,3))

  if(!housed.has(npc.id)){
   r.scene='apartment'
   r.status=r.hunger>78?'hungry':'idle'
   r.x=Math.max(16,Math.min(84,r.x+rand(-8,8)))
   r.y=Math.max(47,Math.min(61,r.y+rand(-3,3)))
   return
  }

  if(state.roomVisit.active&&state.roomVisit.npcId===npc.id){
   r.scene='apartment'
   r.status='visiting'
   return
  }

  if(r.hunger>78)r.status='hungry'
  else if(Math.random()<.3)r.status=pick(statuses)

  if(r.status==='eating')r.hunger=Math.max(5,r.hunger-25)

  if(Math.random()<.08&&state.unlockedScenes.length>1){
   r.scene=pick(state.unlockedScenes)
  }
 })

 triggerRandomVisit(false)
}

export function claimDebugPack(){
 state.coins+=5000
 state.tickets+=50
 state.keys+=10
 notify('測試補給已發放','success')
}

export function debugUnlockAll(){
 state.level=10
 state.unlockedRooms=ROOMS.map(r=>r.id)
 state.unlockedScenes=SCENES.map(s=>s.id)
 state.ownedNpcs=NPCS.map(n=>n.id)
 state.ownedScenes=SCENES.filter(s=>s.card).map(s=>s.card)
 state.ownedClothes=CLOTHES.map(c=>c.id)
 state.ownedEvents=EVENTS.map(e=>e.id)
 NPCS.forEach(n=>ensureNpc(n.id))
 notify('驗收模式：全部內容已解鎖','success')
}

export function resetSave(){
 localStorage.removeItem(KEY)
 location.reload()
}

export { CGS,CLOTHES,EVENTS,GACHA_POOLS,NPCS,ROOMS,SCENES }
