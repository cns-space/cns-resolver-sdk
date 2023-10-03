import {
    validateCNSUserRecord,
    validateExpiry,
    validateVirtualSubdomainEnabled,
} from '../validators';
import { CNSMetadata, CNSUserRecord, ParsedCNSUserRecord } from '../type';
import { CNSFetcher } from '../fetcher/fetcher';
import { cnsPolicyID, recordPolicyID } from '../constants';
import { hexToString, objToHex, parseAssocMap, parsePlutusAddressToBech32 } from '../utils';

export class CNSResolver {
    fetcher: CNSFetcher;

    constructor(fetcher: CNSFetcher) {
        this.fetcher = fetcher;
    }

    resolveAddress = async (cnsName: string): Promise<string> => {
        const assetName = Buffer.from(cnsName).toString('hex');
        const assetHex = `${cnsPolicyID}${assetName}`;

        const metadata: CNSMetadata = await this.fetcher.getMetadata(cnsPolicyID, assetName);

        if (!validateExpiry(metadata)) return 'CNS expired';

        const data = await this.fetcher.getAssetAddress(assetHex);
        if (!data) return 'CNS not found';

        const { address } = data[0];
        return address;
    };

    resolveUserRecord = async (cnsName: string): Promise<ParsedCNSUserRecord | string> => {
        const assetName = Buffer.from(cnsName).toString('hex');

        const metadata: CNSMetadata = await this.fetcher.getMetadata(cnsPolicyID, assetName);

        if (!validateExpiry(metadata)) return 'CNS expired';

        const recordAssetHex = `${recordPolicyID}${assetName}`;
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

    resolveVirtualSubdomain = async (virtualDomain: string): Promise<string> => {
        const [target, cnsName, ext] = virtualDomain.split('.');
        if (!target || !cnsName || !ext) return 'Invalid virtual domain';

        const virtualDomains = await this.resolveVirtualSubdomains(`${cnsName}.${ext}`);
        if (typeof virtualDomains === 'string') return virtualDomains;

        const resolvedVirtualDomain = virtualDomains?.find(([key]) => key === target);
        if (!resolvedVirtualDomain) return 'Virtual domain not found';

        return resolvedVirtualDomain[1];
    };
    // Example
    // resolveVirtualSubdomain('456.bbb.ada').then((res) => console.log(res));

    resolveSocialRecords = async (cnsName: string): Promise<string[][] | string> => {
        const parsedUserRecord = await this.resolveUserRecord(cnsName);
        if (typeof parsedUserRecord === 'string') return parsedUserRecord;
        return parsedUserRecord.socialProfiles;
    };
    // // Example
    // resolveSocialRecords('bbb.ada').then((res) => console.log(res));

    resolveOtherRecords = async (cnsName: string): Promise<string[][] | string> => {
        const parsedUserRecord = await this.resolveUserRecord(cnsName);
        if (typeof parsedUserRecord === 'string') return parsedUserRecord;
        return parsedUserRecord.otherRecords;
    };
    // // Example
    // resolveOtherRecords('bbb.ada').then((res) => console.log(res));
}
