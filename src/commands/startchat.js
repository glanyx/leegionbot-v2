import { livechat, start } from '../libs/livechat-lib';

exports.run = async (client, message, args) => {

    if(message.member.hasPermission('ADMINISTRATOR') || message.member.hasPermission('MANAGE_GUILD')){

        if (livechat.state){
            message.channel.send('Livechat is already active!');
        } else {
            start();
        }

    } else {
        message.channel.send(`You don't have the required permissions to perform this action!`);
    }

} 