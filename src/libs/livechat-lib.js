import config from '../config/config';

let queueMessage = null;

let livechat = {
    state: false,
    queue: [],
    channelId: '483892995565944832',
}

function start(guild) {
    livechat.state = true;
    livechat.queue = [];
    guild.channels.get(livechat.channelId).send(buildQueueMessage()).then(message => {
        queueMessage = message;
        queueMessage.pin();
    });
};

function end() {
    queueMessage.delete();
    livechat.state = false;
};

function addQueue(user){
    livechat.queue.push(user);
    queueMessage.edit(buildQueueMessage());
};

function pick(){
    const user = livechat.queue.splice(0, 1);
    queueMessage.edit(buildQueueMessage());
    return user;
};

function buildQueueMessage(){

    return {embed: {
        title: `**=== :sparkles: PATREON LIVECHAT QUEUE :sparkles: ===**`,
        description: `This is the Question Queue for the Patreon Livechat. If you have any question for Amanda, please add yourself to the queue by typing \`${config.prefix}addqueue\`!`,
        fields: [{
            name: `Queue`,
            value: livechat.queue.length > 0 ? livechat.queue.join(`\n`) : `*Empty*`,
        }],
    }};

}

export {
    livechat,
    start,
    end,
    addQueue,
    pick,
};