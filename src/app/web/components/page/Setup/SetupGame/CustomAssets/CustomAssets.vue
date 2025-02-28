<template lang="pug">
.custom-assets
  h4.container Mods / Maps
  table.table.table-hover(:class="model.loading ? 'loading-lg loading' : ''")
    GameTable(v-for="(value, prop, idx) in groupedAssets" 
      :metaList="value" 
      :game="prop" 
      :key="prop"
      @remove="removeGame")

</template>

<script lang="ts" setup>
import {reactive, computed} from 'vue'
import {groupBy, keys, find} from 'ramda'
import GameTable from './GameTable.vue'
import * as assetStore from '../../../../../../../shared/indexeddb'
import type { AssetMeta } from '../../../../../../../shared/types/Store';
import { useGameStore } from '../../../../../stores/game';
import { useMapsStore } from '../../../../../stores/maps';

const model = reactive<{
  selectedStore: string, 
  loading: boolean}>({
  selectedStore: 'id1', 
  loading: false
})

const gameStore = useGameStore()
const mapsStore = useMapsStore()
const groupedAssets = computed(() => groupBy(e => e.game, gameStore.allAssetMetas))
const removeGame = (game: string) => assetStore.removeGame(game).then(gameStore.loadAssets)
</script>
