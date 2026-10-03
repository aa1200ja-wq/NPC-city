<script setup>
import {GACHA_POOLS,draw,gachaResult,state} from '../game/store'
</script>
<template>
<section class="panel-page">
  <header class="page-head"><div><small>GACHA SYSTEM</small><h2>抽卡中心</h2></div><div class="ticket-count">抽卡券 <b>{{ state.tickets }}</b></div></header>
  <div class="pool-grid">
    <article v-for="pool in Object.values(GACHA_POOLS)" :key="pool.id" class="pool-card" :class="'pool-'+pool.id">
      <small>{{ pool.type.toUpperCase() }} PACK</small><h3>{{ pool.name }}</h3><p>{{ pool.subtitle }}</p>
      <div class="pool-actions"><button @click="draw(pool.id,1)">單抽 ×1</button><button class="primary" @click="draw(pool.id,10)">十連 ×10</button></div>
    </article>
  </div>
  <div v-if="gachaResult.open" class="modal-backdrop" @click.self="gachaResult.open=false">
    <div class="gacha-modal">
      <div class="modal-head"><b>抽卡結果</b><button @click="gachaResult.open=false">×</button></div>
      <div class="result-grid">
        <div v-for="(item,i) in gachaResult.items" :key="i" class="result-card" :class="'rarity-'+item.rarity">
          <small>{{ item.rarity }}</small><div class="card-symbol">{{ item.type.slice(0,1).toUpperCase() }}</div><b>{{ item.name }}</b><em>{{ item.isNew?'NEW':'重複轉換金幣' }}</em>
        </div>
      </div>
    </div>
  </div>
</section>
</template>
