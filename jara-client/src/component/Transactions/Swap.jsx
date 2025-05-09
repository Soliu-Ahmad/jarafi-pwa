import { http, useAccount } from "wagmi";
import {
  CELO_CHAIN,
  ETHEREUM_CHAIN,
  // PROVIDERS,
  RPC_URLS,
  // STARKNET_CHAIN,
  TOKENS,
} from "../../constant/otherChains";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { celo, mainnet } from "viem/chains";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "react-toastify";
import {
  createParaAccount,
  createParaViemClient,
} from "@getpara/viem-v2-integration";
import para from "../../constant/paraClient";
import { createPublicClient } from "viem";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { USDC_MAINNET, USDT_MAINNET } from "../../constant/constant";
import { checkAxelarStatus } from "../../utils/utils";

const formatToken = (token) => ({
  chainId: celo.id,
  address: token.address,
  symbol: token.symbol,
  decimals: token.decimals,
  name: token.name,
  logoURI: token.icon,
});

const tokens = TOKENS.map(formatToken);
const CHAINS = [
  CELO_CHAIN,
  ETHEREUM_CHAIN,
  // STARKNET_CHAIN
];
// console.log(tokens)

const PROVIDERS = {
  1: new JsonRpcProvider("https://eth.llamarpc.com"),
  42220: new JsonRpcProvider("https://forno.celo.org"),
};

