import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sonicTestnet, sepolia, sonic } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Sonic DeFAI",
  projectId: "12d321",

  chains: [
    sonicTestnet,
    sonic,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
});
