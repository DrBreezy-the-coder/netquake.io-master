import axios from 'axios'
import { defineStore } from 'pinia'

const masterServerUrl = '/api/server'

export type PlayerStatus = {
  name: string
  connectedTime: number
  frags: string
  colors: number
}

export type ServerStatus = {
  connecthostport: string
  game: string
  lastQuery: number
  location: string
  map: string
  maxPlayers: string
  name: string
  players: PlayerStatus[]
}

interface State {
  serverStatuses: Record<string,ServerStatus>
  refreshError: boolean
  autoRefresh: boolean
}

export const useMultiplayerStore = defineStore('mutiplayer', {
  state: (): State => ({
    serverStatuses: {},
    autoRefresh: false,
    refreshError: false
  }),
  getters: {
    getServerStatuses: state => state.serverStatuses,
    getAutoRefersh: state => state.autoRefresh
  },
  actions: {
    setServerPing ({serverKey, ping}) {
      this.serverStatuses[serverKey].ping = ping
    },
    setAutoRefreshOn () {
      this.autoRefresh = true
    },
    setAutoRefreshOff () {
      this.autoRefresh = false
    },
    loadServerStatuses () {
      return axios.get(masterServerUrl)
        .then(serverStatuses => {
          this.refreshError = false
          this.serverStatuses = serverStatuses.data.reduce((agg, server) => {
            // Transforms array into key/value hash with key being host:port
            return {
              ...agg,
              [server.connecthostport]: {
                ping: '..',
                ...server
              }
            }
          }, {})
        })
        .catch(err => { 
          console.log('Server refresh error')
          console.log(err)
          this.refreshError = true
        })
    },
    pingAllServers () {
      const servers = this.getServerStatuses || {}

      return Object.keys(servers).map(key => {
        const server = servers[key]
        return pingServer(server.connecthostport)
          .then(time => this.setServerPing({serverKey: key, ping: time}))
          .catch(err => this.setServerPing({serverKey: key, ping: '??'}))
      })
    },
    refresh () { 
      return this.loadServerStatuses().then(() => this.pingAllServers())
    },
    refreshLoop () {
      const work = this.getAutoRefersh  ? this.refresh() : Promise.resolve()
      return work
        .then(() => {
          setTimeout(() => {
            this.refreshLoop()
          }, refreshTime)
        })
    }
  }
})

const refreshTime = 5000
const pingServer = (hostport) => {
  const url = `https://${hostport}/ping`
  const start = new Date().getTime()
  return axios.get(url, {timeout: 1000})
    .then(() => {
      const end = new Date().getTime()
      return end - start
    })
}
