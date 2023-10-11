import { CNSMetadata, CNSUserRecord } from '../type';

export abstract class CNSFetcher {
    networkId: number;

    network: 'mainnet' | 'preprod';

    constructor(network: 'mainnet' | 'preprod') {
        this.network = network;
        this.networkId = network === 'mainnet' ? 1 : 0;
    }

    abstract getAssetAddress(assetHex: string): Promise<string | undefined>;

    abstract getMetadata(policyID: string, assetName: string): Promise<CNSMetadata>;

    abstract getAssetInlineDatum(
        addr: string,
        assetHex: string,
    ): Promise<CNSUserRecord | undefined>;
}
