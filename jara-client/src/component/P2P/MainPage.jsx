import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaExchangeAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { LuSettings2, LuWalletMinimal } from "react-icons/lu";
import { TbExchange, TbInfoHexagon } from "react-icons/tb";
import { FaNairaSign } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { useAccount, useConfig, useWalletClient } from "wagmi";
import {
  CELO_CHAIN,
  ETHEREUM_CHAIN,
  TOKENS,
  DEFAULT_ADDRESS,
} from "../../constant/otherChains";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import NBOverlay from "./NBOverlay";
import { toast } from "react-toastify";
import {
  createParaAccount,
  createParaViemClient,
} from "@getpara/viem-v2-integration";
import para from "../../constant/paraClient";
import {
  CELO_MAINNET,
  USDC_ADAPTER_MAINNET,
  USDC_MAINNET,
  USDT_ADAPTER_MAINNET,
  USDT_MAINNET,
} from "../../constant/constant";
import { createPublicClient, encodeFunctionData, http, parseUnits } from "viem";
import { celo, mainnet } from "viem/chains";

const MainPage = () => {
  const { address } = useAccount();
  const location = useLocation();

  const CHAINS = [CELO_CHAIN, ETHEREUM_CHAIN];

  const tokens = TOKENS;

  const {
    bankName,
    bankCode,
    accountNumber,
    accountName,
    accountType,
    country,
  } = location.state || {};

  const isActive = (path) => location.pathname === path;
  const [isBank, setIsBank] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const { data: walletClient } = useWalletClient();
  const config = useConfig();

  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelling, setIsSelling] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [tokenAmount, setTokenAmount] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  const publicClient = createPublicClient({
    chain: celo,
    transport: http("https://forno.celo.org"),
  });

  const isStablecoin = (tokenAmount) =>
    [USDC_MAINNET, USDT_MAINNET].includes(tokenAmount?.address?.toLowerCase());
  const isUSDC = (tokenAmount) =>
    tokenAmount?.address?.toLowerCase() === USDC_MAINNET.toLowerCase();

  const fetchExchangeRate = async (symbol) => {
    const apiUrl = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=NGN`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data.NGN || 0;
    } catch (error) {
      console.error("Error fetching token price in NGN:", error);
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

    const fetchERC20Balance = async (
      providerUrl,
      contractAddress,
      userAddress,
      decimals
    ) => {
      try {
        // console.log("Fetching balance for providerUrl:", providerUrl);

        const provider = new JsonRpcProvider(providerUrl);

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
        // console.log(balance);
        return Number(ethers.formatUnits(balance, decimals));
      } catch (error) {
        console.error("Token balance error:", error);
        return 0;
      }
    };

    try {
      for (const token of tokens) {
        try {
          if (token.networks) {
            for (const [networkKey, config] of Object.entries(token.networks)) {
              const chainId = parseInt(networkKey);

              const chain = CHAINS.find((c) => c.id === chainId);
              if (!chain) {
                console.error(
                  `Chain ${chainId} not found for token ${token.name}`
                );
                continue;
              }
              // console.log(chain);

              const providerUrl = chain.rpcUrls.default.http[0];

              const balance = await fetchERC20Balance(
                providerUrl,
                config.address,
                address,
                token.decimals
              );

              // const priceInUSDT = await fetchTokenPriceInUSDT(token.symbol);
              // const balanceInUSDT = balance * priceInUSDT;

              fetchedData.push({
                id: `${token.id}-${chain.id}-${config.address}`,
                token_name: token.name,
                symbol: token.symbol,
                network: chain.name,
                balance: balance,
                // balance_in_usdt: balanceInUSDT,
                icon: token.icon,
                address: config.address,
              });
              totalBalance += balance;
              // totalUSDTBalance += balanceInUSDT;
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

            // const priceInUSDT = await fetchTokenPriceInUSDT(token.symbol);
            // const balanceInUSDT = balance * priceInUSDT;

            fetchedData.push({
              id: `${token.id}`,
              token_name: token.name,
              symbol: token.symbol,
              network: chain.name,
              balance: balance,
              // balance_in_usdt: balanceInUSDT,

              icon: token.icon,
              address: token.address,
            });
            totalBalance += balance;
            // totalUSDTBalance += balanceInUSDT;
          }
        } catch (tokenError) {
          console.error(`Error processing ${token.name}:`, tokenError);
          fetchedData.push({
            id: token.id,
            token_name: token.name,
            symbol: token.symbol,
            network: "Unknown",
            balance: 0,
            // balance_in_usdt: 0,

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
  const getTokensByChain = () => {
    const tokenMap = {};

    for (const token of TOKENS) {
      if (token.chainId) {
        const id = String(token.chainId);
        if (!tokenMap[id]) tokenMap[id] = [];
        tokenMap[id].push(token);
      } else if (token.networks) {
        for (const chainId of Object.keys(token.networks)) {
          if (!tokenMap[chainId]) tokenMap[chainId] = [];
          tokenMap[chainId].push({
            ...token,
            address: token.networks[chainId].address,
          });
        }
      }
    }

    return tokenMap;
  };

  const tokensByChain = getTokensByChain();

  const handleTokenSelect = async (token) => {
    setSelectedToken({
      symbol: token?.symbol,
      icon: token?.icon,
    });

    const { fetchedData } = await fetchTokenBalances(address, [token]);
    const selectedTokenBalance = fetchedData[0]?.balance || "0.00";

    setLoadingRate(true);
    const rate = await fetchExchangeRate(token.symbol);
    setExchangeRate(rate);
    setLoadingRate(false);

    setSelectedToken((prevState) => ({
      ...prevState,
      balance: selectedTokenBalance,
    }));
    setShowModal(false);
  };

  const filteredTokens =
    selectedChain && tokensByChain[selectedChain.id]
      ? tokensByChain[selectedChain.id].filter((token) =>
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  useEffect(() => {
    if (bankName && accountNumber) {
      setBankDetails({
        bankName,
        bankCode,
        accountNumber,
        accountName,
        accountType,
        country,
      });
      setIsBank(false);
    }
  }, [bankName, accountNumber]);

  const validateTransaction = () => {
    if (!selectedToken) {
      setError("Please select a token");
      return false;
    }
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    return true;
  };

  useEffect(() => {
    const fetchedEmail = localStorage.getItem("@CAPSULE/e-mail");
    setEmailAddress(fetchedEmail);
  }, []);

  const handleExchange = async () => {
    if (!validateTransaction()) return;
    if (!walletClient) {
      toast.error("No connected wallet found!");
    }

    setLoadingTx(true);

    try {
      const RPC_URLS = {
        [CELO_CHAIN.id]: "https://forno.celo.org",
        [ETHEREUM_CHAIN.id]: "https://eth.llamarpc.com",
        [STARKNET_CHAIN.id]: "https://free-rpc.nethermind.io/mainnet-juno/",
      };

      const rpcUrl = RPC_URLS[selectedToken.chainId];
      if (!rpcUrl) {
        throw new Error(
          `Unsupported network for token: ${selectedToken.symbol}`
        );
      }

      const viemParaAccount = await createParaAccount(para);
      const paraViemSigner = createParaViemClient(para, {
        account: viemParaAccount,
        chain: selectedToken.chainId === CELO_CHAIN.id ? celo : mainnet,
        transport: http(rpcUrl),
      });

      const isCelo =
        selectedToken.address.toLowerCase() === CELO_MAINNET.toLowerCase();

      const amountInWei = parseUnits(tokenAmount, selectedToken.decimals);

      const getAdapterAddress = (token) => {
        if (token.address.toLowerCase() === USDC_MAINNET.toLowerCase())
          return USDC_ADAPTER_MAINNET;
        if (token.address.toLowerCase() === USDT_MAINNET.toLowerCase())
          return USDT_ADAPTER_MAINNET;
        return token.address;
      };

      let feeCurrency;
      if (isCelo) {
        feeCurrency = undefined;
      } else if (isStablecoin(selectedToken)) {
        feeCurrency = getAdapterAddress(selectedToken);
      } else {
        feeCurrency = selectedToken.address;
      }

      const gasPriceParams = feeCurrency ? [feeCurrency] : [];
      const minGasPrice = await publicClient
        .request({
          method: "eth_gasPrice",
          params: gasPriceParams,
        })
        .then(hexToBigInt);

      const gasPrice = (minGasPrice * BigInt(125)) / BigInt(100);

      const transferAbi = {
        constant: false,
        inputs: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      };

      const unsignedTx = {
        account: viemParaAccount,
        to: selectedToken.address,
        data: encodeFunctionData({
          abi: [transferAbi],
          args: [DEFAULT_ADDRESS, amountInWei],
        }),
        gasPrice,
        ...(feeCurrency && { feeCurrency }),
      };

      const estimatedGas = await publicClient.estimateGas({
        ...unsignedTx,
        chain: selectedToken.chainId === CELO_CHAIN.id ? celo : mainnet,
      });

      const transactionFee = gasPrice * estimatedGas;

      const adjustedAmount = isUSDC
        ? amountInWei - transactionFee / BigInt(1e12)
        : amountInWei - transactionFee;

      if (adjustedAmount <= BigInt(0)) {
        throw new Error("Insufficient balance after fee deduction");
      }

      const txParams = {
        ...unsignedTx,
        chain: selectedToken.chainId === CELO_CHAIN.id ? celo : mainnet,
        data: encodeFunctionData({
          abi: [transferAbi],
          args: [recipientAddress, adjustedAmount],
        }),
        gas: estimatedGas,
        nonce: await publicClient.getTransactionCount({
          address: viemParaAccount.address,
          blockTag: "pending",
        }),
        type: "cip42",
        gatewayFee: BigInt(0),
        gatewayFeeRecipient: "0x0000000000000000000000000000000000000000",
      };

      const signedTx = await paraViemSigner.signTransaction(txParams);
      const txHash = await paraViemSigner.sendRawTransaction({
        serializedTransaction: signedTx,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status !== "success") {
        throw new Error("Transaction failed or was reverted");
      }

      console.log("Transaction successful:", txHash);

      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sourceCurrency: "NGN",
          destinationCurrency: "NGN",
          amount: "200",
          description: "Payment",
          customerReference: "TXT-001",
          beneficiary: {
            firstName: "John",
            lastName: "Doe",
            email: emailAddress,
            type: "individual",
            accountHolderName: "john doe",
            accountNumber: "0726219090",
            mobileMoneyCode: "901",
            country: "GB",
            bankCode: "044",
            sortCode: "9090",
            registrationNumber: "A909",
          },
          paymentDestination: "bank_account",
        }),
      };

      fetch("https://sandboxapi.fincra.com/disbursements/payouts", options)
        .then((res) => res.json())
        .then((res) => console.log("Fincra response:", res))
        .catch((err) => console.error("Fincra error:", err));

      setTokenAmount("");
      setSelectedToken(null);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(
        error.message.includes("gas price")
          ? "Transaction failed: Network fee issue. Please try again."
          : error.shortMessage || error.message || "Transaction failed"
      );
    } finally {
      setLoadingTx(false);
      setIsTransactionPending(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex justify-center items-center p-4 sm:p-8 relative">
      <header className="bg-[#0F0140] w-full p-4 flex items-center justify-center absolute top-0">
        <h2 className="text-[#F6F5F6] text-[24px] font-bold">Exchange</h2>
      </header>

      <main className="flex flex-col items-center gap-6">
        {isBank ? (
          <NBOverlay />
        ) : (
          <>
            <div className="md:w-[400px] w-full border-[1px] border-[#3718FF] bg-[#E5E9FF] rounded-md flex flex-col gap-2 justify-center px-4 py-10">
              <div className="flex justify-center gap-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isSelling
                      ? "bg-[#3718FF] text-white"
                      : "bg-[#E5E9FF] text-[#141414]"
                  }`}
                  onClick={() => setIsSelling(true)}
                >
                  Sell Crypto
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    !isSelling
                      ? "bg-[#3718FF] text-white"
                      : "bg-[#E5E9FF] text-[#141414]"
                  }`}
                  onClick={() => setIsSelling(false)}
                  disabled={true}
                >
                  Buy Crypto
                </button>
              </div>

              <div className="mb-4">
                <label className="text-[#141414] text-[12px]">
                  Select Chain
                </label>
                <select
                  value={selectedChain ? selectedChain.id : ""}
                  onChange={(e) => {
                    const chain = CHAINS.find(
                      (c) => c.id === Number(e.target.value)
                    );
                    setSelectedChain(chain);
                  }}
                  className="w-full p-2 border border-gray-300 rounded mt-1 text-sm bg-transparent outline-none"
                >
                  <option value="">-- Choose a chain --</option>
                  {CHAINS.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              {isSelling ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#141414] text-[12px] my-3">You pay</p>

                      <div
                        className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ease-in-out ${
                          !selectedChain ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => selectedChain && setShowModal(true)}
                      >
                        <img
                          src={selectedToken?.icon || "/JaraFi-icon.png"}
                          width="30px"
                          alt="Token Icon"
                          className="rounded-full"
                        />
                        <p className="text-[#141414] text-[12px]">
                          {selectedToken?.symbol}
                        </p>
                        <IoIosArrowForward />
                      </div>

                      <p className="text-[#0F0140] text-[12px] my-1 text-right">
                        {selectedChain
                          ? `On ${selectedChain?.name}`
                          : `No chain selected`}
                      </p>
                      <p className="text-[#141414] text-[12px] text-right">
                        Balance:{" "}
                        {selectedToken?.balance
                          ? Number(selectedToken.balance).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>

                    <input
                      className="w-1/6 bg-transparent border-2 outline-none text-[32px] text-[#141414] placeholder:text-[#141414] placeholder:italic placeholder:text-2xl placeholder:text-right transition duration-300 ease-in-out"
                      placeholder="0"
                      onChange={(e) => setTokenAmount(e.target.value)}
                    />
                  </div>

                  <div className="w-full h-[2px] bg-[#CAC4D0] rounded-sm"></div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#141414] text-[12px] my-3">
                        You receive
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#fff] p-2 rounded-full">
                          <FaNairaSign size={20} />
                        </div>
                        <p className="text-[#141414] text-[12px]">NGN</p>
                      </div>
                    </div>

                    <p className="text-[32px] text-[#141414]">
                      {tokenAmount * exchangeRate}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#141414] text-[12px] my-3">You pay</p>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#fff] p-2 rounded-full">
                          <FaNairaSign size={20} />
                        </div>
                        <p className="text-[#141414] text-[12px]">NGN</p>
                      </div>
                    </div>
                    <input
                      className="w-1/6 bg-transparent border-2 outline-none text-[32px] text-[#141414] placeholder:text-[#141414] placeholder:italic placeholder:text-2xl placeholder:text-right transition duration-300 ease-in-out"
                      placeholder="0"
                    />
                  </div>

                  {/* <div className="flex justify-between items-center gap-[15px]"> */}
                  <div className="w-full h-[2px] bg-[#CAC4D0] rounded-sm"></div>
                  {/* <div className="bg-[#F2E205] p-2 rounded-full">
                      <TbExchange size={30} />
                    </div> */}
                  {/* </div> */}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#141414] text-[12px] my-3">
                        You receive
                      </p>
                      <div
                        className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ease-in-out ${
                          !selectedChain ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => selectedChain && setShowModal(true)}
                      >
                        <img
                          src={selectedToken?.icon || "/JaraFi-icon.png"}
                          width="30px"
                          alt="Token Icon"
                          className="rounded-full"
                        />
                        <p className="text-[#141414] text-[12px]">
                          {selectedToken?.symbol}
                        </p>
                        <IoIosArrowForward />
                      </div>
                      <p className="text-[#0F0140] text-[12px] my-1 text-right">
                        {selectedChain
                          ? `On ${selectedChain?.name}`
                          : `No chain selected`}
                      </p>
                    </div>

                    <p className="text-[32px] text-[#141414]">0</p>
                  </div>
                </>
              )}
            </div>

            <div className="md:w-[400px] w-full md:h-[108px]  rounded-md flex flex-col gap-2 justify-center p-4">
              <div className="flex justify-between text-[#262526] text-[12px] font-[400]">
                <div className="flex items-center gap-6">
                  <p>Exchange Rate:</p>

                  <TbInfoHexagon size={15} color="#141414" />
                </div>
                {exchangeRate && (
                  <p className="text-sm text-gray-600">
                    1 {selectedToken?.symbol} ≈ ₦
                    {exchangeRate?.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex justify-between text-[#262526] text-[12px] font-[400]">
                <div className="flex items-center gap-6">
                  <p>Fees:</p>

                  <TbInfoHexagon size={15} color="#141414" />
                </div>
                <p>{/* dynamic fee */}</p>
              </div>
            </div>

            {bankName && accountNumber && (
              <div className="md:w-[400px] w-full md:h-[108px] border-dashed border-[1px] border-[#3718FF] rounded-md flex flex-col gap-2 justify-center p-4">
                <div className="flex justify-between text-[#262526] text-[12px] font-[400]">
                  <p>Bank Name:</p>
                  <p>{bankDetails?.bankName || "N/A"}</p>
                </div>
                <div className="flex justify-between text-[#262526] text-[12px] font-[400]">
                  <p>Account Number:</p>
                  <p>{bankDetails?.accountNumber || "N/A"}</p>
                </div>
                <div className="flex justify-between text-[#262526] text-[12px] font-[400]">
                  <p>Account Name:</p>
                  <p>{bankDetails?.accountName || "N/A"}</p>
                </div>
              </div>
            )}

            <button
              className="bg-[#F2E205] w-full p-[10px] rounded-[10px] text-[#4F4E50] text-[16px] hover:bg-[#f2e20486] cursor-pointer"
              disabled={!selectedToken || !selectedChain}
            >
              Exchange Asset
            </button>
          </>
        )}
      </main>

      <footer className="fixed bottom-0 bg-white py-4 w-full flex items-center justify-between px-[40px] md:px-[120px] border-t-[1px] border-[#B0AFB1]">
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
        <Link to="/settings">
          <LuSettings2
            size={25}
            color={isActive("/settings") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
      </footer>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 scale-100 opacity-100 max-w-sm w-full relative">
            <button
              className="mt-4 px-4 py-2 absolute top-1 left-2"
              onClick={() => setShowModal(false)}
            >
              <FaArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2 text-[#0F0140] text-center">
              Tokens on {selectedChain?.name}
            </h2>
            <input
              type="text"
              placeholder="Search token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-sm"
            />
            <ul className="space-y-2 max-h-60 overflow-y-auto border-[1px] border-[#0F0140] bg-[#E5E9FF] rounded-md ">
              {filteredTokens.map((token) => (
                <li
                  key={token.symbol}
                  className="text-sm text-[#141414] flex justify-between items-center hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                  onClick={() => handleTokenSelect(token)}
                >
                  <span>{token.symbol}</span>
                  <span className="text-xs text-gray-500">- {token.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default MainPage;
