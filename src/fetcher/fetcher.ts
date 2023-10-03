export abstract class CNSFetcher {
    networkId: number;

    network: 'mainnet' | 'preprod';

    constructor(network: 'mainnet' | 'preprod') {
        this.network = network;
        this.networkId = network === 'mainnet' ? 1 : 0;
    }

    abstract getAssetAddress<T extends { address: string }[]>(assetHex: string): Promise<T>;

    abstract getMetadata<T>(policyID: string, assetName: string): Promise<T>;

    abstract getAssetInlineDatum<T>(assetHex: string): Promise<T>;
}
