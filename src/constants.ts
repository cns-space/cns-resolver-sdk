const preprodCnsPolicyID = 'baefdc6c5b191be372a794cd8d40d839ec0dbdd3c28957267dc81700';
const preprodRecordPolicyID = 'a048db3b45c2aa5f1ad472338e6e6dea41a45f4350c8753a231403aa';
const preprodRecordAddress = 'addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5';

// TODO: Change after mainnet launch
const mainnetCnsPolicyID = 'e0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8d';
const mainnetRecordPolicyID = '8efd257c2c38f14b2d426e870418b93f4622289465a700c76aa88e9b';
const mainnetRecordAddress =
    'addr1z84aw2nmec4gn564jy2wnag5pexttgcardc4z36u24ju8kleh7ahm4pdpqxx0mc0wvmu6n025jml40g7pfd0j0vf6aqs8r348q';

export class CNSConstants {
    network: 'mainnet' | 'preprod';

    networkId: number;

    cnsPolicyID: string;

    recordPolicyID: string;

    recordAddress: string;

    constructor(network: 'mainnet' | 'preprod') {
        this.network = network;
        this.networkId = network === 'mainnet' ? 1 : 0;
        this.cnsPolicyID = network === 'mainnet' ? mainnetCnsPolicyID : preprodCnsPolicyID;
        this.recordPolicyID = network === 'mainnet' ? mainnetRecordPolicyID : preprodRecordPolicyID;
        this.recordAddress = network === 'mainnet' ? mainnetRecordAddress : preprodRecordAddress;
    }
}
