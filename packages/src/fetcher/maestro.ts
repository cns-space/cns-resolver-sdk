import axios, { Axios } from "axios"
import { hexToString } from "../utils"

export class MaestroCNS {
  axios: Axios

  constructor(apiKey: string, network: "mainnet" | "preprod" | "preview") {
    this.axios = axios.create({
      baseURL: `https://${network}.gomaestro-api.org/v1`,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })
  }

  getAssetAddress = async (assetHex: string) => {
    const response = await this.axios.get(`/assets/${assetHex}/addresses`)
    return response.data.data
  }

  getMetadata = async <T>(policyID: string, assetName: string): Promise<T> => {
    const response = await this.axios.get(`/assets/${policyID}${assetName}`)
    return response.data.data.latest_mint_tx_metadata['721'][policyID][hexToString(assetName)]
  }

  getAssetInlineDatum = async (assetHex: string): Promise<string> => {
    const txData = await this.axios.get(`/assets/${assetHex}/transactions?order=desc&count=1`)
    const { tx_hash } = txData.data[0];
    const recordTx = await this.axios.get(`/transactions/${tx_hash}/utxos`)
    const inlineDatum = recordTx.data.outputs.find((o) => o.amount.findIndex((a) => a.unit === assetHex) !== -1)?.inline_datum
    return inlineDatum
  }
}