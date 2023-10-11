const preprodCnsPolicyID = 'ab4e38cc1e95e42c6f6e56d8d4243731c483bb57e49da5047c38e9d8';
const preprodRecordPolicyID = '08639fb15c8998bce333f9fa81214b3250da45262162999a56d21b76';
const preprodRecordAddress = 'addr_test1wr28gyqex4z75w2wmcss6ytkr4s2us36q2etdtjv3fgscfsp8d733';

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
