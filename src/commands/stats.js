import * as dateFormatLib from '../libs/dateformat-lib';

exports.run = (client, message, args) => {

    const roles = [
        'super vip',
        'vip',
        'general',
        'lieutenant',
        'corporal',
        'sergeant',
        'private',
        'cadet'
    ];

    let onlineCount = 0;
    message.guild.members.forEach(member => {
        if (member.user.presence.status !== 'offline'){
            onlineCount++;
        }
    })
    
    let roleString = "";

    roles.forEach(preRole => {
        message.guild.roles.forEach(role => {
            if (role.name.toLowerCase() === preRole){
                roleString += `${role}: ${role.members.size} Total Members\n`;
            }
        })
    });

    message.channel.send({embed: {
        title: `**=== ${message.guild.name.toUpperCase()} STATS ===**`,
        description: "",
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL,
        },
        timestamp: new Date(),
        color: 16622136,
        footer: {
            icon_url: message.guild.iconURL,
            text: message.guild.name,
        },
        fields: [
        {
            name: "**Server Name**",
            value: message.guild.name,
        },
        {
            name: "**Server Owner**",
            value: `${message.guild.owner.user}`,
        },
        {
            name: "**Server Creation Date**",
            value: dateFormatLib.format(message.guild.createdAt),
        },
        {
            name: "**Total Members**",
            value: `${message.guild.members.size} Total Members`,
        },
        {
            name: "**Roles**",
            value: roleString,
        },
        {
            name: "**Channels**",
            value: `${message.guild.channels.size} Total Channels`,
        }]
    }});
}