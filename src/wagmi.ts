import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sonicTestnet, sonic } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Sonic DeFAI",
  projectId: "sonic-defi",
  chains: [sonicTestnet, sonic],
  ssr: true,
});
