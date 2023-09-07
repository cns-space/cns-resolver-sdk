import axios, { Axios } from "axios"

export class BlockfrostCNS {
  axios: Axios

  constructor(apiKey: string, network: "mainnet" | "preprod" | "preview") {
    this.axios = axios.create({
      baseURL: `https://cardano-${network}.blockfrost.io/api/v0`,
      headers: {
        project_id: apiKey,
        'Content-Type': 'application/json'
      }
    })
  }

  getAssetAddress = async (assetHex: string) => {
    const response = await this.axios.get(`/assets/${assetHex}/addresses`)
    return response.data
  }

  getMetadata = async <T>(assetHex: string): Promise<T> => {
    const response = await this.axios.get(`/assets/${assetHex}`)
    return response.data.onchain_metadata
  }

  getAssetInlineDatum = async (assetHex: string): Promise<string> => {
    const txData = await this.axios.get(`/assets/${assetHex}/transactions?order=desc&count=1`)
    const { tx_hash } = txData.data[0];
    const recordTx = await this.axios.get(`/txs/${tx_hash}/utxos`)
    const inlineDatum = recordTx.data.outputs.find((o) => o.amount.findIndex((a) => a.unit === assetHex) !== -1)?.inline_datum
    return inlineDatum
  }
}