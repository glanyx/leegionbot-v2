import { DBModel } from '../db-model'
import { ConversationStatus } from '../../utils'

interface ITicketConversation extends INewTicketConversation {
  id: number
}

interface INewTicketConversation {
  guildId: string
  channelId: string
  userId: string
  status: ConversationStatus
}

const convCollection = 'ticket_conversations'

export class TicketConversation extends DBModel<ITicketConversation> {

  public collection = convCollection

  public static async add(conversation: INewTicketConversation) {
    return super.create<TicketConversation>(`
      INSERT INTO ${convCollection} ("guildId", "channelId", "userId", status) VALUES (
        '${conversation.guildId}',
        '${conversation.channelId}',
        '${conversation.userId}',
        '${conversation.status}'
      )
    `, TicketConversation)
  }

  public static async fetchById(id: number) {
    return super.fetchOne<TicketConversation>(`
      SELECT * FROM ${convCollection}
      WHERE id = id
    `, TicketConversation)
  }

  public static async fetchOngoingForUserId(userId: string) {
    return super.query<TicketConversation>(`
      SELECT * FROM ${convCollection}
        WHERE "userId" = '${userId}'
        AND status = '${ConversationStatus.ONGOING}'
    `, TicketConversation)
  }

  public static async fetchAllOngoing() {
    return super.query<TicketConversation>(`
      SELECT * FROM ${convCollection}
        WHERE status = '${ConversationStatus.ONGOING}'
    `, TicketConversation)
  }

  public async update() {
    return super.edit<TicketConversation>(`
      UPDATE ${convCollection} SET
        status = '${this.data.status}',
      WHERE id = ${this.data.id}
    `, TicketConversation)
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

  public get userId() {
    return this.data.userId
  }

  public get status() {
    return this.data.status
  }

  public setStatus = (status: ConversationStatus) => {
    this.data.status = status
    return this
  }

}

interface ITicketMessage extends INewTicketMessage {
  id: number
}

interface INewTicketMessage {
  conversationId: number
  userId: string
  text: string
  attachmentCount: number
}

const msgCollection = 'ticket_messages'

export class TicketMessage extends DBModel<ITicketMessage> {

  public collection = msgCollection

  public static async add(message: INewTicketMessage) {
    return super.create<TicketMessage>(`
      INSERT INTO ${msgCollection} ("conversationId", "userId", text, "attachmentCount") VALUES (
        ${message.conversationId},
        '${message.userId}',
        '${message.text}',
        ${message.attachmentCount}
      )
    `, TicketMessage)
  }

  public static async fetchByConversationId(id: number) {
    return super.query<TicketMessage>(`
      SELECT * FROM ${msgCollection}
      WHERE "conversationId" = ${id}
    `, TicketMessage)
  }

  public static async fetchById(id: number) {
    return super.fetchOne<TicketMessage>(`
      SELECT * FROM ${msgCollection}
      WHERE id = ${id}
    `, TicketMessage)
  }

  public get id() {
    return this.data.id
  }

  public get conversationId() {
    return this.data.conversationId
  }

  public get text() {
    return this.data.text
  }

  public get attachmentCount() {
    return this.data.attachmentCount
  }

  public get userId() {
    return this.data.userId
  }

}