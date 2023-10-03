const preprodCnsPolicyID = 'fc0e0323b254c0eb7275349d1e32eb6cc7ecfd03f3b71408eb46d751';
const preprodRecordPolicyID = '3cb87ba516477b0790ce10e8c5c35e6ce5f4ef0c9d10afb945bbdc91';

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
