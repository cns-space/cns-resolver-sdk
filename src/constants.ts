const preprodCnsPolicyID = 'ab4e38cc1e95e42c6f6e56d8d4243731c483bb57e49da5047c38e9d8';
const preprodRecordPolicyID = 'c0f778be07f8b129d2546ad37b0e13b3486747dfe1767ff8e7e8a4f3';

// TODO: Change after mainnet launch
const mainnetCnsPolicyID = '';
const mainnetRecordPolicyID = '';

export class CNSConstants {
    network: 'mainnet' | 'preprod';

    networkId: number;

    cnsPolicyID: string;

    recordPolicyID: string;

    constructor(network: 'mainnet' | 'preprod') {
        this.network = network;
        this.networkId = network === 'mainnet' ? 1 : 0;
        this.cnsPolicyID = network === 'mainnet' ? mainnetCnsPolicyID : preprodCnsPolicyID;
        this.recordPolicyID = network === 'mainnet' ? mainnetRecordPolicyID : preprodRecordPolicyID;
    }
}
