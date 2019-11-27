import { livechat, addQueue } from '../libs/livechat-lib';

exports.run = async (client, message, args) => {

    if (livechat.state){
        if (livechat.queue.includes(message.author)){
            message.channel.send(`You're already in the queue!`);
        } else {
            addQueue(message.author);
            message.channel.send(`Your name has been added to the queue, ${message.author}!`);
        }
    } else {
        message.channel.send('There is no Livechat active!');
    }

} 