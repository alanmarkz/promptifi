"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";

import { ReactNode } from "react";
import { z } from "zod";
import { generateId } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  createDebridgeTransaction,
  getTokenAddress,
  swapTransaction,
} from "../_swap/debridge";
import Markdown from "react-markdown";
import cmcList from "../../../public/tokenData.json";

import { TrophySpin } from "react-loading-indicators";
import BridgeComponent from "./BridgeComponent";
import SwapComponent from "./SwapComponent";
import { auth } from "@/auth";
import { getChainId } from "./helper";
import {
  cmcAPI,
  CmcApiResponse,
  CmcToken,
} from "../portfolio/server_actions/TokenBalances";
import TokenComponent from "./TokenComponent";
import Fuse from "fuse.js";

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.OPENAI_API_KEY,
  // custom settings
});

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  history.done((messages: ServerMessage[]) => [
    ...messages,
    { role: "user", content: input },
  ]);

  const session = await auth();
  const loggedInAddress = session?.user.wallet;

  if (!loggedInAddress) {
    return {
      id: generateId(),
      role: "assistant",
      display: "Please sign in to continue.",
    };
  }

  const result = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: `You are a crypto trading assistant with expertise in blockchain networks, token swapping, and cross-chain bridging. You assist users in executing token swaps and bridges while providing real-time transaction URLs. Additionally, you offer insights on market trends, token analysis, risk management, and general cryptocurrency trading strategies.
      
      Use the BridgeToken tool to bridge tokens between chains. Provide the FromToken, ToToken, FromChainName, ToChainName, amount, and dstChainTokenOutRecipient parameters to generate a bridge transaction.
      
      Use the SwapToken tool to swap tokens in a single chain. Provide the FromToken, ToToken, FromChainName, amount, and dstChainTokenOutRecipient parameters to generate a swap transaction.
      
      Use the PriceTool to get the price and stats of a token. Provide the tokenName parameter to generate a token analysis.`,
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
          { role: "user", content: input },
        ]);
      }

      return (
        <div>
          <Markdown>{content}</Markdown>
        </div>
      );
    },

    tools: {
      BridgeToken: {
        description: "Bridge tokens between chains",
        parameters: z.object({
          FromToken: z
            .string()
            .describe(
              "The token being sent in the bridge transaction. User can type eg: Sonic token but you have to return Sonic"
            ),
          ToToken: z
            .string()
            .describe(
              "The token to receive after bridging. User can type eg: Sonic token but you have to return Sonic"
            ),
          FromChainName: z
            .string()
            .describe(
              "The blockchain network the tokens are sent from. User can type eg: Sonic Chain but you have to return Sonic"
            ),
          ToChainName: z
            .string()
            .describe(
              "The blockchain network the tokens are sent from. User can type eg: Sonic Chain but you have to return Sonic"
            ),
          amount: z.string().describe("The number of tokens to bridge"),
          dstChainTokenOutRecipient: z
            .string()
            .optional()
            .describe("The wallet address receiving the bridged tokens"),
        }),
        generate: async function* ({
          FromToken,
          ToToken,
          FromChainName,
          ToChainName,
          amount,
          dstChainTokenOutRecipient,
        }) {
          yield (
            <div className="flex items-center justify-center space-x-2 w-fit">
              <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
              <div className="w-4 h-4 rounded-full animate-pulse bg-green-500 delay-150"></div>
              <div className="w-4 h-4 rounded-full animate-pulse bg-red-500 delay-300"></div>
              <div>Creating Bridge Transaction...</div>
            </div>
          );

          const receipient = dstChainTokenOutRecipient ?? loggedInAddress;

          const srcChainId = getChainId(FromChainName)?.toString();
          const dstChainId = getChainId(ToChainName)?.toString();

          if (!srcChainId) {
            return "Invalid source chain name";
          }

          if (!dstChainId) {
            return "Invalid destination chain name";
          }

          const tokenIn = await getTokenAddress(srcChainId, FromToken);

          const tokenOut = await getTokenAddress(dstChainId, ToToken);

          console.log(
            tokenIn,
            tokenOut,
            srcChainId,
            dstChainId,
            "token addresses"
          );

          if (
            !tokenIn?.tokenAddress ||
            !tokenOut?.tokenAddress ||
            !tokenIn.tokenDecimals
          ) {
            return "Invalid chain token names";
          }

          const url = await createDebridgeTransaction(
            srcChainId,
            tokenIn.tokenAddress,
            (Number(amount) * Math.pow(10, tokenIn.tokenDecimals)).toString(),
            dstChainId,
            tokenOut.tokenAddress,
            receipient,
            loggedInAddress
          );

          console.log(url);

          const fetchTransaction = await fetch(url, {
            method: "GET",
          });

          const transaction = await fetchTransaction.json();
          console.log(transaction);
          if (transaction.errorCode && transaction.errorMessage) {
            return <div>{transaction.errorMessage}</div>;
          }

          return <BridgeComponent transaction={transaction} />;
        },
      },
      SwapToken: {
        description: "Swap tokens in a single chain",
        parameters: z.object({
          FromToken: z
            .string()
            .describe(
              "The token being sent in the swap transaction. User can type eg: Sonic token but you have to return Sonic"
            ),
          ToToken: z
            .string()
            .describe(
              "The token to receive after swapping. User can type eg: Sonic token but you have to return Sonic"
            ),
          FromChainName: z
            .string()
            .describe(
              "The blockchain network the tokens are sent from. User can type eg: Sonic Chain but you have to return Sonic"
            ),
          amount: z.string().describe("The number of tokens to swap"),
          dstChainTokenOutRecipient: z
            .string()
            .optional()
            .describe("The wallet address receiving the swap tokens"),
        }),
        generate: async function* ({
          FromToken,
          ToToken,
          FromChainName,
          amount,
          dstChainTokenOutRecipient,
        }) {
          yield (
            <div className="flex items-center justify-center space-x-2 w-fit">
              <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
              <div className="w-4 h-4 rounded-full animate-pulse bg-green-500 delay-150"></div>
              <div className="w-4 h-4 rounded-full animate-pulse bg-red-500 delay-300"></div>
              <div>Creating swap Transaction...</div>
            </div>
          );

          const receipient = dstChainTokenOutRecipient ?? loggedInAddress;
          const srcChainId = getChainId(FromChainName)?.toString();

          if (!srcChainId) {
            return "Invalid chain name";
          }

          const tokenIn = await getTokenAddress(srcChainId, FromToken);

          const tokenOut = await getTokenAddress(srcChainId, ToToken);

          if (
            !tokenIn?.tokenAddress ||
            !tokenOut?.tokenAddress ||
            !tokenIn.tokenDecimals
          ) {
            return "Invalid chain token names";
          }

          const url = await swapTransaction(
            srcChainId,
            tokenIn.tokenAddress,
            tokenOut.tokenAddress,
            (Number(amount) * Math.pow(10, tokenIn.tokenDecimals)).toString(),
            receipient
          );

          console.log(url);

          const fetchTransaction = await fetch(url, {
            method: "GET",
          });

          const transaction = await fetchTransaction.json();

          if (transaction.errorCode && transaction.errorMessage) {
            return <div>{transaction.errorMessage}</div>;
          }

          return <SwapComponent transaction={transaction} />;
        },
      },
      PriceTool: {
        description:
          "Returns and give analysis for the token and also price and stats of the token",
        parameters: z.object({
          tokenName: z
            .string()
            .describe("The name of the token to get the price and stats for"),
        }),
        generate: async function* ({ tokenName }) {
          yield (
            <div className="flex items-center justify-center space-x-2 w-fit">
              <TrophySpin size="small" color="#3b82f6" />
              <div>Analyzing token...</div>
            </div>
          );

          const cmcTokens = cmcList as CmcToken;

          const options = {
            keys: ["name", "symbol"],
            threshold: 0.1, // Lower threshold for higher accuracy
          };
          const fuse = new Fuse(cmcTokens.data, options);
          const findId = fuse.search(tokenName)[0]?.item;

          const tokenData: CmcApiResponse = await cmcAPI(
            findId?.id.toString() ?? "0"
          );

          console.log(tokenData);

          if (tokenData.data[0] === undefined) {
            yield <div>Can&apos;t find the token</div>;
          }
          return <TokenComponent token={tokenData} />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
