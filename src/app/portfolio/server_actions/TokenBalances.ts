"use server";

import { Alchemy, Network } from "alchemy-sdk";
import data from "../../../../public/all.json";

import sonic from "../../../../public/sonic.json";
import { auth } from "@/auth";
import axios from "axios";

import cmcList from "../../../../public/tokenData.json";

export interface CmcToken {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: {
    id: number;
    rank: number;
    name: string;
    symbol: string;
    slug: string;
    is_active: number;
    status: number;
    first_historical_data: string;
    last_historical_data: string;
    platform: {
      id: 1;
      name: string;
      symbol: string;
      slug: string;
      token_address: string;
    } | null;
  }[];
}

export const getTokenBalances = async (ownerAddr: string) => {
  const session = await auth();

  const address = ownerAddr;
  if (!ownerAddr || !session?.user.wallet) return [];
  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  };

  interface TokenList {
    name: string;
    timestamp: string;
    tokens: Token[];
    logoURI: string;
    keywords: string[];
    version: {
      major: number;
      minor: number;
      patch: number;
    };
  }

  interface Token {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }

  const tokenData = data as TokenList;

  // const chunkSize = 1000;
  let allTokenBalances: {
    chainId: number;
    logo: string | undefined;
    name: string;
    address: string | undefined;
    symbol: string | undefined;
    balance: number;
    id: number | undefined;
    positive: boolean;
    quote: TokenQuote | undefined;
  }[] = [];

  const alchemy = new Alchemy(settings);

  const balances = await alchemy.core.getTokenBalances(ownerAddr);

  balances.tokenBalances.forEach(async (token) => {
    const tokenInfo = await tokenData.tokens.find(
      (t) => t.address === token.contractAddress
    );

    if (tokenInfo) {
      const balance = BigInt(token.tokenBalance || 0);
      const tokenBalance =
        Number(balance) / Math.pow(10, tokenInfo.decimals || 18);

      const findId = cmcTokens.data.find(
        (t) =>
          t.name
            .toLowerCase()
            .includes((tokenInfo?.name ?? "null").toLowerCase()) &&
          t.symbol.toLowerCase() === (tokenInfo?.symbol ?? "")?.toLowerCase()
      );

      if (tokenBalance > 0)
        allTokenBalances.push({
          chainId: tokenInfo.chainId,
          logo: tokenInfo?.logoURI,
          name: tokenInfo?.name ?? "",
          address: tokenInfo?.address,
          symbol: tokenInfo?.symbol,
          balance: tokenBalance,
          id: findId?.id,
          positive: false,
          quote: undefined,
        });
    }
  });

  const cmcTokens = cmcList as CmcToken;

  const sonicContracts = [
    "0x29219dd400f2bf60e5a23d13be72b486d4038894",
    "0xe5da20f15420ad15de0fa650600afc998bbe3955",
    "0xa04bc7140c26fc9bb1f36b1a604c7a5a88fb0e70",
    "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
    "0xcacd6fd266af91b8aed52accc382b4e165586e29",
    "0x6C3F1F34cEd16638Db14C30Fba69506D62031E7E",
    "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",
    "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
    "0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B",
  ];

  for (const contract of sonicContracts) {
    try {
      const response = await fetch(
        `https://api.etherscan.io/v2/api?chainid=146&module=account&action=tokenbalance&contractaddress=${contract}&address=${address}&tag=latest&apikey=${process.env.ETHER_SCAN}`
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (data.status !== "1") {
        console.error(`Error fetching balance for ${contract}:`, data.message);
        continue;
      }

      const tokenInfo = await sonic.find((t) => t.address === contract);

      if (Number(data.result) > 0) {
        const balance = BigInt(data.result || 0);
        const tokenBalance =
          Number(balance) / Math.pow(10, tokenInfo?.decimals || 18);

        const findId = cmcTokens.data.find(
          (t) =>
            t.name
              .toLowerCase()
              .includes((tokenInfo?.name ?? "null").toLowerCase()) &&
            t.symbol.toLowerCase() === (tokenInfo?.symbol ?? "")?.toLowerCase()
        );

        allTokenBalances.push({
          chainId: tokenInfo?.chainId ?? 1,
          logo: tokenInfo?.logoURI,
          name: tokenInfo?.name ?? "",
          address: tokenInfo?.address,
          symbol: tokenInfo?.symbol,
          balance: tokenBalance,
          id: findId?.id,
          positive: false,
          quote: undefined,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch balance for ${contract}:`, error);
    }
  }

  const addCurrencyBalance = async (
    ownerAddr: string,
    chainId: string,
    metadata: {
      logo: string | undefined;
      name: string;
      address: string | undefined;
      symbol: string | undefined;
    }
  ) => {
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=balance&address=${ownerAddr}&tag=latest&apikey=${process.env.ETHER_SCAN}`
    );

    const sonicBalance = await response.json();

    console.log(sonicBalance, "sonicBalance", ownerAddr);
    try {
      if (Number(sonicBalance.result) > 0) {
        const balance = BigInt(sonicBalance.result || 0);
        const tokenBalance = Number(balance) / Math.pow(10, 18);

        const findId = cmcTokens.data.find(
          (t) =>
            t.name.toLowerCase().includes(metadata?.name.toLowerCase()) &&
            t.symbol.toLowerCase() === metadata.symbol?.toLowerCase()
        );

        allTokenBalances.push({
          chainId: Number(chainId),
          logo: metadata.logo,
          name: metadata.name ?? "Sonic",
          address: "",
          symbol: metadata.symbol ?? "S",
          balance: tokenBalance,
          id: findId?.id,
          positive: false,
          quote: undefined,
        });
      }
    } catch (error) {
      console.error(`Error fetching balance for`, error);
    }
  };

  await addCurrencyBalance(ownerAddr, "146", {
    logo: "https://sonicscan.org/assets/sonic/images/svg/logos/token-light.svg?v=25.2.2.0",
    name: "Sonic",
    address: "",
    symbol: "S",
  });

  await addCurrencyBalance(ownerAddr, "1", {
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    name: "Ether",
    address: "",
    symbol: "ETH",
  });

  const cmcIds = allTokenBalances.map((token) => {
    return token.id;
  });

  const cmcData: CmcApiResponse = await cmcAPI(cmcIds.join(","));

  allTokenBalances = allTokenBalances.map((token) => {
    if (!token.id) return token;
    const findToken = cmcData.data[token.id];

    const increase = findToken.quote.USD.percent_change_1h > 0;
    return {
      ...token,
      positive: increase,
      quote: findToken,
    };
  });

  return allTokenBalances;
};

export const cmcAPI = async (name: string) => {
  try {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${name.toLowerCase()}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching token data:", error);
  }
};

export interface CmcApiResponse {
  data: {
    [key: string]: TokenQuote;
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
}

export interface TokenQuote {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  is_active: number;
  is_fiat: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  date_added: string;
  num_market_pairs: number;
  cmc_rank: number;
  last_updated: string;
  tags: string[];
  platform: null | {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  };
  self_reported_circulating_supply: null | number;
  self_reported_market_cap: null | number;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      last_updated: string;
    };
  };
}
