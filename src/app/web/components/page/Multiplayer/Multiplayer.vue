<template lang="pug">
.multiplayer
  .name-setup 
    .name 
      .name-label Your Name:
      .name-value 
        QuakeText(:value="playerName" :size="14")
        small
          a(@click="model.customizeState = 'customize'") 
            i.icon.icon-edit 
            |  customize...
  template(v-if="multiplayerStore.refreshError")
    .refresh-error 
      font-awesome-icon.icon(icon="fa-solid fa-circle-exclamation" size="xs") 
      |  Error refreshing list
  ServerList(
    @join="testPrejoin"
    :loading="model.refreshing"
    :servers="multiplayerStore.getServerStatuses")
  Discord
  Prejoin(
    v-if="model.customizeState === 'customize'" 
    :showCancel="false"
    @ok="model.customizeState = 'none'"
    @cancel="model.customizeState = 'none'")
  Prejoin(
    v-if="model.customizeState.connecthostport" 
    :showCancel="true"
    okText="Join"
    @cancel="model.customizeState = 'none'"
    @ok="executePrejoin")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useMultiplayerStore } from '../../../stores/multiplayer'
import ServerList from './ServerList.vue'

type CustomizeState = 'none' | ServerStatus | 'customize'
type Model = {
  refreshing: boolean,
  customizeState: CustomizeState,
  playersImg: any[]
}
const PREJOIN_KEY = 'Quake.multiplayer.prejoin'
interface IInstance extends ComponentPublicInstance {
  model: Model
}
export default defineComponent({
  beforeRouteEnter(to, from, next) {
    return next(vm => {
      const multiplayerStore = useMultiplayerStore()
      const instance = vm as IInstance
      instance.model.refreshing = true
      multiplayerStore.refresh().then(() => {
        instance.model.refreshing = false
        multiplayerStore.setAutoRefreshOn()
      })
    })
  }
})
</script>
<script lang="ts" setup>
import {reactive, onMounted, computed, watch, ref} from 'vue'
import QuakeText from '../../QuakeText.vue'
import NameMaker from '../../input/NameMaker.vue'
import ServerRow from './ServerRow.vue'
import Discord from './Discord.vue'
import Prejoin from './Prejoin.vue'
import { useGameStore } from '../../../stores/game'
import type { ServerStatus } from '../../../stores/multiplayer'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const router = useRouter()
const multiplayerStore = useMultiplayerStore()
const gameStore = useGameStore()
const model = reactive<Model>({
  refreshing: false,
  customizeState: 'none',
  playersImg: []
})

// watch(multiplayerStore.getServerStatuses, () => {
//   playersTipImg = []
// }, {immediate: true})

const playerName = computed(() => gameStore.getAutoexecValue('name') ?? 'player')
const setPlayerName = (name: string) => gameStore.setAutoexecValue({name: 'name', value: name})
const testPrejoin = (server: ServerStatus) => {
  if (!localStorage[PREJOIN_KEY]) {
    model.customizeState = server
  } else {
    join(server)
  }
}
const executePrejoin = () => {
  const server = model.customizeState as ServerStatus
  model.customizeState = 'none'
  localStorage[PREJOIN_KEY] = 'done'
  join(server)
}
const join = (server: ServerStatus) => {
  var query = {
    "-connect": `wss://${server.connecthostport}`,
  }
  if (server.game && server.game !== 'id1') {
    query["-game"] = server.game
  }
  router.push({name: 'quake', query})
}

defineExpose({
  model
})
onBeforeRouteLeave((to, from, next) => {
  multiplayerStore.setAutoRefreshOff()
  return next()
})
</script>
<style lang="scss">

.players-tooltip {
  padding: .1rem;
  text-align: left;
  font-size: .7rem;
}
</style>
<style lang="scss" scoped>
@import '../../../scss/colors.scss';
.refresh-error {
  font-weight: bold;
  color: $secondary-color;
}
.server-list {
  margin-bottom: 1rem;
}
.name-setup {
  margin: 1rem 0;

  .name {
    display: flex;
    align-items: flex-start;
    font-size: 1rem;
    .name-value {
      margin-left: 2rem;
    }
  }
  .name-change {
    width: 400px;
  }
}
</style>