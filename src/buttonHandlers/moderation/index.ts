import { ButtonHandler } from '../handler'
import { QuickKick } from './quickkick'
import { QuickTimeout } from './quicktimeout'
import { QuickBan } from './quickban'

export const ModerationButtons: Array<typeof ButtonHandler> = [
  QuickKick,
  QuickTimeout,
  QuickBan,
]