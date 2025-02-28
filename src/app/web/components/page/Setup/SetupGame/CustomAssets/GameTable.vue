<template lang="pug">
tbody
  tr.fixed
    td
      div.basic-button(@click="toggleExpand")
        i.icon(style="margin: .3rem;" :class="model.expanded ? 'icon-minus' : 'icon-plus'")
    td.title {{gameDisplay}}
    td.size {{props.metaList.length}} Files
    td.removal
      div.basic-button(@click="remove")
        i.icon.icon-cross(style="margin: .3rem; color: red")
  
  tr.scroll(v-if="model.expanded")
    table.file-table
      tr(v-for="customAsset in props.metaList")
        td.filename {{customAsset.fileName}}
</template>


<script lang="ts" setup>
import {reactive, computed} from 'vue'
import {groupBy, keys, find} from 'ramda'
import { useMapsStore } from '../../../../../stores/maps';
import type { AssetMeta } from '../../../../../../../shared/types/Store';

interface Props {
  metaList: AssetMeta[],
  game: string
}

const props = withDefaults(
  defineProps<Props>(), { 
    game: ''
  })

const emit = defineEmits<{
  (e: 'remove', game: string): void
}>()
const mapsStore = useMapsStore()
const model = reactive<{expanded: boolean}>({expanded: false})
const gameDisplay = computed(() => {
  const mapsItem = find(m => m.id === props.game, mapsStore.getMapListing)
  return mapsItem ? mapsItem.title : props.game
})
const toggleExpand = () => model.expanded = !model.expanded
const remove = () => emit('remove', props.game)
</script>

<style scoped lang="scss">
.basic-button {
  border: solid 1px #bbb;
  cursor: pointer;
  :hover {
    background-color: #ddd
  }
}
.file-table {
  width: 100%;
}
td.size {
  text-align: right;
}

tr.scroll {
  display: block;
  overflow: auto;
  max-height: 15rem;
}
tr.fixed {
  display:block;
}
th, td {
  vertical-align: top;
  &.title {
    width: 100%;
  }
  &.size {
    min-width: 100px;
  }
  &.filename {
    width: 100%;
    padding-left: 2rem;
  }
}
</style>