import { CNSMetadata } from "../type/cnsMetadata";

export const validateVirtualSubdomainEnabled = (metadata: CNSMetadata) => {
  const { virtualSubdomainEnabled } = metadata
  return virtualSubdomainEnabled === "Enabled"
}