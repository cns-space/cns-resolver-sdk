import {
    validateCNSUserRecord,
    validateExpiry,
    validateVirtualSubdomainEnabled,
} from '../validators';
import { CNSMetadata, CNSUserRecord, ParsedCNSUserRecord, SocialRecord } from '../type';
import { CNSFetcher } from '../fetcher/fetcher';
import { CNSConstants } from '../constants';
import { hexToString, objToHex, parseAssocMap, parsePlutusAddressToBech32 } from '../utils';

export class CNSResolver {
    fetcher: CNSFetcher;

    constants: CNSConstants;

    constructor(fetcher: CNSFetcher) {
        this.fetcher = fetcher;
        this.constants = new CNSConstants(fetcher.network);
    }

    resolveAddress = async (cnsName: string): Promise<string> => {
        const deconstructedCns = cnsName.split('.');
        if (deconstructedCns.length === 2) return this.resolveDomain(cnsName);
        if (deconstructedCns.length === 3) return this.resolveVirtualSubdomain(cnsName);
        return 'Invalid domain / virtual domain';
    };

    private resolveDomain = async (cnsName: string): Promise<string> => {
        const assetName = Buffer.from(cnsName).toString('hex');
        const assetHex = `${this.constants.cnsPolicyID}${assetName}`;

        const metadata: CNSMetadata = await this.fetcher.getMetadata(
            this.constants.cnsPolicyID,
            assetName,
        );

        if (!validateExpiry(metadata)) return 'CNS expired';

        const data = await this.fetcher.getAssetAddress(assetHex);
        if (!data) return 'CNS not found';

        const { address } = data[0];
        return address;
    };

    resolveUserRecord = async (cnsName: string): Promise<ParsedCNSUserRecord | string> => {
        const assetName = Buffer.from(cnsName).toString('hex');

        const metadata: CNSMetadata = await this.fetcher.getMetadata(
            this.constants.cnsPolicyID,
            assetName,
        );

        if (!validateExpiry(metadata)) return 'CNS expired';

        const recordAssetHex = `${this.constants.recordPolicyID}${assetName}`;
        const inlineDatum: CNSUserRecord = await this.fetcher.getAssetInlineDatum(recordAssetHex);

        if (!validateCNSUserRecord(inlineDatum)) return 'Invalid user record';
        if (!validateVirtualSubdomainEnabled(metadata))
            console.log('Virtual subdomain is not enabled');

        const parsedInlineDatum: ParsedCNSUserRecord = {
            virtualSubdomains: validateVirtualSubdomainEnabled(metadata)
                ? parseAssocMap(inlineDatum.fields[0], (item) =>
                      parsePlutusAddressToBech32(objToHex(item), this.fetcher.networkId || 0),
                  )
                : [],
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
