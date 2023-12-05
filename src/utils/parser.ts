import { WasmModuleProxy } from '@emurgo/cross-csl-core';
import { AssocMap, BuiltinByteString } from '../type/plutus';

export const stringToHex = (str: string) => Buffer.from(str, 'utf8').toString('hex');

export const hexToString = (hex: string) => Buffer.from(hex, 'hex').toString('utf8');

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

export const parseAssocMapAsync = async <T>(
    assocMapVal: AssocMap<BuiltinByteString, T>,
    itemParser: (args0: T) => Promise<string>,
    limit = 5,
): Promise<string[][]> => {
    const parsedAssocMap: string[][] = [];
    const promises: Promise<string>[] = [];
    for (let i = 0; i < limit; i += 1) {
        if (i >= assocMapVal.map.length) break;
        const mapItem = assocMapVal.map[i];
        promises.push(itemParser(mapItem.v));
    }
    const valueArray = await Promise.all(promises);
    for (let i = 0; i < limit; i += 1) {
        if (i >= assocMapVal.map.length) break;
        const mapItem = assocMapVal.map[i];
        const key = hexToString(mapItem.k.bytes);
        const value = valueArray[i];
        parsedAssocMap.push([key, value]);
    }
    return parsedAssocMap;
};

export class CSLParser {
    csl: WasmModuleProxy;

    constructor(csl: WasmModuleProxy) {
        this.csl = csl;
    }

    parseInlineDatum = async <T>(inlineDatum: string): Promise<T> => {
        const datum = await this.csl.PlutusData.fromHex(inlineDatum);
        const jsonDatum = await datum.toJson(1);
        const parsed = JSON.parse(jsonDatum);
        return parsed;
    };

    hexToObj = async <T>(hex: string): Promise<T> => {
        const plutusData = await this.csl.PlutusData.fromHex(hex);
        const plutusDataJson = await plutusData.toJson(1);
        return JSON.parse(plutusDataJson);
    };

    objToHex = async <T>(obj: T): Promise<string> => {
        const plutusData = await this.csl.PlutusData.fromJson(JSON.stringify(obj), 1);
        const result = await plutusData?.toHex();
        return result || '';
    };

    // addrBech32ToObj = <T>(bech32: string): T => {
    //     const hexAddress = csl.Address.from_bech32(bech32).to_hex();
    //     const cslAddress = csl.Address.from_hex(hexAddress);
    //     const json = JSON.parse(csl.PlutusData.from_address(cslAddress).to_json(1));
    //     return json;
    // };
    addrBech32ToObj = async <T>(bech32: string): Promise<T> => {
        const cslAddress = await this.csl.Address.fromBech32(bech32);
        const bytesAddress = await cslAddress.toBytes();
        const plutusData = await this.csl.PlutusData.fromBytes(bytesAddress);
        const plutusDataJson = await plutusData.toJson(1);
        const obj = JSON.parse(plutusDataJson);
        return obj;
    };

    // addrBech32ToHex = (bech32: string): string => {
    //     const hexAddress = csl.Address.from_bech32(bech32).to_hex();
    //     const cslAddress = csl.Address.from_hex(hexAddress);
    //     const hex = csl.PlutusData.from_address(cslAddress).to_hex();
    //     return hex;
    // };
    addrBech32ToHex = async (bech32: string): Promise<string> => {
        const cslAddress = await this.csl.Address.fromBech32(bech32);
        const bytesAddress = await cslAddress.toBytes();
        const plutusData = await this.csl.PlutusData.fromBytes(bytesAddress);
        const hex = plutusData.toHex();
        return hex;
    };

    parsePlutusAddressToBech32 = async (plutusHex: string, networkId = 0): Promise<string> => {
        const cslPlutusDataAddress = await this.csl.PlutusData.fromHex(plutusHex);
        const plutusDataAddressJson = await cslPlutusDataAddress.toJson(1);
        const plutusDataAddressObject = JSON.parse(plutusDataAddressJson);
        const plutusDataPaymentKeyObject = plutusDataAddressObject.fields[0];
        const plutusDataStakeKeyObject = plutusDataAddressObject.fields[1];
        const cslPaymentKeyHash = plutusDataPaymentKeyObject.fields[0].bytes;

        // Take into account whether the hash is a PubKeyHash or ScriptHash
        const credentialKeyHashBytes = Buffer.from(cslPaymentKeyHash, 'hex');
        const pubKeyCredentialKeyHash = await this.csl.Ed25519KeyHash.fromBytes(
            credentialKeyHashBytes,
        );
        const pubKeyCredential = await this.csl.Credential.fromKeyhash(pubKeyCredentialKeyHash);
        const scriptCredentialKeyHash = await this.csl.ScriptHash.fromBytes(credentialKeyHashBytes);
        const scriptCredential = await this.csl.Credential.fromScripthash(scriptCredentialKeyHash);
        const cslPaymentCredential =
            plutusDataPaymentKeyObject.constructor === 0 ? pubKeyCredential : scriptCredential;
        let bech32Addr = '';

        // Parsing address according to whether it has a stake key
        if (
            plutusDataStakeKeyObject.constructor === 0 &&
            plutusDataStakeKeyObject.fields.length !== 0
        ) {
            const cslStakeKeyHash = await this.csl.Ed25519KeyHash.fromBytes(
                Buffer.from(plutusDataStakeKeyObject.fields[0].fields[0].fields[0].bytes, 'hex'),
            );
            const stakeCredential = await this.csl.Credential.fromKeyhash(cslStakeKeyHash);
            const cslBaseAddress = await this.csl.BaseAddress.new(
                networkId,
                cslPaymentCredential,
                stakeCredential,
            );
            const cslAddress = await cslBaseAddress.toAddress();
            bech32Addr = await cslAddress.toBech32();
        } else {
            const cslEnterpriseAddress = await this.csl.EnterpriseAddress.new(
                networkId,
                cslPaymentCredential,
            );
            const cslAddress = await cslEnterpriseAddress.toAddress();
            bech32Addr = await cslAddress.toBech32();
        }

        return bech32Addr;
    };
}
