import React, { useState } from "react";
import { CircleArrowDown, CircleArrowUp, X } from "lucide-react";

const TnxHistory = ({ mockData, tokenTransactions, isVisible, tokens }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  if (!isVisible) return null;

  const formatValue = (value, tokenSymbol) => {
    if (!value) return "0.000";
    if (!tokens) return "0.000";

    const token = tokens.find((t) => t.symbol === tokenSymbol);
    const decimals = token ? Number(token.decimals) : 18;

    return (Number(value) / Math.pow(10, decimals)).toFixed(3);
  };

  const TransactionIcon = ({ type }) =>
    type === "Sent" ? (
      <CircleArrowUp className="w-4 h-4 text-red-500" />
    ) : (
      <CircleArrowDown className="w-4 h-4 text-green-500" />
    );

  const groupTransactionsByDate = () => {
    const grouped = {};
    if (!Array.isArray(tokenTransactions)) return grouped;

    tokenTransactions.forEach((tx) => {
      const date = new Date(tx.timestamp).toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(tx);
    });

    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  // console.log(selectedTransaction)

  return (
    <div className="w-full flex flex-col">
      <div className="overflow-y-auto">
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <div key={date} className="border-b border-gray-100">
            <div className="px-4 py-2 bg-gray-50">
              <h3 className="text-xs font-medium text-gray-500">{date}</h3>
            </div>

            {transactions.map((tx, index) => (
              <div
                key={`${date}-${index}`}
                className="border-b border-gray-100 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTransaction(tx)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="text-gray-700 text-sm font-medium flex items-center gap-2">
                      {mockData.find((item) => item.symbol === tx.tokenSymbol)
                        ?.icon && (
                        <img
                          src={
                            mockData.find(
                              (item) => item.symbol === tx.tokenSymbol
                            )?.icon
                          }
                          className="w-[20px] h-[20px] rounded-full"
                          alt={tx.tokenSymbol}
                        />
                      )}
                      {tx.tokenSymbol}
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <TransactionIcon type={tx.transactionType} />
                      <span>{tx.transactionType}</span>
                    </div>

                    <div className="text-gray-400 text-xs">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        tx.transactionType.includes("Sent")
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {tx.transactionType.includes("Sent") ? "-" : "+"}
                      {Number(formatValue(tx.value, tx.tokenSymbol)).toFixed(1)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {tx.tokenSymbol}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {Object.keys(groupedTransactions).length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No transactions found
          </div>
        )}
      </div>

      {selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Transaction Details
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedTransaction(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-semibold">Token:</span>{" "}
                {selectedTransaction.tokenSymbol}
              </p>
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {selectedTransaction.transactionType}
              </p>
              <p>
                <span className="font-semibold">Amount:</span>{" "}
                {formatValue(
                  selectedTransaction.value,
                  selectedTransaction.tokenSymbol
                )}
              </p>
              <p>
                <span className="font-semibold">Time:</span>{" "}
                {new Date(selectedTransaction.timestamp).toLocaleString()}
              </p>
              <p className="break-all">
                <span className="font-semibold">Hash:</span>{" "}
                {selectedTransaction.hash}
              </p>
            </div>

            <a
              href={
                selectedTransaction.chainId === 1
                  ? `https://etherscan.io/tx/${selectedTransaction.hash}`
                  : `https://explorer.celo.org/tx/${selectedTransaction.hash}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className={
                selectedTransaction.chainId === 1
                  ? "mt-4 inline-block w-full text-center bg-[#000] hover:bg-[#333] text-[#fff] py-2 rounded-lg font-medium transition"
                  : "mt-4 inline-block w-full text-center bg-[#F2E205] hover:bg-[#F7E353] text-[#4F4E50] py-2 rounded-lg font-medium transition"
              }
            >
              Open in {selectedTransaction.chainId === 1 ? "Etherscan" : "Celo"}{" "}
              Explorer
            </a>
          </div>
        </div>
      )}

      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-y-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TnxHistory;
