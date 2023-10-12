/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaestroClient, Configuration } from '@maestro-org/typescript-sdk';
import { CNSMetadata, CNSUserRecord } from '../type';
import { hexToString } from '../utils';
import { CNSFetcher } from './fetcher';

interface FullCNSMetaData {
    [key: string]: {
        [key: string]: {
            [key: string]: CNSMetadata;
        };
    };
}

export class MaestroCNS extends CNSFetcher {
    maestro: MaestroClient;

    constructor(apiKey: string, network: 'mainnet' | 'preprod') {
        super(network);
        this.maestro = new MaestroClient(
            new Configuration({
                apiKey,
                network: network === 'mainnet' ? 'Mainnet' : 'Preprod',
            }),
        );
    }

    getAssetAddress = async (assetHex: string) => {
        const response = await this.maestro.assets.assetAddresses(assetHex);
        return response.data.data[0]?.address;
    };

    getMetadata = async (policyID: string, assetName: string) => {
        const res = await this.maestro.assets
            .assetInfo(policyID + assetName)
            .then((response) => {
                const fullMetadata = response.data.data.latest_mint_tx_metadata as FullCNSMetaData;
                return fullMetadata['721'][policyID][hexToString(assetName)] as CNSMetadata;
            })
            .catch(() => undefined);
        return res;
    };

    getAssetInlineDatum = async (addr: string, assetHex: string) => {
        const txData = await this.maestro.addresses.utxosByAddress(addr, { asset: assetHex });
        return txData.data.data[0]?.datum?.json as CNSUserRecord;
    };
}
