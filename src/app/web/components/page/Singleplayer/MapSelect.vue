<template lang="pug">
.map-select
  select.form-select(@change="$emit('update:modelValue', $event.target.value)")
    option(v-for="map in mapList" :value="map.name") {{getMapDisplay(map)}}
</template>

<script lang="ts" setup>
import type { GameMap } from '../../../helpers/games';

const emits = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()

const props = withDefaults(
  defineProps<{
    mapList: GameMap[],
    modelValue: string
  }>(), 
  {
    modelValue: ''
  })
  
const getMapDisplay = (map: GameMap) => {
  return map.collection ? `${map.collection} - ${map.title}` : map.title
}
</script>