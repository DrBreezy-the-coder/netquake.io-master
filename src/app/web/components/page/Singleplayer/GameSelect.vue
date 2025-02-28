<template lang="pug">
.game-select
  select.form-select(@change="emit('update:modelValue', $event.target.value)")
    option(v-for="game in gameList" :value="game.game") {{game.name}}
</template>

<script lang="ts" setup>
import type { GameDefinition } from '../../../helpers/games';

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()
const props = withDefaults(
  defineProps<{
    gameList: GameDefinition[],
    modelValue: string
  }>(), 
  {
    modelValue: ''
  })
</script>
