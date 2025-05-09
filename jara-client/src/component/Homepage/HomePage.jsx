import React, { useEffect, useState } from "react";
import { RiTokenSwapLine } from "react-icons/ri";
import { GoEye, GoEyeClosed } from "react-icons/go";
import {
  LuCreditCard,
  LuSettings2,
  LuWalletMinimal,
  LuArrowUpToLine,
} from "react-icons/lu";
import { BiScan } from "react-icons/bi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import {
  CELO_CHAIN,
  ETHEREUM_CHAIN,
  // STARKNET_CHAIN,
  TOKENS,
  ARBITRUM_CHAIN,
  OPTIMISM_CHAIN,
  BASE_CHAIN,
} from "../../constant/otherChains";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import { IoIosLogOut } from "react-icons/io";
import QrReader from "react-qr-scanner";
import para from "../../constant/paraClient";
import { motion } from "framer-motion";
import TnxHistory from "../Transactions/TnxHistory";
import {
  Provider as StarkProvider,
  Contract as StarkContract,
  RpcProvider,
  hash,
  stark,
} from "starknet";
import axios from "axios";
import HomeLoader from "./Loader/HomeLoader";
import { FaExchangeAlt } from "react-icons/fa";
const HomePage = () => {
  const navigate = useNavigate();
  const { address } = useAccount();

  // const starknetAddress = starknetAddressFromEVM(address);

  // console.log(address)

  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const tokens = TOKENS;
  const CHAINS = [
    CELO_CHAIN,
    // STARKNET_CHAIN,
    ETHEREUM_CHAIN,
  ];

  // console.log(tokens)
  // State Managament.
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalUSDTBalance, setTotalUSDTBalance] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedAddress, setScannedAddress] = useState("");
  const [mockData, setMockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [showTnxHistory, setShowTnxHistory] = useState(false);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const [hideZeroBalances, setHideZeroBalances] = useState(true);

  useEffect(() => {
    if (!address) return;
    // console.log({ address });

    const registerPwaUser = async () => {
      try {
        const response = await axios.post(
          "https://jarafibackend.vercel.app/pwauser/register",
          { referenceId: address.toString() },
          { withCredentials: true }
        );

        if (response.status === 400) return;
      } catch (error) {
        console.log(`Error registering user: ${error}`);
      }
    };
    registerPwaUser();
  }, [address]);

  const handleScan = (data) => {
    if (data?.text) {
      setScannedAddress(data.text);
      setShowScanner(false);
      navigate("/send", { state: { address: data.text } });
      // console.log("Scanned Wallet Address:", data.text);
    } else {
      // console.warn("Invalid scan result:", data);
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
  };

  const logoutAccount = async () => {
    try {
      await para.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchTransactionHistory = async (address, tokens) => {
    if (!address) return;

    // Group tokens by their chain ID
    const tokensByChain = tokens.reduce((acc, token) => {
      const chainId =
        token.chainId || (token.networks && Object.keys(token.networks)[0]);
      if (!acc[chainId]) acc[chainId] = [];
      acc[chainId].push(token);
      return acc;
    }, {});

    const EXPLORER_APIS = {
      [CELO_CHAIN.id]: {
        url: "https://api.celoscan.io/api",
        apiKey: import.meta.env.VITE_APP_CELOSCAN_API,
      },
      [ETHEREUM_CHAIN.id]: {
        url: "https://api.etherscan.io/api",
        apiKey: import.meta.env.VITE_APP_ETHERSCAN_API,
      },
      [ARBITRUM_CHAIN.id]: {
        url: "https://arbiscan.io/api",
        apiKey: import.meta.env.VITE_APP_ARBISCAN_API,
      },
      [OPTIMISM_CHAIN.id]: {
        url: "https://optimistic.etherscan.io/api",
        apiKey: import.meta.env.VITE_APP_OP_API,
      },
      [BASE_CHAIN.id]: {
        url: "https://basescan.org/api",
        apiKey: import.meta.env.VITE_APP_BASE_API,
      },
      // [STARKNET_CHAIN.id]: {
      //   url: "https://api.starkscan.io/api", // Replace with actual StarkNet explorer API
      //   apiKey: import.meta.env.VITE_APP_STARKSCAN_API,
      // },
    };

    try {
      // Fetch transactions for all networks concurrently
      const allTransactions = await Promise.all(
        Object.entries(tokensByChain).map(async ([chainId, tokens]) => {
          const apiConfig = EXPLORER_APIS[chainId];
          if (!apiConfig) {
            console.warn(`No API configured for chain ID ${chainId}`);
            return [];
          }
          const { url, apiKey } = apiConfig;
          const tokenAddresses = tokens
            .map((token) => token.networks?.[chainId]?.address || token.address)
            .filter(Boolean);

          if (!tokenAddresses.length) return [];

          const tokenAddressesLower = tokenAddresses.map((addr) =>
            addr?.toLowerCase()
          );

          const apiUrl = `${url}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.status !== "1") {
            console.error(
              `Failed to fetch transactions for chain ID ${chainId}:`,
              data.message
            );
            return [];
          }

          return data.result
            .filter((tx) =>
              tokenAddressesLower.includes(tx.contractAddress.toLowerCase())
            )
            .map((tx) => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value,
              timestamp: parseInt(tx.timeStamp) * 1000,
              tokenSymbol: tx.tokenSymbol,
              transactionType:
                tx.from.toLowerCase() === address.toLowerCase()
                  ? "Sent"
                  : "Received",
              chainId: parseInt(chainId),
            }));
        })
      );

      const flattenedTransactions = allTransactions
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp);

      setTokenTransactions(flattenedTransactions);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
  };

  const updateTokenTransactions = (newTx) => {
    setTokenTransactions((prev) => [
      {
        hash: newTx.hash,
        from: newTx.from.toLowerCase(),
        to: newTx.to.toLowerCase(),
        value: newTx.value,
        timestamp: newTx.timestamp || Date.now(),
        tokenSymbol: newTx.tokenSymbol,
        transactionType: newTx.transactionType,
      },
      ...prev,
    ]);
  };

  const fetchTokenPriceInUSDT = async (tokenSymbol) => {
    const apiUrl = `https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USDT`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      // console.log(data)
      return data.USDT || 0;
    } catch (error) {
      console.error("Error fetching token price:", error);
      return 0;
    }
  };

  const fetchTokenBalances = async (address, tokens) => {
    if (!address) {
      console.error("Address is not provided!");
      return { fetchedData: [], totalBalance: 0, totalUSDTBalance: 0 };
    }

    const fetchedData = [];
    let totalBalance = 0;
    let totalUSDTBalance = 0;

    // Helper function for StarkNet balances
    // const fetchStarkNetBalance = async (
    //     contractAddress,
    //     providerUrl,
    //     userAddress,
    //     decimals
    //   ) => {
    //     try {
    //       const starkProvider = new RpcProvider({ nodeUrl: providerUrl });

    //       // Cairo 1.0-compatible ABI
    //       const contractAbi = [
    //         {
    //           name: "balance_of",
    //           type: "function",
    //           inputs: [{ name: "account", type: "core::felt252" }],
    //           outputs: [{ type: "core::integer::u256" }],
    //           state_mutability: "view",
    //         },
    //       ];

    //       // Correct StarkNet contract initialization
    //       const starkContract = new StarkContract(
    //         contractAbi,
    //         contractAddress,
    //         starkProvider
    //       );

    //       const numericAddress = BigInt(userAddress);
    //       const starkAddress = `0x${numericAddress
    //         .toString(16)
    //         .padStart(64, "0")}`;

    //       // Call StarkNet contract
    //       const balance = await starkContract.balance_of(starkAddress);

    //       // Handle Uint256 conversion safely
    //       if (!balance?.low || !balance?.high) {
    //         return 0;
    //       }

    //       const low = BigInt(balance.low);
    //       const high = BigInt(balance.high);
    //       const total = (high << 128n) + low;

    //       return Number(total / 10n ** BigInt(decimals));
    //     } catch (error) {
    //       console.error("StarkNet balance error:", error);
    //       return 0;
    //     }
    //   };

    // Helper function for EVM-compatible chains

    const fetchERC20Balance = async (
      providerUrl,
      contractAddress,
      userAddress,
      decimals
    ) => {
      try {
        const provider = new JsonRpcProvider(providerUrl);

        // Handle native tokens (e.g., ETH on Ethereum, CELO on Celo)
        if (!contractAddress) {
          const balance = await provider.getBalance(userAddress);
          return Number(ethers.formatUnits(balance, decimals));
        }

        // Handle ERC-20 tokens
        const contract = new Contract(
          contractAddress,
          ["function balanceOf(address) view returns (uint256)"],
          provider
        );
        const balance = await contract.balanceOf(userAddress);
        return Number(ethers.formatUnits(balance, decimals));
      } catch (error) {
        console.error("Token balance error:", error);
        return 0;
      }
    };

    try {
      for (const token of tokens) {
        try {
          // Handle multi-network tokens (like USDC, ETH)
          if (token.networks) {
            for (const [networkKey, config] of Object.entries(token.networks)) {
              const chainId = parseInt(networkKey);

              const chain = CHAINS.find((c) => c.id === chainId);
              // console.log(chainId, chain)
              if (!chain) {
                console.error(
                  `Chain ${chainId} not found for token ${token.name}`
                );
                continue;
              }

              // const isStarknet = chain.id === STARKNET_CHAIN.id;
              const providerUrl = chain.rpcUrls.default.http[0];

              const balance = await fetchERC20Balance(
                providerUrl,
                config.address,
                address,
                token.decimals
              );

              // console.log(token, balance)

              // const balance = await (isStarknet
              //   ? fetchStarkNetBalance(
              //       config.address,
              //       providerUrl,
              //       address,
              //       token.decimals
              //     )
              //   : fetchERC20Balance(
              //       providerUrl,
              //       config.address,
              //       address,
              //       token.decimals
              //     ));

              const priceInUSDT = await fetchTokenPriceInUSDT(token.symbol);
              const balanceInUSDT = balance * priceInUSDT;

              fetchedData.push({
                id: `${token.id}-${chain.id}-${config.address}`,
                token_name: token.name,
                symbol: token.symbol,
                network: chain.name,
                balance: balance,
                balance_in_usdt: balanceInUSDT,
                icon: token.icon,
                address: config.address,
              });
              totalBalance += balance;
              totalUSDTBalance += balanceInUSDT;
            }
          } else {
            // Handle single-network tokens (like cUSD, cEUR, CELO)
            const chain = CHAINS.find((c) => c.id === token.chainId);
            // console.log(chain)
            if (!chain) {
              console.error(
                `Chain ${token.chainId} not found for token ${token.name}`
              );
              continue;
            }

            // const isStarknet = chain.id === STARKNET_CHAIN.id;
            const providerUrl = chain.rpcUrls.default.http[0];

            const balance = await fetchERC20Balance(
              providerUrl,
              token.address,
              address,
              token.decimals
            );
            // const balance = await (isStarknet
            //   ? fetchStarkNetBalance(
            //       token.address,
            //       providerUrl,
            //       address,
            //       token.decimals
            //     )
            //   : fetchERC20Balance(
            //       providerUrl,
            //       token.address,
            //       address,
            //       token.decimals
            //     ));

            const priceInUSDT = await fetchTokenPriceInUSDT(token.symbol);
            const balanceInUSDT = balance * priceInUSDT;

            fetchedData.push({
              id: `${token.id}`,
              token_name: token.name,
              symbol: token.symbol,
              network: chain.name,
              balance: balance,
              balance_in_usdt: balanceInUSDT,

              icon: token.icon,
              address: token.address,
            });
            totalBalance += balance;
            totalUSDTBalance += balanceInUSDT;
          }
        } catch (tokenError) {
          console.error(`Error processing ${token.name}:`, tokenError);
          fetchedData.push({
            id: token.id,
            token_name: token.name,
            symbol: token.symbol,
            network: "Unknown",
            balance: 0,
            balance_in_usdt: 0,

            icon: token.icon,
            address: token.address,
            error: true,
          });
        }
      }

      return { fetchedData, totalBalance, totalUSDTBalance };
    } catch (error) {
      console.error("Global fetch error:", error);
      return { fetchedData: [], totalBalance: 0, totalUSDTBalance: 0 };
    }
  };

  const handleTransaction = (type, route) => {
    navigate(route);

    const mockTx = {
      hash: `0x${Math.random().toString(16).slice(2)}`,
      from: type === "Payment Sent" ? address : "external_address",
      to: type === "Payment Sent" ? "recipient_address" : address,
      value: (Math.random() * 100).toFixed(2),
      token: mockData[0]?.token_name || "USDC",
      type: type,
      timestamp: Date.now(),
    };
    updateTokenTransactions(mockTx);
  };

  // Side Action == useEffect

  useEffect(() => {
    const hasReloaded = localStorage.getItem("hasReloaded");

    if (!address || address === "N/A") {
      if (!hasReloaded) {
        localStorage.setItem("hasReloaded", "true");
        window.location.reload();
      }
    } else {
      localStorage.removeItem("hasReloaded");
    }
  }, [address]);

  useEffect(() => {
    if (mockData.length > 0 && !Object.keys(tokenTransactions).length) {
      const initialTransactions = mockData.reduce((acc, token) => {
        acc[token.token_name] = [
          {
            hash: `0x${Math.random().toString(16).slice(2)}`,
            from: "initial_address",
            to: address,
            value: (Math.random() * 100).toFixed(2),
            token: token.token_name,
            type: "Payment Received",
            timestamp: Date.now() - 3600000,
          },
        ];
        return acc;
      }, {});
      setTokenTransactions(initialTransactions);
    }
  }, [mockData]);

  useEffect(() => {
    if (address) {
      setLoading(true);
      Promise.all([
        fetchTokenBalances(address, tokens).then(
          ({ fetchedData, totalBalance, totalUSDTBalance }) => {
            setMockData(fetchedData);
            setTotalBalance(totalBalance);
            setTotalUSDTBalance(totalUSDTBalance);
          }
        ),
        fetchTransactionHistory(address, tokens),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    const filterTokens = () => {
      const chainSpecificTokens = TOKENS.filter((token) => {
        if (token.networks) return !!token.networks[selectedChain.id];
        return token.chainId === selectedChain.id;
      });
      setMockData(chainSpecificTokens);
    };

    filterTokens();
  }, [selectedChain]);

  useEffect(() => {
    // Prevent scrolling when component mounts
    document.body.classList.add("overflow-hidden");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // ========= END ============
  // console.log(mockData)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0140]">
        <HomeLoader />
      </div>
    );
  }

  const filteredData = [...mockData]
    .filter((item) => !hideZeroBalances || parseFloat(item.balance_in_usdt) > 0)
    .sort((a, b) => b.balance_in_usdt - a.balance_in_usdt);

  return (
    <section className="bg-[#0F0140] h-screen w-full overflow-x-hidden">
      <p className="text-[12px] text-[#8A868A] text-center px-6 py-2 mt-4">
        Finish setting up your account for maximum security!
      </p>

      <div className="flex items-center justify-end  gap-2">
        <p className="text-[15px] md:text-[12px] text-[#fff] text-left md:text-right px-2">
          {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : "N/A"}
        </p>

        <button className="mr-2" onClick={logoutAccount}>
          <IoIosLogOut size={25} color="#ffffff" />
        </button>
      </div>

      <header className="h-auto bg-[#1D143E] my-4 md:my-10 flex items-center justify-center">
        <section className="flex flex-col justify-between w-full max-w-[1024px] px-4 md:p-6">
          <section className="flex justify-between items-center relative">
            <p className="text-[#F2EDE4] text-[16px]">Wallet Balance</p>

            <div className="flex gap-4">
              <div className="relative">
                <button onClick={() => setShowScanner(!showScanner)}>
                  <BiScan color="#B0AFB1" size={25} />
                </button>

                {showScanner && (
                  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                      <h3 className="text-lg font-bold text-gray-700">
                        Scan QR Code
                      </h3>

                      <div className="w-64 h-64 mt-4 flex items-center justify-center border-4 border-gray-300 rounded-lg">
                        <QrReader
                          delay={300}
                          onError={handleError}
                          onScan={handleScan}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>

                      <button
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg w-full"
                        onClick={() => setShowScanner(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* {scannedAddress && (
                  <p className="text-green-500 text-center mt-2">
                    Scanned Address: {scannedAddress}
                  </p>
                )} */}
              </div>

              <div>
                <IoIosNotificationsOutline
                  color="#B0AFB1"
                  size={25}
                  onClick={() => setShowTnxHistory(!showTnxHistory)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          </section>

          <section className="mt-4 flex gap-4 items-center justify-start  ">
            <motion.p
              className="text-[#F2EDE4] text-[25px] md:text-[32px] md:w-[110px] w-[70px] "
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {isVisible ? `$ ${totalUSDTBalance.toFixed(1)}` : "****"}
            </motion.p>

            <div
              className="flex gap-2 cursor-pointer"
              onClick={() => setIsVisible(!isVisible)}
            >
              <motion.div
                initial={{ opacity: 0.7, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isVisible ? (
                  <GoEye size={25} color="#fff" />
                ) : (
                  <GoEyeClosed size={25} color="#fff" />
                )}
              </motion.div>
            </div>
          </section>

          {/* Send, Receive, Swap Buttons Section */}
          <section className="flex justify-between mt-4">
            {[
              {
                label: "Send",
                icon: <LuArrowUpToLine size={25} color="#0F0140" />,
                routes: "/send",
                onClick: () => handleTransaction("Payment Sent", "/send"),
              },
              {
                label: "Receive",
                icon: <LuArrowUpToLine size={25} color="#0F0140" />,
                rotate: true,
                routes: "/recieve",
                onClick: () =>
                  handleTransaction("Payment Received", "/recieve"),
              },
              {
                label: "Swap",
                icon: <RiTokenSwapLine size={25} color="#0F0140" />,
                routes: "/swap",
                onClick: () => handleTransaction("Swap", "/swap"),
              },
            ].map(({ label, icon, rotate, routes, onClick }, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 text-white text-[14px]"
              >
                <button
                  className={`bg-[#F2E205] rounded-lg md:h-[60px] h-[40px] w-[40px] md:w-[60px]  flex items-center justify-center cursor-pointer ${
                    rotate ? "rotate-180" : ""
                  }`}
                  onClick={() => navigate(routes)}
                >
                  {icon}
                </button>
                {label}
              </div>
            ))}
          </section>
        </section>
      </header>

      <main className="h-[650px] md:h-[562px] bg-white overflow-hidden">
        <div className="h-full border flex flex-col">
          <table className="w-full text-center border-collapse">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                {showTnxHistory ? (
                  <th
                    className="p-4 border-b text-[#464446] text-[14px] text-left font-[400]"
                    colSpan={2}
                  >
                    History
                  </th>
                ) : (
                  <>
                    <th className="p-4 border-b text-[#464446] text-[14px] font-[400]">
                      Token
                    </th>
                    <th className="p-4 border-b text-[#464446] text-[14px] font-[400]">
                      Available
                    </th>
                  </>
                )}
              </tr>
            </thead>
          </table>

          <div className="overflow-y-auto flex-1 pb-20">
            {showTnxHistory ? (
              <TnxHistory
                isVisible={showTnxHistory}
                mockData={mockData}
                tokenTransactions={tokenTransactions}
                tokens={tokens}
              />
            ) : (
              <>
                <div className="w-full flex flex-col">
                  <div className="p-2 flex items-center gap-2 bg-white border-b sticky top-0 z-10">
                    <input
                      type="checkbox"
                      id="hide-zero"
                      checked={hideZeroBalances}
                      onChange={() => setHideZeroBalances(!hideZeroBalances)}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="hide-zero"
                      className="text-sm cursor-pointer"
                    >
                      Hide tokens with 0 balance
                    </label>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-center border-collapse table-fixed">
                      <tbody>
                        {filteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-100">
                            <td colSpan={2} className="p-2">
                              <Link
                                to={`/token-details/${item.id}`}
                                state={{
                                  tokenData: {
                                    ...item,
                                    network: item.network,
                                    balance_in_usdt: item.balance_in_usdt,
                                  },
                                }}
                                className="w-full flex justify-between"
                              >
                                <div className="p-4 text-[#3D3C3D] text-[14px] font-[400] text-left flex flex-col gap-1 w-full">
                                  <div className="flex gap-2 items-center">
                                    <img
                                      src={item.icon}
                                      className="w-[20px] h-[20px] rounded-full"
                                      alt="icon"
                                    />
                                    <span>{item.token_name}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {item.network} network
                                  </span>
                                </div>

                                <div className="p-4 text-[#3D3C3D] text-[14px] font-[400] text-right flex gap-1 flex-col w-full">
                                  <div className="flex gap-2 justify-end">
                                    {isVisible
                                      ? `${parseFloat(item.balance).toFixed(2)}`
                                      : "**"}
                                    <span>{item.symbol}</span>
                                  </div>

                                  <div className="text-[13px]">
                                    {isVisible
                                      ? `$${parseFloat(
                                          item.balance_in_usdt
                                        ).toFixed(2)}`
                                      : "**"}{" "}
                                    USDT
                                  </div>
                                </div>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 bg-white py-4 w-full  flex items-center justify-between px-[40px] md:px-[120px] border-t-[1px] border-[#B0AFB1]">
        <Link to="/dashboard">
          <LuWalletMinimal
            size={25}
            color={isActive("/dashboard") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
        <Link to="/p2p">
          <FaExchangeAlt
            size={25}
            color={isActive("/p2p") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
        <Link to="/card-display">
          <LuCreditCard
            size={25}
            color={isActive("/card-display") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
        <Link to="/settings">
          <LuSettings2
            size={25}
            color={isActive("/settings") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
      </footer>
    </section>
  );
};

export default HomePage;
