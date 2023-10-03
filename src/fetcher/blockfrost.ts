import axios, { Axios } from "axios"
import { parseInlineDatum } from "../utils"

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

  getMetadata = async <T>(policyID: string, assetName: string): Promise<T> => {
    const response = await this.axios.get(`/assets/${policyID}${assetName}`)
    return response.data.onchain_metadata
  }

  getAssetInlineDatum = async <T>(assetHex: string): Promise<T> => {
    const txData = await this.axios.get(`/assets/${assetHex}/transactions?order=desc&count=1`)
    const { tx_hash } = txData.data[0];
    const recordTx = await this.axios.get(`/txs/${tx_hash}/utxos`)
    const rawInlineDatum = recordTx.data.outputs.find((o) => o.amount.findIndex((a) => a.unit === assetHex) !== -1)?.inline_datum
    const inlineDatum = parseInlineDatum<T>(rawInlineDatum)
    return inlineDatum
  }
}