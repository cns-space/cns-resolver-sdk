/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import { CNSResolver } from '../../src';
import { MaestroCNS } from '../../src/fetcher';

dotenv.config();

const network = 'preprod';
const apiKey = process.env.MAESTRO_API_KEY || '';

describe('MaestroCNS', () => {
    const maestroCNS = new MaestroCNS(apiKey, network);
    const resolver = new CNSResolver(maestroCNS);
    const assetStr = 'hinson.ada';

    it('resolveAddress should return address', async () => {
        const result = await resolver.resolveAddress(assetStr);
        console.log('resolveAddress', result);

        expect(result).toBeDefined();
    });

    it('resolveUserRecord should return CNSUserRecord', async () => {
        const result = await resolver.resolveUserRecord(assetStr);
        console.log('resolveUserRecord', result);

        expect(result).toBeDefined();
    });

    it('resolveAddress for subdomain should return CNSUserRecord', async () => {
        const result = await resolver.resolveAddress(`peter.${assetStr}`);
        console.log('resolveUserRecord', result);

        expect(result).toBeDefined();
    });
});
