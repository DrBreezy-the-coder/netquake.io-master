<template lang="pug">
router-view
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import {useMultiplayerStore} from '../stores/multiplayer'
import {useGameStore} from '../stores/game'
import {useMapsStore} from '../stores/maps'

const  multiplayerStore = useMultiplayerStore()
const gameStore = useGameStore()
const mapsStore = useMapsStore()

onMounted(() => {
  gameStore.loadConfig()
  if (gameStore.getConfigFile) {
    gameStore.loadRecommendedConfig
  }
  gameStore.loadAutoexec()
  if (gameStore.getAutoexecFile) {
    gameStore.loadRecommendedAutoexec
  }

  mapsStore.loadMapListing()
  gameStore.loadAssets()
  multiplayerStore.refreshLoop()
})
</script>