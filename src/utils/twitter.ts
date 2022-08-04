import { EventEmitter } from 'events'
import Twitter, { RequestParameters } from 'twitter-v2'
import { logger } from '.'

interface IRule {
  value: string
  id: string
}

interface IRuleArgs {
  from: string
  tag?: string
}

interface IRuleSet extends IRuleArgs {
  id: string
  guildId: string
}

interface IAddRuleResponse {
  data?: Array<IRule>
  meta: {
    sent: Date
    summary: {
      created: number
      not_created: number
      valid: number
      invalid: number
    }
  }
  errors?: Array<{
    value: string
    id: string
    title: string
    type: string
  }>
}

interface ITweetData {
  id: string
  text: string
  imageUrls: Array<string>
}

interface ITweetMatches {
  id: number
  tag: string | null
}

interface ITweetResponse {
  data: ITweetData
  matching_rules: Array<ITweetMatches>
}

export interface TweetEvent {
  rule: IRuleSet
  data: ITweetData
}

interface IFetchResponse {
  data: {
    conversation_id: string
    id: string
    text: string
    attachments: {
      media_keys: Array<string>
    }
  }
  includes: {
    media: Array<IMediaResponse>
  }
}

interface IMediaResponse {
  media_key: string
  type: string
  url: string
}

export class TwitterClient extends EventEmitter {

  private client!: Twitter
  private factory!: any

  private rules: Map<string, IRuleSet>

  constructor() {
    super()

    this.rules = new Map<string, IRuleSet>()
    
    const key = process.env.TWITTER_CONSUMER_KEY
    const secret = process.env.TWITTER_CONSUMER_SECRET
    if (!key || !secret) return

    const client = new Twitter({
      consumer_key: key,
      consumer_secret: secret
    })
    this.factory = () => client.stream('tweets/search/stream')

    this.client = client

    this.listen()

  }

  public getRule(id: string) {
    return this.rules.get(id)
  }

  private async listen() {
    try {
      for await (const res of this.factory()) {
        const { data, matching_rules } = res as ITweetResponse
        matching_rules.forEach(item => {
          if (!item.tag) return
          const rule = this.rules.get(item.tag)
          if (!rule) return

          this.client.get<IFetchResponse>(`tweets/${data.id}`, {
            'expansions': 'attachments.media_keys',
            'tweet.fields': 'conversation_id',
            'media.fields': 'media_key,preview_image_url,url',
          }).then(({ data: resData, includes }) => {

            const words = resData.text.split(' ')
            while (words[words.length - 1].match(/^(https:\/\/t.co\/)([a-z]|[A-Z]|[0-9]){10}$/g)) {
              words.pop()
            }

            if (resData.conversation_id === data.id) this.emit('tweet', { data: {
              ...data,
              text: words.join(' '),
              imageUrls: includes.media.map(m => m.url),
            }, rule })

          }).catch(e => {
            console.log(e)
          })

        })
      }

      this.listen()
    } catch (e: any) {
      if (e.message.toLowerCase().startsWith('connectionexception')) {
        logger.warn(`Twitter Stream closed. Reason: ${e.message}\nRetrying in 10 seconds..`)
        const timeout = setTimeout(() => {
          clearTimeout(timeout)
          this.listen()
        }, 10000)
        return
      }
      logger.warn(`Twitter Stream closed. Reason: ${e.message}\nReconnecting..`)
      this.listen()
    }
  }

  public addRule(guildId: string, args: IRuleArgs) {

    const endpoint = 'tweets/search/stream/rules'
    this.client.post(endpoint, {
      add: [
        {
          value: `from:${args.from}`,
          tag: `${args.tag || args.from}`
        }
      ]
    }).then(res => {
      const { data, errors } = res as IAddRuleResponse

      if (errors) {
        const item = errors.shift()
        if (!item) return
        if (item.title === 'DuplicateRule') {
          const id = item.id
          this.client.post(endpoint, {
            delete: {
              ids: [ id ]
            }
          }).then(() => {
            this.addRule(guildId, args)
          })
        }
      } else {

        if (!data) return

        const item = data.shift()
        if (!item) return
  
        if (args.from) logger.debug(`Now tracking Tweets for ${args.from}`)
        this.rules.set(args.tag || args.from, {
          id: item.id,
          guildId,
          ...args
        })

      }

    })
  }

}