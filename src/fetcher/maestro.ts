/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { Axios } from 'axios';
import { hexToString } from '../utils';
import { CNSFetcher } from './fetcher';

export class MaestroCNS extends CNSFetcher {
    axios: Axios;

    constructor(apiKey: string, network: 'mainnet' | 'preprod' | 'preview') {
        super(network);
        this.axios = axios.create({
            baseURL: `https://${network}.gomaestro-api.org/v1`,
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    getAssetAddress = async (assetHex: string) => {
        const response = await this.axios.get(`/assets/${assetHex}/addresses`);
        return response.data.data;
    };

    getMetadata = async <T>(policyID: string, assetName: string): Promise<T> => {
        const response = await this.axios.get(`/assets/${policyID}${assetName}`);
        return response.data.data.latest_mint_tx_metadata['721'][policyID][hexToString(assetName)];
    };

    getAssetInlineDatum = async <T>(assetHex: string): Promise<T> => {
        const txData = await this.axios.get(`/assets/${assetHex}/txs?order=desc&count=1`);
        const { tx_hash } = txData.data.data[0];
        const recordTx = await this.axios.get(`/transactions/${tx_hash}`);
        const inlineDatum = recordTx.data.data.outputs.find(
            (o: any) => o.assets.findIndex((a: any) => a.unit === assetHex) !== -1,
        )?.datum.json;
        return inlineDatum;
    };
}
