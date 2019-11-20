import Twitter from 'twitter';
import config from '../config/config';

const twitterClient = new Twitter(config.twitter.keys)

exports.run = () => {
    return twitterClient.stream('statuses/filter', {follow: config.twitter.id});
    // return twitterClient.stream('statuses/filter', {track: 'javascript'});
}