import { Shutdown } from './admin'
import { Config } from './configuration'
import { Countdown, Suggestion } from './features'
import { About, Avatar, Info, Ping, User } from './informational'
import { Ban, Blacklist, Kick, Modlog, Mute, Purge, Slowmode, Unban, Unmute, Warn } from './moderation'
import { Join, Play, Queue, Skip, Stop } from './music'

import { Help } from './help'

export default [
  Shutdown,
  
  Config,

  Countdown,
  Suggestion,

  About,
  Avatar,
  Info,
  Ping,
  User,

  Ban,
  Unban,
  Blacklist,
  Kick,
  Modlog,
  Mute,
  Unmute,
  Purge,
  Slowmode,
  Warn,

  Join,
  Play,
  Queue,
  Skip,
  Stop,

  Help
]