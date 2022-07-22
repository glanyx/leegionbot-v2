import { Client, Interaction } from 'discord.js'

export interface HandlerProps {
  client: Client
  interaction: Interaction
  args: Array<string>
}

export abstract class ButtonHandler {

  public static execute: (props: HandlerProps) => void

}