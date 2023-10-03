import { CNSUserRecord, cnsUserRecord } from '../type/cnsUserRecord';
import { PubKeyAddress, ScriptAddress } from '../type/plutus';
import { addrBech32ToObj, stringToHex } from '../utils';

const virtualDomains = [
    ['script', 'addr_test1wpfst96dzagcy3wyz0r7xsm5acpx8w88w7sgjhr33cw347qsch0tg'],
    [
        'test1',
        'addr_test1qrgkr4jwau8wkk0ezf84yruv3uahzlksgxvd2nytzlnqft4x8s2nlvl23f82fut92a82jytnw4k7p0esygk2p626vjdqu58u9n',
    ],
    [
        'test2',
        'addr_test1qpsd53tpeku06nlcf8z4z8pvj9h9w03kc8uze8juh0maxpdx8s2nlvl23f82fut92a82jytnw4k7p0esygk2p626vjdqxcz9u4',
    ],
    ['test3', 'addr_test1vrgkr4jwau8wkk0ezf84yruv3uahzlksgxvd2nytzlnqfts6z879a'],
    [
        'test4',
        'addr_test1qq456nprvuz9djvdu68lt44ajwlaf92qv96ty9cx7qf94dax8s2nlvl23f82fut92a82jytnw4k7p0esygk2p626vjdqlnrz8u',
    ],
];

const socialProfiles: [string, string][] = [
    ['twitter', 'sidanwhatever1'],
    ['instagram', 'sidanwhatever2'],
    ['facebook', 'sidanwhatever3'],
    ['linkedin', 'sidanwhatever4'],
    ['github', 'sidanwhatever5'],
    ['youtube', 'sidanwhatever6'],
    ['email', 'sidanwhatever7'],
];
const otherRecords: [string, string][] = [
    ['otherRecord1', 'otherValue1'],
    ['otherRecord2', 'otherValue2'],
    ['otherRecord3', 'otherValue3'],
    ['otherRecord4', 'otherValue4'],
];

const makeCNSUserRecord = (
    virtualDomainsI: string[][],
    socialProfilesI: string[][],
    otherRecordsI: string[][],
): CNSUserRecord => {
    const virtualDomainsHashes: [string, PubKeyAddress | ScriptAddress][] = [];
    const socialProfilesHexes: [string, string][] = [];
    const otherRecordsHexes: [string, string][] = [];
    virtualDomainsI.forEach(([virtualDomain, bech32Addr]) => {
        const obj: PubKeyAddress | ScriptAddress = addrBech32ToObj(bech32Addr);
        virtualDomainsHashes.push([stringToHex(virtualDomain), obj]);
    });

    socialProfilesI.forEach(([socialProfile, bech32Addr]) => {
        socialProfilesHexes.push([stringToHex(socialProfile), stringToHex(bech32Addr)]);
    });

    otherRecordsI.forEach(([otherRecord, bech32Addr]) => {
        otherRecordsHexes.push([stringToHex(otherRecord), stringToHex(bech32Addr)]);
    });

    const userRecordDatumObj: CNSUserRecord = cnsUserRecord(
        virtualDomainsHashes,
        socialProfilesHexes,
        otherRecordsHexes,
    );
    return userRecordDatumObj;
};

const userRecordDatumObj: CNSUserRecord = makeCNSUserRecord(
    virtualDomains,
    socialProfiles,
    otherRecords,
);
const userRecordDatum = JSON.stringify(userRecordDatumObj);

console.log(userRecordDatum);
