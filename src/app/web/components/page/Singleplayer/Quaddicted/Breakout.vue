<template lang="pug">
.panel
  .panel-header
    h6 Selected: {{map.title}}
  .panel-body
    MapLoadProgress(:map="props.map" v-if="isMapLoading")
    .container(v-else)
      .columns
        .column.col-6
          a(:href="link" target="_blank") Quaddicted Details
      .columns
        .column.col-2
          .map-label Start Map
        .column.col-3
          template(v-if="props.map.mapList.length == 1")
            .map-name {{props.map.mapList[0]}}
          template(v-else)
            .map-names
              select.select-sm.form-select(v-model="startMap")
                option(v-for="m in props.map.mapList" :value="m") {{m}}
        .column.col-3
          .start
            QButton(
              @click="play"
              :disabled="isDisabled" 
              :tooltip="tooltipText"
              :size="ButtonSize.Small"
              :tooltipPlacement="TooltipPlacement.left") Play!
      .columns
        .column.col-2
          .map-label QD Rating
        .column.col-2 {{props.map.rating > 0 ? props.map.rating : 'N/A'}}
      .columns
        .column.col-2
          .map-label User Rating
        .column.col-2 
          Rating(:rating="parseFloat(props.map.userrating)")
      .columns
        .column.col-2
          .map-label Size
        .column.col-2 {{addCommas(props.map.size)}}
            
  .panel-footer


</template>

<script lang="ts" setup>
import {reactive, onMounted, computed, watch} from 'vue'
import {contains} from 'ramda'
import MapLoadProgress from './MapLoadProgress.vue'
import { useMapsStore } from '../../../../stores/maps';
import { useGameStore } from '../../../../stores/game';
import type { QuaddictedMap } from '../../../../types/QuaddictedMap';
import QButton, {TooltipPlacement, ButtonSize} from '../../../input/QButton.vue'
import Rating from './Rating.vue'
import { addCommas } from '../../../../helpers/number';

const emit = defineEmits<{
  (e: 'play', startMap: string): void}
>()

const mapsStore = useMapsStore()
const gameStore = useGameStore()
const guessStartMap = startMaps => {
  if (contains('start', startMaps)) {
    return 'start'
  }
  return startMaps[0] || ''
}
const props = withDefaults(defineProps<{map: QuaddictedMap | null}>(), {map: null})
const model = reactive<{
  startMap: string,
  mapLaunching: boolean
}>({startMap: guessStartMap(props.map?.mapList), mapLaunching: false})
const isDisabled = computed(() => !gameStore.hasRegistered || !!props.map?.requirements?.length)

const isMapLoading = computed(() => mapsStore.getMapLoadState === 'loading')
const startMap = computed(() => guessStartMap(props.map?.mapList))
const link = computed(() => 'https://www.quaddicted.com/reviews/' + props.map?.detailLink)
const tooltipText = computed(() => {
  switch(true){
    case !gameStore.hasRegistered:
      return `You must load your pak1.pak before\nplaying modified games.\nSee FAQ for details.`
    case props.map && props.map.requirements.length > 0: 
      return 'This requires loading additional resources \nwhich isn\'t supported yet:\n' + props.map?.requirements.join('\n')
    default:
      return 'Download and play this map'
  }
})

const play = () => emit('play', startMap.value)
</script>

<style>
.tooltip {
  opacity: 1; 
}
</style>