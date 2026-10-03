<script setup>
import {ref} from 'vue'
import {AI_MODEL,loadLocalModel} from '../game/ai'
import {claimDebugPack,debugUnlockAll,resetSave,state} from '../game/store'
const progress=ref(0),modelState=ref('尚未下載'),error=ref('')
async function loadModel(){
 error.value='';modelState.value='下載／載入中'
 try{
  await loadLocalModel(info=>{if(typeof info?.progress==='number')progress.value=Math.round(info.progress);if(info?.status)modelState.value=info.status==='ready'?'載入完成':'下載／載入中'})
  progress.value=100;modelState.value='載入完成';state.aiMode='local'
 }catch(e){modelState.value='載入失敗';error.value=String(e?.message||e);state.aiMode='rules'}
}
</script>
<template>
<section class="panel-page settings">
  <header class="page-head"><div><small>SYSTEM</small><h2>設定與驗收工具</h2></div></header>
  <article class="setting-card">
    <div><small>NPC BRAIN</small><h3>瀏覽器本機 AI</h3></div>
    <p>預設先使用規則型人格回覆，遊戲不會被模型下載卡住。你可以手動下載小模型，完成後 NPC 對話切成本機 AI。</p>
    <div class="model-row"><div><b>{{ AI_MODEL.label }}</b><small>{{ AI_MODEL.note }}</small></div><button class="primary" @click="loadModel">下載並啟用</button></div>
    <div class="progress model"><i :style="{width:progress+'%'}"></i></div><small>狀態：{{ modelState }}｜目前模式：{{ state.aiMode }}</small><code v-if="error">{{ error }}</code>
  </article>
  <article class="setting-card"><div><small>ACCEPTANCE TOOLS</small><h3>大量驗收模式</h3></div><p>不用慢慢農資源，就能一次驗收房間、NPC、場景、卡片與事件。</p><div class="debug-actions"><button @click="claimDebugPack">+50 抽卡券／補給</button><button @click="debugUnlockAll">全部內容解鎖</button><button class="danger" @click="resetSave">清除存檔重來</button></div></article>
  <article class="setting-card asset-note"><div><small>ART PIPELINE</small><h3>美術資產框架</h3></div><p>已預留 Kenney CC0 城市、室內、Tiny Town 與角色素材。後續 Sprite、服裝 Layer 與 CG 可直接替換，不必重寫遊戲邏輯。</p><div class="asset-preview"></div></article>
</section>
</template>
