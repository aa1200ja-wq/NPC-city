<script setup>
import {claimTask,state,taskList} from '../game/store'
</script>
<template>
<section class="panel-page">
  <header class="page-head"><div><small>DAILY LOOP</small><h2>今日生活任務</h2></div><div class="ticket-count">公寓 Lv.<b>{{ state.level }}</b></div></header>
  <div class="task-list">
    <article v-for="task in taskList" :key="task.id">
      <div class="task-check">{{ task.claimed?'✓':task.progress>=task.target?'!':'' }}</div>
      <div class="task-main"><b>{{ task.name }}</b><small>{{ task.progress }} / {{ task.target }}</small><div class="progress"><i :style="{width:(task.progress/task.target*100)+'%'}"></i></div></div>
      <div class="reward"><span v-for="(v,k) in task.reward" :key="k">{{ k }} +{{ v }}</span></div>
      <button :disabled="task.claimed||task.progress<task.target" @click="claimTask(task.id)">{{ task.claimed?'已領取':'領取' }}</button>
    </article>
  </div>
  <div class="history-box"><small>CITY LOG</small><p v-for="(h,i) in state.history.slice(0,8)" :key="i">{{ h }}</p></div>
</section>
</template>
