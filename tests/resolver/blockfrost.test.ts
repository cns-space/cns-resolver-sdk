/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import { CNSResolver } from '../../src';
import { BlockfrostCNS } from '../../src/fetcher';

dotenv.config();

const network = 'preprod';
const apiKey = process.env.BLOCKFROST_API_KEY || '';

describe('BlockfrostCNS', () => {
    const blockfrostCNS = new BlockfrostCNS(apiKey, network);
    const resolver = new CNSResolver(blockfrostCNS);
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
});
