import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sonic } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Sonic DeFAI",
  projectId: "sonic-defi",
  chains: [mainnet, sonic],
  ssr: true,
});
