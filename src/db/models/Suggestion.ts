import { DBModel } from '../db-model'
import { SuggestionStatus } from '../../utils'

interface ISuggestion extends INewSuggestion {
  id: number
  messageId: string
  status: SuggestionStatus
  editorId?: string
  modId?: string
  updatedText?: string
  reason?: string
}

interface INewSuggestion {
  guildId: string
  channelId: string
  text: string
  userId: string
}

interface IFetchArgs {
  id: number
  userId?: string
  guildId?: string
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

  public static fetchById(args: IFetchArgs) {
    return super.fetchOne<Suggestion>(`
      SELECT * FROM ${collection}
        WHERE id = ${args.id}
        ${args.guildId ? `AND "guildId" = '${args.guildId}'` : ''}
        ${args.userId ? `AND "guildId" = '${args.userId}'` : ''}
    `, Suggestion)
  }

  public async update() {
    return super.edit<Suggestion>(`
      UPDATE ${collection} SET
        ${this.data.updatedText ? `updatedText = '${this.data.updatedText.replace(/'/g, "''")}',` : ''}
        ${this.data.messageId ? `"messageId" = '${this.data.messageId}',` : ''}
        ${this.data.editorId ? `"editorId" = '${this.data.editorId}',` : ''}
        ${this.data.modId ? `"modId" = '${this.data.modId}',` : ''}
        ${this.data.reason ? `reason = '${this.data.reason.replace(/'/g, "''")}',` : ''}
        status = '${this.data.status}'
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

  public get updatedText() {
    return this.data.updatedText
  }

  public setUpdatedText(text: string) {
    this.data.updatedText = text
    return this
  }

  public get userId() {
    return this.data.userId
  }

  public get editorId() {
    return this.data.editorId
  }

  public setEditorId(id: string) {
    this.data.editorId = id
    return this
  }

  public get modId() {
    return this.data.modId
  }

  public setModId(id: string) {
    this.data.modId = id
    return this
  }

  public get status() {
    return this.data.status
  }

  public setStatus(status: SuggestionStatus) {
    this.data.status = status
    return this
  }

  public get reason() {
    return this.data.reason
  }

  public setReason(reason: string) {
    this.data.reason = reason
    return this
  }
  
}