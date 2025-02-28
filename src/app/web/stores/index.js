import Vuex from 'vuex'
import Vue from 'vue'
import player from './player'
import game from './game'
import multiplayer from './multiplayer'
import maps from './maps'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    multiplayer,
    player,
    game,
    maps
  },
})

store.dispatch('game/loadConfig')
if (!store.getters['game/getConfigFile']) {
  store.dispatch('game/loadRecommendedConfig')
}

store.dispatch('game/loadAutoexec')
if (!store.getters['game/getAutoexecFile']) {
  store.dispatch('game/loadRecommendedAutoexec')
}

store.dispatch('maps/loadMapListing')
store.dispatch('game/loadAssets')
store.dispatch('multiplayer/refreshLoop')

export default store