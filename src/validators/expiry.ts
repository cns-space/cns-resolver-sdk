import { CNSMetadata } from '../type/cnsMetadata';

export const validateExpiry = async (metadata: CNSMetadata) => {
    const { expiry } = metadata;
    const millisecondsNow = Date.now();
    return expiry > millisecondsNow;
};
