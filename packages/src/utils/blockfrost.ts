import axios from "axios"

export const blockfrostHeader = (apiKey: string) => ({
  headers: {
    project_id: apiKey,
    'Content-Type': 'application/json'
  }
})

export const blockfrostGet = async (url: string, apiKey: string) => {
  const response = await axios.get(url, blockfrostHeader(apiKey)).then(res => res.data).catch(err => console.log(err))
  return response
}
