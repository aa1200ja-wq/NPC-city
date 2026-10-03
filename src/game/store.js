import { computed,reactive,watch } from 'vue'
import { CGS,CLOTHES,DAILY_TASKS,EVENTS,GACHA_POOLS,NPCS,ROOMS,SCENES } from './data'
const KEY='npc-city-save-v1'
const rand=(min,max)=>Math.round(min+Math.random()*(max-min))
function fresh(){return{version:1,day:1,level:1,exp:0,coins:800,tickets:20,keys:1,currentScene:'apartment',unlockedRooms:['player'],unlockedScenes:['apartment'],ownedNpcs:[],ownedScenes:[],ownedClothes:[],ownedEvents:[],unlockedCgs:[],npcState:{},roomResidents:{},taskProgress:{draw:0,talk:0,visit:1,event:0},claimedTasks:[],history:['你搬進了 NPC City 的 101 號房。'],aiMode:'rules'}}
function load(){try{const raw=localStorage.getItem(KEY);return raw?{...fresh(),...JSON.parse(raw)}:fresh()}catch{return fresh()}}
export const state=reactive(load())
export const toast=reactive({text:'',type:'info',visible:false})
export const selectedNpcId=reactive({value:null})
export const gachaResult=reactive({items:[],open:false})
watch(state,()=>localStorage.setItem(KEY,JSON.stringify(state)),{deep:true})
export const ownedNpcList=computed(()=>NPCS.filter(n=>state.ownedNpcs.includes(n.id)))
export const taskList=computed(()=>DAILY_TASKS.map(t=>({...t,progress:Math.min(t.target,state.taskProgress[t.id]||0),claimed:state.claimedTasks.includes(t.id)})))
export function notify(text,type='info'){toast.text=text;toast.type=type;toast.visible=true;setTimeout(()=>toast.visible=false,2300)}
function ensureNpc(id){if(!state.npcState[id])state.npcState[id]={scene:'apartment',x:rand(20,80),y:rand(28,74),status:'idle',mood:'普通',hunger:rand(15,55),affinity:0,outfit:'default',lastTalk:''};return state.npcState[id]}
function weightedCharacter(){const roll=Math.random();const rarity=roll<.08?'SSR':roll<.34?'SR':'R';const set=NPCS.filter(n=>n.rarity===rarity);return set[Math.floor(Math.random()*set.length)]}
function addUnique(list,id,duplicateCoins=80){if(list.includes(id)){state.coins+=duplicateCoins;return false}list.push(id);return true}
function rollCard(poolId){
 if(poolId==='character'){const n=weightedCharacter();const isNew=addUnique(state.ownedNpcs,n.id,n.rarity==='SSR'?240:100);ensureNpc(n.id);return{type:'character',id:n.id,name:n.name,rarity:n.rarity,isNew}}
 if(poolId==='scene'){const set=SCENES.filter(s=>s.card);const s=set[Math.floor(Math.random()*set.length)];const isNew=addUnique(state.ownedScenes,s.card,120);return{type:'scene',id:s.card,name:s.name,rarity:s.id==='mall'?'SSR':'SR',isNew}}
 if(poolId==='clothes'){const c=CLOTHES[Math.floor(Math.random()*CLOTHES.length)];const isNew=addUnique(state.ownedClothes,c.id,90);return{type:'clothes',id:c.id,name:c.name,rarity:c.rarity,isNew}}
 const e=EVENTS[Math.floor(Math.random()*EVENTS.length)];const isNew=addUnique(state.ownedEvents,e.id,100);return{type:'event',id:e.id,name:e.name,rarity:e.rarity,isNew}
}
export function draw(poolId,count=1){if(!GACHA_POOLS[poolId])return;if(state.tickets<count)return notify('抽卡券不足','warn');state.tickets-=count;gachaResult.items=Array.from({length:count},()=>rollCard(poolId));gachaResult.open=true;state.taskProgress.draw=(state.taskProgress.draw||0)+count;state.history.unshift('完成 '+count+' 次「'+GACHA_POOLS[poolId].name+'」抽卡。')}
export function unlockRoom(roomId){const room=ROOMS.find(r=>r.id===roomId);if(!room||state.unlockedRooms.includes(roomId))return;if(state.level<room.level)return notify('公寓等級不足','warn');if(state.keys<room.cost)return notify('房間鑰匙不足','warn');state.keys-=room.cost;state.unlockedRooms.push(roomId);notify(room.name+' 已解鎖','success')}
export function assignNpc(npcId,roomId){if(!state.ownedNpcs.includes(npcId)||!state.unlockedRooms.includes(roomId)||roomId==='player')return;Object.keys(state.roomResidents).forEach(k=>{if(state.roomResidents[k]===npcId)delete state.roomResidents[k]});state.roomResidents[roomId]=npcId;ensureNpc(npcId).scene='apartment';notify('住戶已搬入 '+roomId.toUpperCase(),'success')}
export function unlockScene(sceneId){const scene=SCENES.find(s=>s.id===sceneId);if(!scene||state.unlockedScenes.includes(sceneId))return;if(state.level<scene.level)return notify('城市等級不足','warn');if(scene.card&&!state.ownedScenes.includes(scene.card))return notify('需要先抽到對應場景卡','warn');state.unlockedScenes.push(sceneId);notify(scene.name+' 開放了','success')}
export function visitScene(sceneId){if(!state.unlockedScenes.includes(sceneId))return unlockScene(sceneId);if(state.currentScene!==sceneId){state.currentScene=sceneId;state.taskProgress.visit=(state.taskProgress.visit||0)+1}}
export function talkToNpc(npcId,message){const r=ensureNpc(npcId);r.affinity=Math.min(100,r.affinity+2);r.lastTalk=message;state.taskProgress.talk=(state.taskProgress.talk||0)+1;if(npcId==='npc001'&&r.affinity>=30)addUnique(state.unlockedCgs,'cg_001_30',0);if(npcId==='npc001'&&r.affinity>=60)addUnique(state.unlockedCgs,'cg_001_60',0);if(npcId==='npc003'&&r.affinity>=30)addUnique(state.unlockedCgs,'cg_003_30',0);if(npcId==='npc005'&&r.affinity>=30)addUnique(state.unlockedCgs,'cg_005_30',0)}
export function triggerEvent(eventId){if(!state.ownedEvents.includes(eventId))return notify('你還沒有這張事件卡','warn');const e=EVENTS.find(x=>x.id===eventId);if(!e)return;addUnique(state.unlockedCgs,e.cg,0);state.taskProgress.event=(state.taskProgress.event||0)+1;state.history.unshift('事件發生：'+e.name+'｜'+e.text);notify('事件「'+e.name+'」已發生，CG 已收錄','success')}
export function claimTask(id){const t=DAILY_TASKS.find(x=>x.id===id);if(!t||state.claimedTasks.includes(id))return;if((state.taskProgress[id]||0)<t.target)return notify('任務尚未完成','warn');state.claimedTasks.push(id);Object.entries(t.reward).forEach(([k,v])=>state[k]=(state[k]||0)+v);state.exp+=25;if(state.exp>=100){state.exp-=100;state.level+=1;state.keys+=1;state.history.unshift('公寓升到 Lv.'+state.level)}notify('獎勵已領取','success')}
const statuses=['idle','hungry','eating','coffee','reading','resting','shopping']
export function tickWorld(){ownedNpcList.value.forEach(npc=>{const r=ensureNpc(npc.id);r.hunger=Math.min(100,r.hunger+rand(1,4));r.x=Math.max(12,Math.min(88,r.x+rand(-12,12)));r.y=Math.max(24,Math.min(80,r.y+rand(-9,9)));if(r.hunger>78)r.status='hungry';else if(Math.random()<.35)r.status=statuses[Math.floor(Math.random()*statuses.length)];if(r.status==='eating')r.hunger=Math.max(5,r.hunger-25);if(Math.random()<.12&&state.unlockedScenes.length>1)r.scene=state.unlockedScenes[Math.floor(Math.random()*state.unlockedScenes.length)]})}
export function claimDebugPack(){state.coins+=5000;state.tickets+=50;state.keys+=10;notify('測試補給已發放','success')}
export function debugUnlockAll(){state.level=10;state.unlockedRooms=ROOMS.map(r=>r.id);state.unlockedScenes=SCENES.map(s=>s.id);state.ownedNpcs=NPCS.map(n=>n.id);state.ownedScenes=SCENES.filter(s=>s.card).map(s=>s.card);state.ownedClothes=CLOTHES.map(c=>c.id);state.ownedEvents=EVENTS.map(e=>e.id);NPCS.forEach(n=>ensureNpc(n.id));notify('驗收模式：全部內容已解鎖','success')}
export function resetSave(){localStorage.removeItem(KEY);location.reload()}
export { CGS,CLOTHES,EVENTS,GACHA_POOLS,NPCS,ROOMS,SCENES }
