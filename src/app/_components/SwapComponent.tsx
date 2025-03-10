"use client";

import { useAccount, useSendTransaction } from "wagmi";
import { AlertTriangle, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { TrophySpin } from "react-loading-indicators";
import { useConnectModal } from "@rainbow-me/rainbowkit";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SwapComponent = ({ transaction }: { transaction: any }) => {
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const [isSigned, setIsSigned] = useState<{
    status: number;
    message: string;
  } | null>(null);
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (loading) {
        await sendTransaction();
      }

      console.log(transaction, "transaction");
    }, 2000);

    return () => clearTimeout(timer);
  }, [transaction.tx, address]);

  const { sendTransactionAsync } = useSendTransaction();

  const sendTransaction = async () => {
    setLoading(true);
    if (!transaction.tx) return;
    try {
      if (!address && openConnectModal) {
        console.log("address", address);
        openConnectModal();
      } else {
        const tx = await sendTransactionAsync(transaction.tx);
        setLoading(false);
        if (tx) {
          setIsSigned({ status: 200, message: tx });
        }
      } // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setLoading(false);
      console.log(error, "error");
      const errorMessage = String(error.message).includes(
        "User rejected the request"
      );

      if (errorMessage) {
        setIsSigned({ status: 400, message: "User rejected the request" });
      }

      const connectWallet = String(error.message).includes(
        "No wallet is connected"
      );

      if (connectWallet) {
        setIsSigned({
          status: 400,
          message: "No wallet is connected. Connect a wallet",
        });
      }
    }
  };

  const sourceAmount =
    Number(transaction.tokenIn.amount ?? 0) /
    10 ** Number(transaction.tokenIn.decimals);

  const destinationAmount =
    Number(transaction.tokenOut.amount ?? 0) /
    10 ** Number(transaction.tokenOut.decimals);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-br flex items- justify-center flex-col from-white to-gray-50 text-gray-900 rounded-xl shadow-sm w-full mx-auto space-y-6 border border-gray-200"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent"
      >
        Swap Transaction
      </motion.h2>
      {/* Horizontal Layout */}
      <div className="flex items-center justify-between space-x-4">
        {/* Source */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-white rounded-lg w-1/3 text-center flex items-center justify-center flex-col space-y-1 hover:bg-gray-50 transition-all border border-gray-200"
        >
          <div className="text-xs text-gray-500">
            {transaction.tokenIn.name}
          </div>
          <div className="font-bold text-lg">
            {Number(sourceAmount.toFixed(4))}{" "}
            <span className="text-blue-500">{transaction.tokenIn.symbol}</span>
          </div>
        </motion.div>

        {/* Arrow */}
        <ArrowRight size={20} className="text-blue-500" />
        {/* Destination */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-white rounded-lg w-1/3 text-center flex items-center justify-center flex-col space-y-1 hover:bg-gray-50 transition-all border border-gray-200"
        >
          <div className="text-xs text-gray-500">
            {transaction.tokenOut.name}
          </div>
          <div className="font-bold text-lg">
            {Number(destinationAmount.toFixed(4))}{" "}
            <span className="text-blue-500">{transaction.tokenOut.symbol}</span>
          </div>
        </motion.div>
      </div>
      {loading && (
        <div className="flex gap-2 items-center justify-center w-full  bg-blue-50 rounded-lg text-blue-600">
          <div className="font-semibold">Waiting for signature</div>
          <div className="scale-50">
            <TrophySpin size="small" color="#3b82f6" />
          </div>
        </div>
      )}
      {isSigned?.status === 200 && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded-lg  justify-center">
          <CheckCircle size={18} />
          <span>
            Transaction signed successfully with hash {isSigned.message}
          </span>
        </div>
      )}
      {!loading &&
      isSigned?.status === 400 &&
      isSigned.message === "User rejected the request" ? (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg justify-center">
          <XCircle size={18} />
          <span>{isSigned.message}</span>
          <button
            onClick={async () => await sendTransaction()}
            className="ml-2 px-3 py-2 border bg-red-500 rounded hover:bg-red-600 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        isSigned?.message === "No wallet is connected. Connect a wallet" && (
          <div className="flex items-center space-x-2 text-yellow-600 p-2 rounded-lg bg-yellow-50 justify-center">
            <AlertTriangle size={18} />
            <span>{isSigned?.message}</span>
            {openConnectModal && (
              <button
                onClick={openConnectModal}
                className="ml-2 px-2 py-1 bg-yellow-50 border border-yellow-600 rounded hover:bg-yellow-100"
              >
                Connect Wallet
              </button>
            )}
          </div>
        )
      )}
      {/* Send Transaction Button */}
    </motion.div>
  );
};

export default SwapComponent;
