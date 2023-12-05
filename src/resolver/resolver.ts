import { init } from '@emurgo/cross-csl-nodejs';
import { WasmModuleProxy } from '@emurgo/cross-csl-core';
import {
    validateCNSUserRecord,
    validateExpiry,
    validateVirtualSubdomainEnabled,
} from '../validators';
import { ParsedCNSUserRecord, SocialRecord } from '../type';
import { CNSFetcher } from '../fetcher/fetcher';
import { CNSConstants } from '../constants';
import { CSLParser, hexToString, parseAssocMap, parseAssocMapAsync } from '../utils';

export class CNSResolver {
    fetcher: CNSFetcher;

    constants: CNSConstants;

    parser: CSLParser;

    constructor(fetcher: CNSFetcher, parserProxy?: WasmModuleProxy) {
        this.fetcher = fetcher;
        if (parserProxy) {
            this.parser = new CSLParser(parserProxy);
        } else {
            this.parser = new CSLParser(init('ctx'));
        }
        this.fetcher.parser = this.parser;
        this.constants = new CNSConstants(fetcher.network);
    }

    resolveAddress = async (cnsName: string): Promise<string> => {
        const deconstructedCns = cnsName.split('.');
        if (deconstructedCns.length === 2) {
            const address = await this.resolveDomain(cnsName);
            return address;
        }
        if (deconstructedCns.length === 3) {
            const address = await this.resolveVirtualSubdomain(cnsName);
            return address;
        }
        return 'Invalid domain / virtual domain';
    };

    private resolveDomain = async (cnsName: string): Promise<string> => {
        const assetName = Buffer.from(cnsName).toString('hex');
        const assetHex = `${this.constants.cnsPolicyID}${assetName}`;

        const metadata = await this.fetcher.getMetadata(this.constants.cnsPolicyID, assetName);
        if (!metadata) return 'CNS not found';
        if (!validateExpiry(metadata)) return 'CNS expired';

        const address = await this.fetcher.getAssetAddress(assetHex);
        if (!address) return 'CNS not found';

        return address;
    };

    resolveUserRecord = async (cnsName: string): Promise<ParsedCNSUserRecord | string> => {
        const assetName = Buffer.from(cnsName).toString('hex');

        const metadata = await this.fetcher.getMetadata(this.constants.cnsPolicyID, assetName);
        if (!metadata) return 'CNS not found';
        if (!validateExpiry(metadata)) return 'CNS expired';

        const recordAssetHex = `${this.constants.recordPolicyID}${assetName}`;
        const inlineDatum = await this.fetcher.getAssetInlineDatum(
            this.constants.recordAddress,
            recordAssetHex,
        );

        if (!inlineDatum) return 'User record not found';
        if (!validateCNSUserRecord(inlineDatum)) return 'Invalid user record';
        const virtualSubdomains = await parseAssocMapAsync(inlineDatum.fields[0], async (item) => {
            const itemHex = await this.parser.objToHex(item);
            const bech32 = await this.parser.parsePlutusAddressToBech32(
                itemHex,
                this.fetcher.networkId || 0,
            );
            return bech32;
        });
        const parsedInlineDatum: ParsedCNSUserRecord = {
            virtualSubdomains: validateVirtualSubdomainEnabled(metadata) ? virtualSubdomains : [],
            socialProfiles: parseAssocMap(inlineDatum.fields[1], (item) => hexToString(item.bytes)),
            otherRecords: parseAssocMap(inlineDatum.fields[2], (item) => hexToString(item.bytes)),
        };

        return parsedInlineDatum;
    };
    // Example:
    // resolveUserRecord('bbb.ada').then((res) => console.log(res));

    resolveVirtualSubdomains = async (cnsName: string): Promise<string[][] | string> => {
        const parsedUserRecord = await this.resolveUserRecord(cnsName);
        if (typeof parsedUserRecord === 'string') return parsedUserRecord;
        return parsedUserRecord.virtualSubdomains;
    };
    // Example:
    // resolveVirtualSubdomains('bbb.ada').then((res) => console.log(res));

    private resolveVirtualSubdomain = async (virtualDomain: string): Promise<string> => {
        const [target, cnsName, ext] = virtualDomain.split('.');

        const virtualDomains = await this.resolveVirtualSubdomains(`${cnsName}.${ext}`);
        if (typeof virtualDomains === 'string') return virtualDomains;

        const resolvedVirtualDomain = virtualDomains?.find(([key]) => key === target);
        if (!resolvedVirtualDomain) return 'Virtual domain not found';

        return resolvedVirtualDomain[1];
    };

    resolveSocialRecords = async (cnsName: string): Promise<string[][] | string> => {
        const parsedUserRecord = await this.resolveUserRecord(cnsName);
        if (typeof parsedUserRecord === 'string') return parsedUserRecord;
        return parsedUserRecord.socialProfiles;
    };
    // // Example
    // resolveSocialRecords('bbb.ada').then((res) => console.log(res));

    resolveSocialRecord = async (cnsName: string, socialName: SocialRecord): Promise<string> => {
        const socialRecords = await this.resolveSocialRecords(cnsName);
        if (typeof socialRecords === 'string') return socialRecords;

        const resolvedSocialRecord = socialRecords?.find(([key]) => key === socialName);
        if (!resolvedSocialRecord) return 'Social record not found';

        return resolvedSocialRecord[1];
    };

    resolveOtherRecords = async (cnsName: string): Promise<string[][] | string> => {
        const parsedUserRecord = await this.resolveUserRecord(cnsName);
        if (typeof parsedUserRecord === 'string') return parsedUserRecord;
        return parsedUserRecord.otherRecords;
    };

    resolveOtherRecord = async (cnsName: string, otherName: string): Promise<string> => {
        const otherRecords = await this.resolveOtherRecords(cnsName);
        if (typeof otherRecords === 'string') return otherRecords;

        const resolvedOtherRecord = otherRecords?.find(([key]) => key === otherName);
        if (!resolvedOtherRecord) return 'Other record not found';

        return resolvedOtherRecord[1];
    };
}
