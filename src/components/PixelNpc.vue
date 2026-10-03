<script setup>
defineProps({npc:{type:Object,required:true},runtime:{type:Object,required:true}})
defineEmits(['click'])
const statusLabel={idle:'發呆中',hungry:'肚子餓',eating:'吃飯中',coffee:'喝咖啡',reading:'閱讀中',resting:'休息中',shopping:'逛街中'}
</script>
<template>
<button class="pixel-npc" :style="{left:runtime.x+'%',top:runtime.y+'%','--npc':npc.color,'--accent':npc.accent}" @click="$emit('click')">
  <span class="npc-bubble">{{ statusLabel[runtime.status]||'散步中' }}</span>
  <span class="pixel-person"><i class="hair"></i><i class="face"></i><i class="body"></i><i class="legs"></i></span>
  <strong>{{ npc.name }}</strong>
</button>
</template>
