import { ButtonHandler } from './handler'
import { Rolegate } from './rolegate'
import { Rolemenu } from './rolemenu'
import { ModerationButtons } from './moderation'

export const ButtonHandlers: Array<typeof ButtonHandler> = [
    Rolegate,
    Rolemenu,
    ...ModerationButtons
]