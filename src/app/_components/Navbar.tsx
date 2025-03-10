"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useSignMessage } from "wagmi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const user = useSession();

  async function handleSign() {
    if (window) {
      const domain = window?.location?.host;
      const origin = window?.location?.origin;

      const nounce = await getCsrfToken();

      const message = new SiweMessage({
        domain,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: origin,
        version: "1",
        chainId: 1,
        nonce: nounce,
      }).prepareMessage();

      const signature = await signMessageAsync({ message });

      await signIn("credentials", {
        message,
        signature,
        redirect: false,
      });
    }
  }

  async function signInWithEthereum() {
    try {
      if (isConnected) {
        await handleSign();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-full flex justify-between items-center p-2 px-6 fixed top-0 left-0 bg-white/80 backdrop-blur-lg shadow-md z-50">
      <div className="flex gap-20 items-center justify-center">
        <div className="text-2xl font-extrabold text-gray-800 tracking-wide flex gap-1">
          <Image src="/logo.webp" width={32} height={32} alt="Logo" />
          <div>PromptiFi</div>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="">
            Chat
          </Link>
          <Link href="/portfolio" className="">
            Portfolio
          </Link>
        </div>
      </div>

      <div className="flex items-center">
        {isConnected && !user.data?.user.wallet ? (
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 font-semibold shadow-md"
            onClick={signInWithEthereum}
          >
            Sign In
          </button>
        ) : (
          <div>
            {user.data?.user.wallet && !isConnected ? (
              <div>
                <Button
                  variant={"outline"}
                  className="text-red-500"
                  onClick={() => {
                    signOut();
                  }}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
