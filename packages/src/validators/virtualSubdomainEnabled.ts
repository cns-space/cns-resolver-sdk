import { CNSMetadata } from "../type/cnsMetadata";

export const validateVirtualSubdomainEnabled = async (metadata: CNSMetadata) => {
  const { virtualSubdomainEnabled } = metadata
  return virtualSubdomainEnabled === "Enabled"
}