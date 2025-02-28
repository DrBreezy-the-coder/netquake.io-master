<template lang="pug">
.singleplayer
  .container
    .column.col-12        
      .panel
        .panel-header
          .panel-title
            h5 Quake 1
        .panel-body
          .container
            .column.col-6(v-if="gameStore.hasRegistered")
              GameSelect(v-model="model.gameSelection" :gameList="gameDefinitions")
            .column.col-6
              MapSelect(v-model="model.mapSelection" :mapList="mapList")
        .panel-footer
          button.btn(@click="startCustom()") Start Game
      .panel
        .panel-header
          .panel-title
            h5 Quaddicted Custom Map Selection
            .note Note: This is still experimental. Webquake may 
              span.text-error not 
              | work with some of the more advanced mods. If you own a mod that is unsupported with webquake and know why, please
              |  fill out an issue 
              a(href="https://gitlab.com/joe.lukacovic/netquake.io/issues" target="_blank") here  
              |  with your mod name and what feature needs to be added to webquake to support your mod
              
        .panel-body
          .container
            .column.col-12
              Quaddicted
        .panel-footer
</template>

<script lang="ts" setup>
import {reactive, onMounted, computed, watch, ref} from 'vue'
import { useMapsStore } from '../../../stores/maps';
import type { QuaddictedMap } from '../../../types/QuaddictedMap';

import gameType from '../../../helpers/gameType'
import GameSelect from './GameSelect.vue'
import MapSelect from './MapSelect.vue'
import Quaddicted from './Quaddicted/Quaddicted.vue'
import { gameDefinitions } from '../../../helpers/games'
import type { GameDefinition} from '../../../helpers/games'
import { useGameStore } from '../../../stores/game';
import { useRouter } from 'vue-router';

const router = useRouter()
const gameStore = useGameStore()
const model = reactive<{
  mapSelection: 'start',
  gameSelection: 'original'
}>({
  mapSelection: 'start',
  gameSelection: 'original'
})

const gameObj = computed(() => gameDefinitions.find(g => g.game === model.gameSelection))
const mapList = computed(() => (gameObj.value?.mapList|| [])
  .filter(map => gameStore.hasRegistered || map.gameType === gameType.ShareWare))
const start = () => router.push({name: 'quake'})
const startCustom = () => {
  const query = {'+map': model.mapSelection}
  if (gameObj.value?.game !== 'original') {
    query['-' + gameObj.value!.game] = true
  }
  router.push({name: 'quake', query})
}
</script>
<style lang="scss">
.panel {
  margin-top: 1rem;
}
</style>
