/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { Axios } from 'axios';
import { CNSUserRecord } from '../type';
import { CSLParser } from '../utils';
import { CNSFetcher } from './fetcher';

export class BlockfrostCNS extends CNSFetcher {
    axios: Axios;

    constructor(apiKey: string, network: 'mainnet' | 'preprod', parser?: CSLParser) {
        super(network, parser);
        this.axios = axios.create({
            baseURL: `https://cardano-${network}.blockfrost.io/api/v0`,
            headers: {
                project_id: apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    getAssetAddress = async (assetHex: string) => {
        const response = await this.axios.get(`/assets/${assetHex}/addresses`);
        return response.data[0]?.address;
    };

    getMetadata = async (policyID: string, assetName: string) => {
        const res = await this.axios
            .get(`/assets/${policyID}${assetName}`)
            .then((response) => response.data.onchain_metadata)
            .catch(() => undefined);
        return res;
    };

    getAssetInlineDatum = async (_addr: string, assetHex: string) => {
        const txData = await this.axios.get(`/assets/${assetHex}/transactions?order=desc&count=1`);
        const { tx_hash } = txData.data[0];
        const recordTx = await this.axios.get(`/txs/${tx_hash}/utxos`);
        const rawInlineDatum = recordTx.data.outputs.find(
            (o: any) => o.amount.findIndex((a: any) => a.unit === assetHex) !== -1,
        )?.inline_datum;
        const inlineDatum = await this.parser.parseInlineDatum<CNSUserRecord | undefined>(
            rawInlineDatum,
        );
        return inlineDatum;
    };
}
