import { Client, Message } from "discord.js"
import { Timer, getTimerValue } from '../handlers/timerHandler'

/**
 * @param {Array} args
 * @param {Message} message
 * @param {Client} client
 */
exports.run = async (client, message, args) => {

  // Check for user permissions
  if (!message.member.hasPermission('MANAGE_CHANNELS')) {
    message.channel.send(`You don't have the server permissions required to create a countdown!`)
    return
  }

  let name = 'Timer'

  const firstArg = args.shift()

  if (firstArg.indexOf(':') < 0 && firstArg.indexOf('/') < 0) {
    name = firstArg
  } else {
    args = [...args, firstArg]
  }

  const date = asDate(args.join(' '));

  if (!date) {
    message.channel.send('Couldn\'t parse date.');
    return
  }

  const everyoneRole = message.guild.roles.everyone

  const options = {
    type: 'voice',
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        allow: ['VIEW_CHANNEL'],
        deny: ['CONNECT']
      }
    ]
  }

  const timerData = getTimerValue(date)

  try {
    const channel = await message.guild.channels.create(`${name} - ${timerData}`, options)
    const timer = await new Timer(name, message.guild.id, channel.id, date).create()
    timer.start()
  } catch (e) {
    console.log(e)
  }

}

exports.help = {
  name: "countdown",
  category: "Timers",
  description: "Creates a new timer channel that is updated once every 5 minutes. Date must be provided in European format (dd/mm/yy(yy)). Time must be provided in GMT.",
  usage: "countdown [channel name] [date | time | datetime]"
}

/**
 * 
 * @param {String} dateString 
 * @returns {Date|Boolean}
 */
const asDate = (dateString) => {

  let date = new Date(dateString)
  if (dateString.indexOf('/') >= 0) date = new Date('invalid')

  if (isNaN(date.getDate())) {

    const dateTime = dateString.split(' ')

    if (dateTime.length > 2) return false
    if (dateTime.length === 1) {
      if (dateTime[0].indexOf(':') >= 0) {
        const today = new Date()
        dateTime.splice(0, 0, `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`)
      } else {
        dateTime.push('00:00')
      }
    }

    const dateHalf = dateTime[0]
    const timeHalf = dateTime[1]

    let dateArray = []

    if (dateHalf.indexOf('/') >= 0) {
      dateArray = dateHalf.split('/')
    }
  
    if (dateHalf.indexOf('-') >= 0) {
      dateArray = dateHalf.split('-')
    }
    
    if (dateArray.length > 3) return false
    if (dateArray.length === 2) {
      if (dateArray[1].length === 4) {
        dateArray.splice(0, 0, '1')
      } else {
        const today = new Date()
        dateArray.push(`${today.getFullYear()}`)
      }
    }

    const timeArray = timeHalf.split(':')

    const parsedDate = new Date(dateArray[2], parseInt(dateArray[1])-1, dateArray[0], timeArray[0], timeArray[1], timeArray[2] ? timeArray[2] : '0')

    if (isNaN(parsedDate.getDate())){
      return false
    }

    return parsedDate
  
  } else {

    return date

  }

}