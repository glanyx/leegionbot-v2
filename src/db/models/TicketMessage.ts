import { DBModel } from '../db-model'

interface ITicketMessage extends ITicketMessageArgs {
  id: number
  timestamp: Date
}

interface ITicketMessageArgs {
  conversationId: number
  senderId: string
  text?: string
  attachmentUrl?: string
}

const collection = 'ticket_message'

export class TicketMessage extends DBModel<ITicketMessage> {

  public collection = collection

  public static async storeNew({
    conversationId,
    senderId,
    text,
    attachmentUrl
  }: ITicketMessageArgs) {
    return super.create<TicketMessage>(`
      INSERT INTO ${collection} ("conversationId", "senderId", text, "attachmentUrl") VALUES (
        ${conversationId},
        '${senderId}',
        ${text ? `'${text.replace(/'/g, "''")}'` : null},
        ${attachmentUrl ? `'${attachmentUrl}'` : null}
      )
    `, TicketMessage)
  }

  public static async fetchByConversation(conversationId: number) {
    return super.query<TicketMessage>(`
      SELECT * FROM ${collection}
      WHERE "conversationId" = ${conversationId}
    `, TicketMessage)
  }

  public get id() {
    return this.data.id
  }

  public get conversationId() {
    return this.data.conversationId
  }

  public get senderId() {
    return this.data.senderId
  }

  public get text() {
    return this.data.text
  }

  public get attachmentUrl() {
    return this.data.attachmentUrl
  }

  public get timestamp() {
    return this.data.timestamp
  }

}