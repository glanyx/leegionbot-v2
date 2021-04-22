import { Config, Stop } from './admin'
import { Countdown, Suggestion } from './features'
import { About, Avatar, Info, Ping, User } from './informational'
import { Ban, Blacklist, Kick, Modlog, Mute, Purge, Slowmode, Unban, Unmute, Warn } from './moderation'
import { Join, Play, Queue, Skip, Stop as StopSong } from './music'

import { Help } from './help'

export default [
  Config,
  Stop,

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
  StopSong,

  Help
]