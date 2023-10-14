const preprodCnsPolicyID = 'baefdc6c5b191be372a794cd8d40d839ec0dbdd3c28957267dc81700';
const preprodRecordPolicyID = 'a048db3b45c2aa5f1ad472338e6e6dea41a45f4350c8753a231403aa';
const preprodRecordAddress = 'addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5';

// TODO: Change after mainnet launch
const mainnetCnsPolicyID = '';
const mainnetRecordPolicyID = '';
const mainnetRecordAddress = '';

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
