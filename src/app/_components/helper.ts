import Fuse from "fuse.js";
import chainData from "../../../public/debridgeChain.json";

export const getChainId = (name: string): number | null => {
    const fuse = new Fuse(chainData.chains, {
      keys: ["chainName"],
      threshold: 0.4,
    });
  
    const result = fuse.search(name);
  
    return result.length > 0 ? result[0].item.chainId : null;
  };
  