const Swap = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  // ========== State management ==========
  const [isLoading, setIsLoading] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState("");
  const [tokenBalance, setTokenBalance] = useState({});
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [fees, setFees] = useState(null);
  const [slippageTolerance, setSlippageTolerance] = useState("0");
  const [transactionRequest, setTransactionRequest] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [toChainId, setToChainId] = useState(null);
  const [filteredFromTokens, setFilteredFromTokens] = useState([]);
  const [filteredToTokens, setFilteredToTokens] = useState([]);
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const hexToBigInt = (hexValue) => BigInt(hexValue);
  const [isWaitingForAxelar, setIsWaitingForAxelar] = useState(false);

  // ========== State management end ==========

  const isStablecoin = (token) =>
    [USDC_MAINNET, USDT_MAINNET].includes(token?.address?.toLowerCase());

  const handleNetworkChange = (newChainId) => {
    // toast.success(`Network changed to: ${newChainId}`); // Debug log
    setSelectedNetwork(newChainId); // Update selected network

    // Filter tokens for the selected network
    const availableTokens = filterTokensByNetwork(TOKENS, newChainId);
    setFilteredFromTokens(availableTokens);

    // Set the first available token as the fromToken
    setFromToken(availableTokens[0] || null);
  };

  const handleFromTokenChange = (e) => {
    const tokenId = Number(e.target.value);
    const token = filteredFromTokens.find((t) => t.id === tokenId);
    // console.log(token);
    if (token) {
      setFromToken(token);
      setTokenBalance((prev) => ({ ...prev, [token.symbol]: "0.00" })); // Reset balance for the new token
    } else {
      setFromToken(null);
    }
  };

  const handleToTokenChange = (e) => {
    const tokenId = Number(e.target.value);
    const token = filteredToTokens.find((t) => t.id === tokenId);
    if (token) {
      setToToken(token);
    } else {
      setToToken(null);
    }
  };

  const debouncedFetchExchange = useCallback(
    debounce((amount) => {
      if (amount && parseFloat(amount) > 0) {
        fetchExchangeDetails(amount);
      }
    }, 500), // 500ms delay
    [fromToken, toToken, selectedNetwork, toChainId]
  );

  useEffect(() => {
    return () => {
      debouncedFetchExchange.cancel();
    };
  }, [debouncedFetchExchange]);

  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    setFromAmount(value);
    debouncedFetchExchange(value);
  };

  const publicClient = createPublicClient({
    chain: selectedNetwork === CELO_CHAIN.id ? celo : mainnet,
    transport: http(RPC_URLS[selectedNetwork]),
  });

  // Token address resolution
  const getTokenAddress = (token, chainId) => {
    // console.log(`Checking token: ${token.symbol}, chainId: ${chainId}`);

    // Check if the token has a `networks` property
    if (token.networks && token.networks[chainId]?.address !== undefined) {
      // console.log(
      //   `Resolved address from networks: ${token.networks[chainId].address}`
      // );
      return token.networks[chainId].address;
    }

    // Check if the token has a `chainId` property and it matches
    if (!token.networks && token.chainId === chainId) {
      // console.log(`Resolved address from chainId: ${token.address}`);
      return token.address;
    }

    // console.log(
    //   `No address found for token: ${token.symbol}, chainId: ${chainId}`
    // );
    return undefined;
  };

  const filterTokensByNetwork = (tokens, chainId) => {
    return tokens.filter((token) => {
      const address = getTokenAddress(token, chainId);
      return address !== undefined;
    });
  };

  // Fetch token balances from the blockchain ==== functions.
  const fetchTokenBalance = async () => {
    if (!address || !fromToken) {
      setError("Wallet address or token not available");
      setIsLoading(false);
      return;
    }

    try {
      // Get the chainId for the token
      const tokenChainId =
        fromToken.networks && fromToken.networks[selectedNetwork]
          ? selectedNetwork
          : fromToken.chainId;

      const tokenAddress = getTokenAddress(fromToken, selectedNetwork);

      // console.log(
      //   `Fetching balance for token: ${fromToken.symbol}, Address: ${tokenAddress}`
      // );

      if (fromToken.symbol === "USDC" && tokenChainId === "42220") {
        console.log("Fetching USDC on Celo...");
      }

      // console.log(tokenChainId)
      if (!tokenAddress) {
        setTokenBalance((prev) => ({ ...prev, [fromToken.symbol]: "0.00" }));
        setIsLoading(false);
        return;
      }

      // Select provider based on chainId
      const provider = PROVIDERS[tokenChainId];
      // console.log(`Using provider for chainId ${tokenChainId}:`, provider);

      if (!provider) {
        console.error(`Provider not found for chainId: ${tokenChainId}`);
        setTokenBalance((prev) => ({ ...prev, [fromToken.symbol]: "0.00" }));
        setIsLoading(false);
        return;
      }

      let balance;
      if (!tokenAddress) {
        // Native token balance (ETH, CELO, etc.)
        balance = await provider.getBalance(address);
      } else {
        const contract = new Contract(
          tokenAddress,
          [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
          ],
          provider
        ).connect(provider);

        // console.log(
        //   `Calling balanceOf for address: ${address} at ${tokenAddress}`
        // );
        balance = await contract.balanceOf(address);
      }

      // Update token balance in state
      setTokenBalance((prev) => ({
        ...prev,
        [fromToken.symbol]: ethers.formatUnits(balance, fromToken.decimals),
      }));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setError("Failed to fetch token balance");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- SquidRouter Integration Helpers ----------------

  // Get the optimal route from SquidRouter.
  const getRoute = async (params) => {
    try {
      const response = await axios.post(
        "https://apiplus.squidrouter.com/v2/route",
        params,
        {
          headers: {
            "x-integrator-id": import.meta.env.VITE_APP_SQUID_INTEGRATOR_ID,
            "Content-Type": "application/json",
          },
        }
      );
      return {
        route: response.data.route,
        requestId: response.headers["x-request-id"],
      };
    } catch (error) {
      console.error("Route error:", error.response?.data || error);
      throw error;
    }
  };

  // Check the transaction status via SquidRouter.
  const getStatus = async (params) => {
    try {
      const response = await axios.get(
        "https://apiplus.squidrouter.com/v2/status",
        {
          params: {
            transactionId: params.transactionId,
            requestId: params.requestId,
            fromChainId: params.fromChainId,
            toChainId: params.toChainId,
          },
          headers: {
            "x-integrator-id": import.meta.env.VITE_APP_SQUID_INTEGRATOR_ID,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Status error:", error.response?.data || error);
      throw error;
    }
  };

  // Poll the SquidRouter API until the transaction status reaches a completed state.
  const updateTransactionStatus = async (txHash, requestId) => {
    const getStatusParams = {
      transactionId: txHash,
      requestId: requestId,
      fromChainId: `${selectedNetwork}`,
      toChainId: `${toChainId}`,
    };

    const completedStatuses = [
      "success",
      "partial_success",
      "needs_gas",
      "not_found",
    ];
    let retryCount = 0;

    do {
      try {
        const status = await getStatus(getStatusParams);
        // console.log(`Route status: ${status.squidTransactionStatus}`);
        if (completedStatuses.includes(status.squidTransactionStatus)) break;
      } catch (error) {
        if (error.response?.status === 404 && retryCount < 10) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } while (true);
  };

  // Approve the SquidRouter contract to spend token.

  const erc20Abi = [
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const approveSpending = async (spender, tokenAddress, amount) => {
    try {
      const viemParaAccount = await createParaAccount(para);
      if (!viemParaAccount) {
        throw new Error("Failed to retrieve account details.");
      }

      const paraViemSigner = createParaViemClient(para, {
        account: viemParaAccount,
        chain: selectedNetwork === CELO_CHAIN.id ? celo : mainnet,
        transport: http(RPC_URLS[selectedNetwork]),
      });

      // Use existing publicClient instead of creating new provider
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [viemParaAccount.address, spender],
      });

      // console.log(allowance.toString());
      // console.log("Current Allowance:", allowance.toString());

      if (allowance >= BigInt(amount)) {
        console.info("Sufficient allowance already granted.");
        return;
      }

      toast.info("Initiating approval transaction...");

      const txHash = await paraViemSigner.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
      });

      toast.success("Approved successfully:");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2,
      });

      // console.log(receipt);
      if (receipt.status === "success") {
        // console.log("Approval successful:", receipt);
        // console.log("Token approval successful ✅");
        return receipt;
      } else {
        throw new Error("Transaction reverted");
      }
    } catch (error) {
      console.error("Approval failed:", error);

      if (error.reason) {
        console.error("Approval failed: " + error.reason);
      } else if (error.data && error.data.message) {
        console.error("Approval failed: " + error.data.message);
      } else {
        console.error("Approval failed: " + error.message);
      }
    }
  };

  // ---------------- End SquidRouter Helpers ----------------

  // Fetch exchange details and update exchangeRate, fees, and the calculated tokenTo amount.
  const fetchExchangeDetails = async (amount) => {
    // Validate input
    if (!amount || parseFloat(amount) <= 0) {
      setToAmount("");
      setExchangeRate(null);
      setFees(null);
      return;
    }

    // Validate token addresses
    const fromAddress = getTokenAddress(fromToken, selectedNetwork);
    const toAddress = getTokenAddress(toToken, toChainId);

    if (!fromAddress || !toAddress) {
      toast.error("Invalid token selection for these networks");
      return;
    }

    try {
      setIsExchanging(true);
      const params = {
        fromAddress: address,
        fromChain: `${selectedNetwork}`,
        fromToken: getTokenAddress(fromToken, selectedNetwork),
        fromAmount: ethers.parseUnits(amount, fromToken.decimals).toString(),
        toChain: `${toChainId}`,
        toToken: getTokenAddress(toToken, toChainId),
        toAddress: address,
      };

      const { data } = await axios.post(
        "https://apiplus.squidrouter.com/v2/route",
        params,
        {
          headers: {
            "x-integrator-id": import.meta.env.VITE_APP_SQUID_INTEGRATOR_ID,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log({data})

      const route = data.route;
      if (!route.estimate || !route.estimate.toAmount) {
        const errorMsg =
          route.message || "Missing estimate data from SquidRouter API";
        throw new Error(errorMsg);
      }

      // console.log(route)
      setSlippageTolerance(route.estimate.aggregateSlippage);
      const toAmountFormatted = ethers.formatUnits(
        route.estimate.toAmount,
        toToken.decimals
      );

      setExchangeRate(
        (parseFloat(toAmountFormatted) / parseFloat(amount)).toFixed(4)
      );
      setFees(parseFloat(route.estimate.gasCosts[0]?.amountUsd) || "0.00");
      setToAmount(toAmountFormatted);
      setTransactionRequest(route.transactionRequest);
      setIsExchanging(false);
    } catch (error) {
      setIsExchanging(false);
      console.error("Error fetching exchange details:", error);
      toast.error(
        `Exchange error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // The main swap handler integrating the SquidRouter flow.
  const handleSwap = async () => {
    setIsSwapping(true);
    const fromAddress = getTokenAddress(fromToken, selectedNetwork);
    const toAddress = getTokenAddress(toToken, toChainId);

    if (!fromAddress || !toAddress) {
      toast.error("Selected tokens not available on these networks");
      return;
    }
    try {
      const viemParaAccount = await createParaAccount(para);
      const paraViemSigner = createParaViemClient(para, {
        account: viemParaAccount,
        chain: selectedNetwork === CELO_CHAIN.id ? celo : mainnet,
        transport: http(RPC_URLS[selectedNetwork]),
      });

      // Get route
      const { route, requestId } = await getRoute({
        fromAddress: address,
        fromChain: `${selectedNetwork}`,
        fromToken: getTokenAddress(fromToken, selectedNetwork),
        fromAmount: ethers
          .parseUnits(fromAmount, fromToken.decimals)
          .toString(),
        toChain: `${toChainId}`,
        toToken: getTokenAddress(toToken, toChainId),
        toAddress: address,
      });

      // console.log("Transaction request:", route.transactionRequest);

      // Handle approval
      await approveSpending(
        route.transactionRequest.target,
        getTokenAddress(fromToken, selectedNetwork),
        ethers.parseUnits(fromAmount, fromToken.decimals).toString()
      );

      // Execute swap
      const txHash = await paraViemSigner.sendTransaction({
        to: route.transactionRequest.target,
        data: route.transactionRequest.data,
        value: 0n,
        gasPrice: await publicClient.getGasPrice(),
        gasLimit: route.transactionRequest.gasLimit,
      });

      setIsWaitingForAxelar(true);
      await checkAxelarStatus(txHash);
      // console.log("✅ Axelar GMP transaction is indexed.");
      setIsWaitingForAxelar(false);

      await updateTransactionStatus(txHash, requestId);
      toast.success("Swap successful!");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      showNotification("Swap Complete", "Your token swap has been completed.");

      navigate("/dashboard");
    } catch (error) {
      console.error(`Swap failed: ${error.shortMessage || error.message}`);
      setIsWaitingForAxelar(false);
    } finally {
      setIsSwapping(false);
    }
  };

  const showNotification = (title, message) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/JaraFiLogin.png",
      });
    }
  };

  const handleMaxClick = () => {
    const maxBalance = tokenBalance[fromToken.symbol] || "0.00";
    setFromAmount(maxBalance);
    fetchExchangeDetails(maxBalance);
  };

  // Side actions --> useEffects
  useEffect(() => {
    if (address && fromToken && selectedNetwork) {
      fetchTokenBalance();
    }
  }, [address, fromToken, selectedNetwork]);

  useEffect(() => {
    if (toChainId) {
      const availableTokens = filterTokensByNetwork(TOKENS, toChainId);
      setFilteredToTokens(availableTokens);
      setToToken(null);
    }
  }, [toChainId]);

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchExchangeDetails(fromAmount);
    }
  }, [fromToken, toToken, selectedNetwork, toChainId]);

  useEffect(() => {
    // Prevent scrolling when component mounts
    document.body.classList.add("overflow-hidden");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <section className="bg-[#0F0140] min-h-screen w-full flex justify-center md:items-center p-4 sm:p-8 relative">
      {showConfetti && <Confetti width={width} height={height} />}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-white"
      >
        <FaArrowLeftLong size={25} />
      </button>

      <div className="flex flex-col items-center w-full max-w-2xl gap-6">
        <p className="text-2xl text-[#F6F5F6] font-bold my-6 text-center">
          Swap Assets
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="text-center">
            <label className="text-white text-sm mb-2 block">
              From Network
            </label>
            <select
              className="w-full text-white bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4"
              value={selectedNetwork || ""}
              onChange={(e) => handleNetworkChange(Number(e.target.value))}
            >
              <option value="" disabled>
                Select a network
              </option>
              {CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <label className="text-white text-sm mb-2 block">To Network</label>
            <select
              className="w-full text-white bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4"
              value={toChainId || ""}
              onChange={(e) => setToChainId(Number(e.target.value))}
            >
              <option value="" disabled>
                Select a network
              </option>
              {CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full space-y-4">
          {/* From Token Input */}
          <div className="bg-[#1D143E] rounded-lg border border-[#FFFFFF80] p-4 flex flex-col">
            <div className="flex justify-between">
              <input
                type="text"
                placeholder="0.00"
                value={fromAmount}
                onChange={handleFromAmountChange}
                className="bg-transparent text-white outline-none w-2/3"
              />
              <select
                className="bg-transparent text-white outline-none border-none"
                value={fromToken?.id || ""}
                onChange={handleFromTokenChange}
                disabled={!selectedNetwork}
              >
                <option value="" disabled>
                  Select a token
                </option>
                {filteredFromTokens.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end mt-4 gap-4">
              <p className="text-xs text-[#F6F5F6]">
                Avail Bal:{" "}
                {fromToken
                  ? parseFloat(tokenBalance[fromToken.symbol] || 0).toFixed(2)
                  : "0.00"}
              </p>
              <p
                className="text-xs text-[#F2E205] cursor-pointer"
                onClick={handleMaxClick}
              >
                MAX
              </p>
            </div>
          </div>

          {/* To Token Input */}
          <div className="bg-[#1D143E] rounded-lg border border-[#FFFFFF80] p-4">
            <div className="flex justify-between">
              <input
                type="text"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="w-full bg-transparent text-white outline-none border-none"
              />
              <select
                className="bg-transparent text-white outline-none border-none"
                value={toToken?.id || ""}
                onChange={handleToTokenChange}
                disabled={!toChainId}
              >
                <option value="" disabled>
                  Select a token
                </option>
                {filteredToTokens.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exchange Details */}
        {selectedNetwork &&
          toChainId &&
          fromToken &&
          toToken &&
          (isExchanging ? (
            <p className="text-white">Fetching exchange details...</p>
          ) : (
            <div className="w-full bg-[#1D143E] rounded-lg border border-[#FFFFFF80] p-4 space-y-2 md:my-6 my-2">
              <div className="flex justify-between text-[#FFFFFF80] text-sm">
                <p>Exchange Rate:</p>
                <p>
                  1 {fromToken.symbol} ≈ {exchangeRate || "0.00"}{" "}
                  {toToken.symbol}
                </p>
              </div>
              <div className="flex justify-between text-[#FFFFFF80] text-sm">
                <p>Fees:</p>
                <p>
                  {fees || "0.00"} {fromToken.symbol}
                </p>
              </div>
              <div className="flex justify-between text-[#FFFFFF80] text-sm">
                <p>Slippage Tolerance:</p>
                <p>{parseFloat(slippageTolerance).toFixed(2)}%</p>
              </div>
            </div>
          ))}

        {isWaitingForAxelar && (
          <div className="flex items-center space-x-2 text-blue-500 mt-4">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span>Waiting for Axelar cross-chain confirmation...</span>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={
            isSwapping ||
            !selectedNetwork ||
            !toChainId ||
            !fromToken ||
            !toToken
          }
          className={`p-[10px] rounded-[10px] w-full text-[16px] font-[600] font-[Montserrat] text-center flex items-center justify-center gap-2 transition-all duration-200
    ${
      isSwapping
        ? "bg-[#4F4E50] text-[#F2E205] cursor-not-allowed"
        : "bg-[#F2E205] text-[#4F4E50] hover:bg-[#e6d904]"
    }`}
        >
          {isSwapping ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-[#F2E205]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </section>
  );
};

export default Swap;
