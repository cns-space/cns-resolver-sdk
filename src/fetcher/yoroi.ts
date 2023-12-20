import axios, { Axios } from 'axios';

import { CNSFetcher } from './fetcher';
import { CNSMetadata, CNSUserRecord } from '../type';

const yoroiBackend = {
    mainnet: '',
    preprod: 'https://preprod-backend.yoroiwallet.com/',
};

export class YoroiCNS extends CNSFetcher {
    axios: Axios;

    constructor(network: 'mainnet' | 'preprod') {
        super(network);
        this.axios = axios.create({
            baseURL: yoroiBackend[network],
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    getAssetAddress = async (assetHex: string) => {
        const policyId = assetHex.slice(0, 56);
        const assetName = assetHex.slice(56);
        const response = await this.axios.get(
            `api/asset/accounts?policy=${policyId}&asset=${assetName}`,
        );
        return response.data[0];
    };

    getMetadata = async (policyID: string, assetName: string) => {
        const assetNameString = Buffer.from(assetName, 'hex').toString('utf-8');
        const key = `${policyID}.${assetNameString}`;
        const res = await this.axios
            .post('api/multiAsset/metadata', {
                assets: [{ nameHex: assetName, policy: policyID }],
            })
            .then((response) => response.data[key][0].metadata[policyID][assetNameString])
            .catch(() => undefined);
        return res as CNSMetadata;
    };

    getAssetInlineDatum = async (addr: string, assetHex: string) => {
        const policyId = assetHex.slice(0, 56);
        const assetName = assetHex.slice(56);
        const response = await this.axios.post('/api/txs/utxoForAddresses', {
            addresses: [addr],
            asset: { policy: policyId, name: assetName },
        });
        const inlineDatum = response.data[0].inline_datum.plutus_data;
        return inlineDatum as CNSUserRecord;
    };
}
