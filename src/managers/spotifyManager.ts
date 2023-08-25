import SpotifyWebApi from 'spotify-web-api-node'

export class SpotifyManager {

  private client: SpotifyWebApi

  constructor() {
    this.client = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: 'http://localhost'
    })
  }

}