import { Sync } from './admin'
import { Ping, Rank, Levels } from './informational'
import { Close, Log, Reply, Setup, Ticket } from './ticket'

export default [
  Close,
  Log,
  Reply,
  Setup,
  Ticket,

  Sync,

  Rank,
  Levels,
  Ping,
]