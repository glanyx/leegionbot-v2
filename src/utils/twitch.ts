import { EventEmitter } from 'events'
import { Timer } from './timer'

import axios from 'axios'
import { logger } from '.'

const TIMEOUT = 60000

interface AxiosResponse {
  data: TwitchResponse
}

interface TwitchResponse {
  data: Array<StreamResponse>
}

interface StreamResponse extends Stream {
  started_at?: string
}

interface ChannelStatus {
  channelName: string
  live: boolean
}

interface Stream {
  broadcaster_language: string
  broadcaster_login: string
  display_name: string
  game_id: string
  game_name: string
  id: string
  is_live: boolean
  tag_ids: Array<string>
  thumbnail_url: string
  title: string
}

export interface StreamEvent extends Stream {
  started_at: Date
}

export class TwitchClient extends EventEmitter {

  private token?: string
  private expiration?: Date

  private channels: Array<ChannelStatus>

  private timer?: Timer

  constructor() {

    super()
    this.channels = []

    this.getToken()
  }

  private getToken() {
    return axios({
      method: 'post',
      url: `https://id.twitch.tv/oauth2/token`,
      params: {
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET,
        'grant_type': 'client_credentials'
      }
    }).then(res => {
      this.token = res.data.access_token
      this.expiration = new Date().addTime(res.data.expires_in)
    }).catch(e => {
      logger.error(e)
    })
  }

  private validateSession() {
    return axios({
      url: `https://id.twitch.tv/oauth2/validate`,
      headers: {
        'Authorization': `OAuth ${this.token}`,
      }
    }).then(res => {
      if (res.status === 200) {
        return true
      }
      return false
    }).catch(e => {
      logger.error(e)
      return false
    })
  }

  public start() {

    const request = async () => {
      const valid = await this.validateSession()
      if (valid) {
        pollTwitch()
      } else {
        this.getToken().then(() => {
          pollTwitch()
        })
      }
    }

    const pollTwitch = () => {

      this.channels.forEach(channel => {
        axios({
          method: 'get',
          url: `https://api.twitch.tv/helix/search/channels`,
          params: {
            'query': channel.channelName,
          },
          headers: {
            'client-id': process.env.CLIENT_ID,
            'Authorization': `Bearer ${this.token}`
          }
        }).then((res: AxiosResponse) => {
          const { data } = res.data
          const stream = data.find(item => item.broadcaster_login === channel.channelName)
          if (!stream) return
          if (!stream.started_at || stream.started_at === '') {
            if (channel.live) {
              channel.live = false
              this.emit('goOffline', {
                ...stream,
                started_at: undefined
              })
            }
            return
          }
          const liveAt = new Date(stream.started_at)
          if (!channel.live) {
            channel.live = true
            this.emit('goLive', {
              ...stream,
              started_at: stream.started_at ? liveAt : undefined
            } as StreamEvent)
            return
          }

        }).catch(e => {
          // if token expired
          
          logger.error(e)
        })
      })
    }

    this.timer = new Timer(TIMEOUT, request)
    return this
  }

  public track(args: string | Array<string>) {
    if (typeof args === 'string') {
      this.addChannel(args)
    } else {
      args.forEach(arg => {
        this.addChannel(arg)
      })
    }
    return this
  }

  private addChannel(name: string) {
    this.channels.push({
      channelName: name,
      live: false
    })
  }

}