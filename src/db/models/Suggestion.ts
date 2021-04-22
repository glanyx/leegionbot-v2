import { DBModel } from '../db-model'
import { SuggestionStatus } from '../../utils'

interface ISuggestion extends INewSuggestion {
  id: number
  messageId: string
  status: SuggestionStatus
  editorId?: string
  modId?: string
}

interface INewSuggestion {
  guildId: string
  channelId: string
  text: string
  userId: string
}

const collection = 'suggestions'

export class Suggestion extends DBModel<ISuggestion> {

  public collection = collection

  public static async addSuggestion(suggestion: INewSuggestion) {
    return super.create<Suggestion>(`
      INSERT INTO ${collection} ("guildId", "channelId", text, "userId") VALUES (
        '${suggestion.guildId}',
        '${suggestion.channelId}',
        '${suggestion.text.replace(/'/g, "''")}',
        '${suggestion.userId}'
      )
    `, Suggestion)
  }

  public async update() {
    return super.edit<Suggestion>(`
      UPDATE ${collection} SET
        "messageId" = '${this.data.messageId}'
      WHERE id = ${this.data.id}
    `, Suggestion)
  }

  public get id() {
    return this.data.id
  }

  public get guildId() {
    return this.data.guildId
  }

  public get channelId() {
    return this.data.channelId
  }

  public get messageId() {
    return this.data.messageId
  }

  public setMessageId(messageId: string) {
    this.data.messageId = messageId
    return this
  }

  public get text() {
    return this.data.text
  }

  public get userId() {
    return this.data.userId
  }

  public get editorId() {
    return this.data.editorId
  }

  public get modId() {
    return this.data.modId
  }

  public get status() {
    return this.data.status
  }
  
}