"use server";

import axios from "axios";
import { getChainId } from "../_components/helper";
export const createDebridgeTransaction = async (
  srcChainId: string,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChainId: string,
  dstChainTokenOut: string,
  dstChainTokenOutRecipient: string,
  srcChainOrderAuthorityAddress: string
) => {
  const url = bridgeTransactions(
    srcChainId,
    srcChainTokenIn,
    srcChainTokenInAmount,
    dstChainId,
    dstChainTokenOut,
    dstChainTokenOutRecipient,
    srcChainOrderAuthorityAddress
  );

  const res = url;

  if (res) return res;
  return "Error creating the transaction data";
};

const bridgeTransactions = (
  srcchainId: string,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChainId: string,
  dstChainTokenOut: string,
  dstChainTokenOutRecipient: string,
  srcChainOrderAuthorityAddress: string
) => {
  const url = `https://dln.debridge.finance/v1.0/dln/order/create-tx?srcChainId=${srcchainId}&srcChainTokenIn=${srcChainTokenIn}&srcChainTokenInAmount=${srcChainTokenInAmount}&dstChainId=${dstChainId}&dstChainTokenOut=${dstChainTokenOut}&dstChainTokenOutAmount=auto&dstChainTokenOutRecipient=${dstChainTokenOutRecipient}&srcChainOrderAuthorityAddress=${srcChainOrderAuthorityAddress}&affiliateFeePercent=0&dstChainOrderAuthorityAddress=${dstChainTokenOutRecipient}&prependOperatingExpenses=false&skipSolanaRecipientValidation=false`;

  return url;
};

export const swapTransaction = async (
  chainId: string,
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: string,
  receipient: string
) => {
  const url = `https://dln.debridge.finance/v1.0/chain/transaction?chainId=${chainId}&tokenIn=${tokenIn}&tokenInAmount=${tokenInAmount}&slippage=auto&tokenOut=${tokenOut}&tokenOutRecipient=${receipient}&affiliateFeePercent=0`;

  return url;
};

export const getTokenAddress = async (chainId: string, tokenName: string) => {
  const url = `https://dln.debridge.finance/v1.0/token-list?chainId=${chainId}`;

  const data = await fetch(url);

  const res = await data.json();

  const tokensList: TokenList = res;

  if (!tokensList || !tokensList.tokens) {
    console.log("No tokens found");
    return undefined;
  }

  for (const tokenAddress in tokensList.tokens) {
    if (
      tokensList.tokens[tokenAddress].name
        .toLowerCase()
        .includes(tokenName.toLowerCase())
    ) {
      return {
        tokenAddress,
        tokenDecimals: tokensList.tokens[tokenAddress].decimals,
      };
    }
  }

  return undefined;
};

interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  tags: string[];
  eip2612: boolean;
}

interface TokenList {
  tokens: Record<string, Token>;
}

export const deBrdigeRouting = async (
  FromChain: string,
  FromToken: string,
  FromTokenAmount: string,
  ToChain: string,
  ToToken: string,
  TokenOutReceipient: string,
  FromWalletAddress: string
) => {
  if (FromChain === ToChain) {
    const srcChainId = getChainId(FromChain)?.toString();

    if (!srcChainId) {
      return "Invalid chain name";
    }
    const swapUrl = await swapTransaction(
      srcChainId,
      FromToken,
      ToToken,
      FromTokenAmount,
      TokenOutReceipient
    );

    const res = await axios.get(swapUrl);

    console.log(res, "swap transaction");
  }
  const srcChainId = getChainId(FromChain)?.toString();
  const dstChainId = getChainId(ToChain)?.toString();

  if (!srcChainId || !dstChainId) {
    return "Invalid chain name";
  }

  const tokenIn = await getTokenAddress(srcChainId, FromToken);
  const tokenOut = await getTokenAddress(dstChainId, ToToken);

  if (!tokenIn?.tokenAddress || !tokenOut) {
    return "Invalid chain token names";
  }

  const bridgeUrl = await createDebridgeTransaction(
    srcChainId,
    tokenIn.tokenAddress,
    FromTokenAmount,
    dstChainId,
    tokenOut.tokenAddress,
    TokenOutReceipient,
    FromWalletAddress
  );

  const res = await axios.get(bridgeUrl);

  if (res.status) {
    console.log(res, "bridge transaction");
  }
  console.log(bridgeUrl, "bridge transaction");
  return bridgeUrl;
};

export const getUSDc = async (chainId: string) => {
  const url = `https://dln.debridge.finance/v1.0/token-list?chainId=${chainId}`;

  const data = await fetch(url);

  const res = await data.json();

  const tokensList: TokenList = res;

  if (!tokensList || !tokensList.tokens) {
    return undefined;
  }

  for (const tokenAddress in tokensList.tokens) {
    if (tokensList.tokens[tokenAddress].name.toLowerCase().includes("usdc")) {
      console.log("USDC Token Found", tokensList.tokens[tokenAddress].name);
      return {
        tokenAddress,
        tokenDecimals: tokensList.tokens[tokenAddress].decimals,
      };
    }
  }

  return undefined;
};
