import axios from 'axios'

interface ConfidenceModel {
  confidence: number
  is_detected: boolean
}

interface ApiResponse {
  data: {
    report: {
      version: string
      ai: ConfidenceModel
      human: ConfidenceModel
      dall_e: ConfidenceModel
      midjourney: ConfidenceModel
      stable_diffusion: ConfidenceModel
      this_person_does_not_exist: ConfidenceModel
    }
  }
}

export class ImageTool {

  private static url = 'https://v3-atrium-prod-api.optic.xyz/aion/ai-generated/reports'

  public static validateImage = (imageUrl: string) => {

    return axios({
      method: 'POST',
      url: this.url,
      data: {
        object: imageUrl,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.AIORNOT_KEY,
      }
    })
      .then(({ data }: ApiResponse) => data)
      .catch(e => { throw new Error(e) })

  }

}