import { init } from '@emurgo/cross-csl-nodejs';
import { CSLParser } from '../utils';
import { CNSMetadata, CNSUserRecord } from '../type';

/**
 * Represents an interface for interacting with a Cardano Name Service (CNS) to
 * retrieve information about assets and metadata.
 */
export abstract class CNSFetcher {
    networkId: number;

    network: 'mainnet' | 'preprod';

    parser: CSLParser;

    constructor(network: 'mainnet' | 'preprod', parser?: CSLParser) {
        this.network = network;
        this.networkId = network === 'mainnet' ? 1 : 0;
        if (parser) {
            this.parser = parser;
        } else {
            this.parser = new CSLParser(init('ctx'));
        }
    }

    /**
     * Retrieves the current address holding an asset identified by its hexadecimal representation.
     *
     * @param assetHex - The hexadecimal representation of the asset.
     * @returns A Promise that resolves to the bech32 address of the asset, or `undefined` if not found.
     */
    abstract getAssetAddress(assetHex: string): Promise<string | undefined>;

    /**
     * Retrieves metadata for an asset based on its policy ID and asset name.
     *
     * @param policyID - The policy ID of the asset in hex.
     * @param assetName - The name of the asset in hex.
     * @returns A Promise that resolves to the metadata of the asset casting to `CNSMetadata` type, or `undefined` if not found.
     */
    abstract getMetadata(policyID: string, assetName: string): Promise<CNSMetadata | undefined>;

    /**
     * Retrieves inline datum for an asset identified by its address and hexadecimal representation.
     *
     * @param addr - The bech32 address of the asset.
     * @param assetHex - The hexadecimal representation of the asset.
     * @returns A Promise that resolves to the inline datum for the asset casting to `CNSUserRecord` type, or `undefined` if not found.
     */
    abstract getAssetInlineDatum(
        addr: string,
        assetHex: string,
    ): Promise<CNSUserRecord | undefined>;
}
