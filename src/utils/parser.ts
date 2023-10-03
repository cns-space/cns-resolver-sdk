import csl from '@emurgo/cardano-serialization-lib-nodejs';
import { AssocMap, BuiltinByteString } from '../type/plutus';

export const stringToHex = (str: string) => Buffer.from(str, 'utf8').toString('hex');

export const hexToString = (hex: string) => Buffer.from(hex, 'hex').toString('utf8');

export const parseInlineDatum = <T>(inlineDatum: string): T => {
    const datum = csl.PlutusData.from_hex(inlineDatum).to_json(1);
    const parsed = JSON.parse(datum);
    return parsed;
};

export const parseAssocMap = <T>(
    assocMapVal: AssocMap<BuiltinByteString, T>,
    itemParser: (args0: T) => string,
    limit = 5,
): string[][] => {
    const parsedAssocMap: string[][] = [];
    for (let i = 0; i < limit; i += 1) {
        if (i >= assocMapVal.map.length) break;
        const mapItem = assocMapVal.map[i];
        const key = hexToString(mapItem.k.bytes);
        const value = itemParser(mapItem.v);
        parsedAssocMap.push([key, value]);
    }
    return parsedAssocMap;
};

export const hexToObj = <T>(hex: string): T => JSON.parse(csl.PlutusData.from_hex(hex).to_json(1));

export const objToHex = <T>(obj: T): string =>
    csl.PlutusData.from_json(JSON.stringify(obj), 1).to_hex();

export const addrBech32ToObj = <T>(bech32: string): T => {
    const hexAddress = csl.Address.from_bech32(bech32).to_hex();
    const cslAddress = csl.Address.from_hex(hexAddress);
    const json = JSON.parse(csl.PlutusData.from_address(cslAddress).to_json(1));
    return json;
};

export const addrBech32ToHex = (bech32: string): string => {
    const hexAddress = csl.Address.from_bech32(bech32).to_hex();
    const cslAddress = csl.Address.from_hex(hexAddress);
    const hex = csl.PlutusData.from_address(cslAddress).to_hex();
    return hex;
};

export const parsePlutusAddressToBech32 = (plutusHex: string, networkId = 0): string => {
    const cslPlutusDataAddress = csl.PlutusData.from_hex(plutusHex);
    const plutusDataAddressObject = JSON.parse(
        cslPlutusDataAddress.to_json(csl.PlutusDatumSchema.DetailedSchema),
    );
    const plutusDataPaymentKeyObject = plutusDataAddressObject.fields[0];
    const plutusDataStakeKeyObject = plutusDataAddressObject.fields[1];
    const cslPaymentKeyHash = plutusDataPaymentKeyObject.fields[0].bytes;

    // Take into account whether the hash is a PubKeyHash or ScriptHash
    const cslPaymentCredential =
        plutusDataPaymentKeyObject.constructor === 0
            ? csl.StakeCredential.from_keyhash(csl.Ed25519KeyHash.from_hex(cslPaymentKeyHash))
            : csl.StakeCredential.from_scripthash(csl.ScriptHash.from_hex(cslPaymentKeyHash));
    let bech32Addr = '';

    // Parsing address according to whether it has a stake key
    if (
        plutusDataStakeKeyObject.constructor === 0 &&
        plutusDataStakeKeyObject.fields.length !== 0
    ) {
        const cslStakeKeyHash = csl.Ed25519KeyHash.from_hex(
            plutusDataStakeKeyObject.fields[0].fields[0].fields[0].bytes,
        );
        const cslBaseAddress = csl.BaseAddress.new(
            networkId,
            cslPaymentCredential,
            csl.StakeCredential.from_keyhash(cslStakeKeyHash),
        );
        bech32Addr = cslBaseAddress.to_address().to_bech32();
    } else {
        const cslEnterpriseAddress = csl.EnterpriseAddress.new(networkId, cslPaymentCredential);
        bech32Addr = cslEnterpriseAddress.to_address().to_bech32();
    }

    return bech32Addr;
};
