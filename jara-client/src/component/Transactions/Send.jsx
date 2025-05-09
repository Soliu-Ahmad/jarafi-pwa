import React, { useState, useEffect } from "react";
import { Contract, ethers, isAddress, JsonRpcProvider } from "ethers";
import { Loader2 } from "lucide-react";
import TokenModal from "../Homepage/TokenModal";
import { useAccount, useConfig, useWalletClient } from "wagmi";
import { switchChain } from "wagmi/actions";
import {
  TOKENS,
  CELO_CHAIN,
  STARKNET_CHAIN,
  ETHEREUM_CHAIN,
  RPC_URLS as CHAIN_RPC_URLS,
} from "../../constant/otherChains";
import para from "../../constant/paraClient";
import {
  createParaAccount,
  createParaViemClient,
} from "@getpara/viem-v2-integration";
import {
  encodeFunctionData,
  http,
  parseUnits,
  createPublicClient,
  getContract,
  formatUnits,
} from "viem";
import { getStorageAt } from "@wagmi/core";
import { celo, mainnet } from "viem/chains";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import PinModal from "./PinModal";
import {
  CELO_MAINNET,
  IMPLEMENTATION_SLOT,
  USDC_ADAPTER_MAINNET,
  USDC_MAINNET,
  USDT_ADAPTER_MAINNET,
  USDT_MAINNET,
} from "../../constant/constant";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { getPin } from "../../redux/pinSlice";
import axios from "axios";

const Send = () => {
  // const { switchNetwork } = useSwitchNetwork();

  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useAccount();
  const config = useConfig();
  const { data: walletClient } = useWalletClient();
  const tokens = TOKENS;
  const CELO_CHAIN = { id: 42220, name: "Celo" };
  const ETHEREUM_CHAIN = { id: 1, name: "Ethereum" };
  const dispatch = useDispatch();

  const API_URL = import.meta.env.VITE_APP_SERVER_URL;

  const CHAINS = [CELO_CHAIN, ETHEREUM_CHAIN];

  const URLS = {
    1: new JsonRpcProvider("https://eth.llamarpc.com"),
    42220: new JsonRpcProvider("https://forno.celo.org"),
  };

  // State management
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [amountToReceive, setAmountToReceive] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(CHAINS[0].id);

  const isStablecoin = (token) =>
    [USDC_MAINNET, USDT_MAINNET].includes(token?.address?.toLowerCase());
  const isUSDC = (token) =>
    token?.address?.toLowerCase() === USDC_MAINNET.toLowerCase();

  const hexToBigInt = (hexValue) => BigInt(hexValue);

  const publicClient = createPublicClient({
    chain: celo,
    transport: http("https://forno.celo.org"),
  });

  // Functions

  const validateTransaction = () => {
    if (!selectedToken) {
      setError("Please select a token");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (!recipientAddress) {
      setError("Please enter a recipient address");
      return false;
    }

    return true;
  };

  async function getImplementationAddress(proxyAddress) {
    try {
      // Fetch the raw implementation address from storage
      const rawImplAddress = await getStorageAt(config, {
        address: proxyAddress,
        slot: IMPLEMENTATION_SLOT,
      });

      // Extract the last 40 characters (20 bytes) and prepend "0x"
      const implementationAddress = `0x${rawImplAddress.slice(-40)}`;

      // Validate the extracted address
      if (!ethers.isAddress(implementationAddress)) {
        console.error("Invalid implementation address:", implementationAddress);
        return null;
      }

      return implementationAddress;
    } catch (error) {
      console.error(
        `Failed to fetch implementation for ${proxyAddress}:`,
        error
      );
      return null;
    }
  }

  async function getAbi(implementationAddress) {
    if (!implementationAddress || !ethers.isAddress(implementationAddress)) {
      console.error("Invalid implementation address:", implementationAddress);
      return null;
    }

    try {
      // Initialize the contract with a minimal ABI
      const contract = getContract({
        address: implementationAddress,
        abi: [
          "function transfer(address to, uint256 amount)",
          "function balanceOf(address) view returns (uint256)",
        ],
        config,
      });

      // Return the contract's ABI
      return contract.abi;
    } catch (error) {
      console.error(`Failed to fetch ABI for ${implementationAddress}:`, error);
      return null;
    }
  }

  async function fetchAllData(selectedNetwork) {
    try {
      const updatedTokens = await Promise.all(
        tokens.map(async (token) => {
          const tokenAddress = getTokenAddress(token, selectedNetwork);

          const isSingleChainToken =
            !token.networks && token.chainId === selectedNetwork;

          if (!tokenAddress && !isSingleChainToken) {
            // console.warn(
            //   `Token ${token.symbol} is not listed on network ${selectedNetwork}. Skipping.`
            // );
            return null;
          }

          if (tokenAddress === null) {
            return {
              ...token,
              implementationAddress: null,
              abi: null,
              isNative: true,
            };
          }

          const addressToUse = tokenAddress || token.address;

          if (!addressToUse || !isAddress(addressToUse)) {
            console.error(
              `Invalid address for token ${token.symbol}:`,
              addressToUse
            );
            return null;
          }

          try {
            const implementationAddress = await getImplementationAddress(
              tokenAddress
            );

            const abi = implementationAddress
              ? await getAbi(implementationAddress)
              : null;

            return {
              ...token,
              implementationAddress,
              abi,
            };
          } catch (error) {
            console.error(`Error processing token ${token.symbol}:`, error);
            return {
              ...token,
              implementationAddress: null,
              abi: null,
            };
          }
        })
      );

      return updatedTokens.filter((token) => token !== null);
    } catch (error) {
      console.error("Error fetching all data:", error);
      throw error;
    }
  }

  const getTokenAddress = (token, selectedNetwork) => {
    if (token.networks && token.networks[selectedNetwork]) {
      return token.networks[selectedNetwork].address;
    }

    if (!token.networks && token.chainId === selectedNetwork) {
      return token.address;
    }
    return token.address;
  };

  const validateAndSend = async () => {
    if (!validateTransaction()) return;
    if (!walletClient) {
      setError("Wallet not connected");
      return;
    }

    const tokenAddress = getTokenAddress(selectedToken, selectedNetwork);
    if (!tokenAddress) {
      setError("Token not supported on this network");
      return;
    }
    setIsLoading(true);
    setError("");
    setIsTransactionPending(true);

    try {
      const rpcUrl = CHAIN_RPC_URLS[selectedNetwork];
      console.log({ rpcUrl, selectedNetwork, selectedToken });
      if (!rpcUrl) {
        throw new Error(
          `Unsupported network for token: ${selectedToken.symbol}`
        );
      }

      // Switch chain if necessary
      if (currentChainId !== selectedNetwork) {
        // this now works because Wagmi knows about Celo
        await switchChain({ chainId: selectedNetwork });
      }

      // Create ParaAccount and Viem signer with the correct RPC URL
      const viemParaAccount = await createParaAccount(para);
      const paraViemSigner = createParaViemClient(para, {
        account: viemParaAccount,
        chain: selectedToken.chainId === CELO_CHAIN.id ? celo : mainnet,
        transport: http(rpcUrl),
      });

      const isCelo = tokenAddress.toLowerCase() === CELO_MAINNET.toLowerCase();

      const amountInWei = parseUnits(amount, selectedToken.decimals);

      // Get adapter address for stablecoins
      const getAdapterAddress = (addr) => {
        if (addr.toLowerCase() === USDC_MAINNET.toLowerCase())
          return USDC_ADAPTER_MAINNET;
        if (addr.toLowerCase() === USDT_MAINNET.toLowerCase())
          return USDT_ADAPTER_MAINNET;
        return addr;
      };

      // Determine fee currency
      let feeCurrency;
      if (isCelo) {
        feeCurrency = undefined;
      } else if (isStablecoin(selectedToken)) {
        feeCurrency = getAdapterAddress(selectedToken);
      } else {
        feeCurrency = selectedToken.address;
      }

      // Fetch gas price
      const gasPriceParams = feeCurrency ? [feeCurrency] : [];
      const minGasPrice = await publicClient
        .request({
          method: "eth_gasPrice",
          params: gasPriceParams,
        })
        .then(hexToBigInt);

      const gasPrice = (minGasPrice * BigInt(125)) / BigInt(100);

      // Define transfer ABI
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

      // Prepare unsigned transaction
      const unsignedTx = {
        account: viemParaAccount,
        to: tokenAddress,
        data: encodeFunctionData({
          abi: [transferAbi],
          args: [recipientAddress, amountInWei],
        }),
        gasPrice,
        ...(feeCurrency ? { feeCurrency } : {}),
      };

      // Estimate gas
      const estimatedGas = await publicClient.estimateGas({
        ...unsignedTx,
        chain: selectedToken.chainId === CELO_CHAIN.id ? celo : mainnet,
      });

      // Calculate transaction fee
      const transactionFee = gasPrice * estimatedGas;

      // Adjust amount for fees (if applicable)
      const adjustedAmount = isUSDC
        ? amountInWei - transactionFee / BigInt(1e12)
        : amountInWei - transactionFee;

      if (adjustedAmount <= BigInt(0)) {
        throw new Error("Insufficient balance after fee deduction");
      }

      // Prepare transaction parameters
      const txParams = {
        ...unsignedTx,
        chain: selectedNetwork === CELO_CHAIN.id ? celo : mainnet,
        data: encodeFunctionData({
          abi: [transferAbi],
          args: [recipientAddress, adjustedAmount],
        }),
        gas: estimatedGas,
        nonce: await publicClient.getTransactionCount({
          address: viemParaAccount.address,
          blockTag: "pending",
        }),
        type: "cip42", // Celo-specific transaction type
        gatewayFee: BigInt(0),
        gatewayFeeRecipient: "0x0000000000000000000000000000000000000000",
      };

      // Sign and send the transaction
      const signedTx = await paraViemSigner.signTransaction(txParams);
      const txHash = await paraViemSigner.sendRawTransaction({
        serializedTransaction: signedTx,
      });

      // Reset form and show success message
      setAmount("");
      setRecipientAddress("");
      setSelectedToken(null);
      toast.success(
        `${Number(formatUnits(adjustedAmount, selectedToken.decimals)).toFixed(
          2
        )} ${selectedToken.symbol} sent successfully!`
      );

      // Show confetti and navigate to dashboard
      setShowConfetti(true);
      showNotification("Token Sent Successfully");
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
        navigate("/dashboard");
      }, 5000);

      return () => clearTimeout(confettiTimeout);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(
        error.message.includes("gas price")
          ? "Transaction failed: Network fee issue. Please try again."
          : error.shortMessage || error.message || "Transaction failed"
      );
    } finally {
      setIsLoading(false);
      setIsTransactionPending(false);
    }
  };

  const handleSend = async () => {
    if (!address) {
      setError("No wallet connected");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/pin/exists/${address}`);
      if (!response.data?.exists) {
        setError("No PIN found. Please set up your PIN first.");
        return;
      }
    } catch (err) {
      setError("Unable to check PIN existence.");
      return;
    }

    setIsPinModalOpen(true);
  };

  const showNotification = (title, message) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/JaraFiLogin.png",
      });
    }
  };

  const handleConfirmTransaction = async (enteredPin) => {
    try {
      const result = await dispatch(
        getPin({ wallet: address, pin: enteredPin })
      );

      if (getPin.rejected.match(result)) {
        setError(result.payload || "Error retrieving PIN");
        return;
      }

      setIsPinModalOpen(false);
      await validateAndSend();
    } catch (err) {
      setError("Unexpected error occurred.");
    }
  };

  const handleQuickAmount = (percentage) => {
    if (!balance) return;

    if (percentage === "MAX") {
      const maxAmount = parseFloat(balance) * 0.95;
      setAmount(maxAmount.toString());
    } else {
      const value = (parseFloat(balance) * parseInt(percentage)) / 100;
      setAmount(value.toString());
    }
  };

  const getEstimatedTotalCost = () => {
    if (!estimatedGas || !gasPrice || !amount) return null;

    if (isUSDC(selectedToken)) {
      const transactionFee = (gasPrice * estimatedGas) / BigInt(1e12);
      console.log(transactionFee);
      return {
        gas: formatUnits(transactionFee, 6),
        total: (
          parseFloat(amount) - parseFloat(formatUnits(transactionFee, 6))
        ).toFixed(6),
        symbol: "USDC",
      };
    }

    // Existing logic for other tokens
    const gasCostInWei = estimatedGas * gasPrice;
    return {
      gas: formatUnits(gasCostInWei, 18),
      total: parseFloat(amount).toFixed(6),
      symbol: "CELO",
    };
  };
  const QuickAmountButton = ({ label }) => (
    <button
      onClick={() => handleQuickAmount(label.replace("%", ""))}
      className="flex-1 py-3 bg-[#1A1831] border border-[#2D2B54] rounded-xl hover:bg-[#231f42] transition-colors"
    >
      <span className="text-white text-sm">{label}</span>
    </button>
  );

  const estimatedCost = getEstimatedTotalCost();

  const handleNetworkChange = (event) => {
    const newNetworkId = Number(event.target.value);
    setSelectedNetwork(newNetworkId);
    // console.log("Selected Network:", newNetworkId);
  };

  const filterTokensByNetwork = (tokens, selectedNetwork) => {
    return tokens.filter((token) => {
      const tokenAddress = token.networks?.[selectedNetwork]?.address;

      const isSingleChainToken =
        !token.networks && token.chainId === selectedNetwork;

      return tokenAddress || isSingleChainToken;
    });
  };

  // Side actions === useEffects.

  useEffect(() => {
    if (walletClient) {
      setCurrentChainId(walletClient.chain.id);
    }
  }, [walletClient]);

  useEffect(() => {
    const fetchBalanceAndGas = async () => {
      if (!selectedToken || !address || !selectedNetwork) return;

      const chainId = selectedNetwork;

      const RPC_ENDPOINTS = {
        42220: "https://forno.celo.org",
        1: "https://eth.llamarpc.com",
      };

      const rpcUrl = RPC_ENDPOINTS[chainId];
      if (!rpcUrl) {
        console.error(`No RPC endpoint configured for chain ID ${chainId}`);
        setError("Unsupported network");
        return;
      }

      const provider = new JsonRpcProvider(rpcUrl);

      try {
        const tokenAddress =
          selectedToken.networks?.[chainId]?.address || selectedToken.address;
        if (!tokenAddress) {
          console.error("No token address found for this network");
          setError("Token not available on this network");
          return;
        }

        const contract = new Contract(
          tokenAddress,
          [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
          ],
          provider
        );

        const tokenBalance = await contract.balanceOf(address);
        const formattedBalance = ethers.formatUnits(
          tokenBalance,
          selectedToken.decimals
        );
        setBalance(formattedBalance);
        // console.log("Fetched balance:", formattedBalance);

        if (chainId === 1 || chainId === 42220) {
          const currentGasPrice = await provider.getFeeData();
          setGasPrice(currentGasPrice.gasPrice);
        } else {
          setGasPrice(null);
        }
      } catch (error) {
        console.error("Error fetching balance and gas:", error);
        setError("Failed to fetch balance and gas price");
      }
    };

    fetchBalanceAndGas();
  }, [selectedToken, address, selectedNetwork]);

  useEffect(() => {
    const estimateGasFee = async () => {
      setIsEstimatingGas(true);
      setEstimatedGas(null);
      setGasPrice(null);
      setAmountToReceive(null);

      if (!selectedToken || !amount || !recipientAddress || !address) {
        setIsEstimatingGas(false);
        return;
      }

      // console.log(selectedToken)

      try {
        const tokenAddress = getTokenAddress(selectedToken, selectedNetwork);
        if (!tokenAddress || typeof tokenAddress !== "string") {
          throw new Error("Invalid token address");
        }

        const tokenAddressLower = tokenAddress.toLowerCase();

        const isStable = [USDC_MAINNET, USDT_MAINNET].includes(
          tokenAddressLower
        );
        const isCelo = tokenAddressLower === CELO_MAINNET.toLowerCase();

        let feeCurrency;
        if (isCelo) {
          feeCurrency = undefined;
        } else if (isStable) {
          feeCurrency =
            tokenAddressLower === USDC_MAINNET.toLowerCase()
              ? USDC_ADAPTER_MAINNET
              : USDT_ADAPTER_MAINNET;
        } else {
          feeCurrency = tokenAddress;
        }

        const publicClient = createPublicClient({
          chain: selectedNetwork === CELO_CHAIN.id ? celo : mainnet,
          transport: http(CHAIN_RPC_URLS[selectedNetwork]),
        });

        const gasPriceParams = feeCurrency ? [feeCurrency] : [];
        const minGasPrice = await publicClient
          .request({
            method: "eth_gasPrice",
            params: [], // Ensure this is empty
          })
          .then((hexValue) => BigInt(hexValue));

        const gasPriceWithBuffer = (minGasPrice * BigInt(125)) / BigInt(100);
        setGasPrice(gasPriceWithBuffer);

        const amountInWei = parseUnits(amount, selectedToken.decimals);
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
        const data = encodeFunctionData({
          abi: [transferAbi],
          args: [recipientAddress, amountInWei],
        });

        const gasEstimate = await publicClient.estimateGas({
          account: address,
          to: tokenAddress,
          data,
          value: 0,
          gasPrice: gasPriceWithBuffer,
        });
        setEstimatedGas(gasEstimate);
        // console.log(estimatedGas);

        const estimatedFee = gasEstimate * gasPriceWithBuffer;
        const estimatedFeeInUSDC = estimatedFee / BigInt(1e12);

        const amountBigInt = parseUnits(amount, 6);
        const amountToReceiveBigInt = amountBigInt - estimatedFeeInUSDC;
        const amountToReceiveFormatted = formatUnits(amountToReceiveBigInt, 6);
        setAmountToReceive(amountToReceiveFormatted);
      } catch (error) {
        console.error("Gas estimation error:", error);
      } finally {
        setIsEstimatingGas(false);
      }
    };

    const debounceTimer = setTimeout(estimateGasFee, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, recipientAddress, selectedToken, address, selectedNetwork]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const updatedTokens = await fetchAllData(selectedNetwork);
        // console.log("Updated Tokens:", updatedTokens);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [selectedToken]);

  useEffect(() => {
    if (location.state?.address) {
      setRecipientAddress(location.state.address);
    }
  }, [location.state]);

  // ================ END ================

  return (
    <div className="min-h-screen bg-[#0F0140] flex items-center justify-center p-4 relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
        <FaArrowLeftLong size={25} color="#F6F5F6" />
      </button>
      <div className="max-w-xl w-full">
        {showConfetti && <Confetti width={width} height={height} />}

        <div className="space-y-6">
          <div>
            <label className="text-white text-sm mb-2 block">Network</label>
            <select
              className="w-full text-center text-white bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4 appearance-none focus:outline-none"
              value={selectedNetwork}
              onChange={handleNetworkChange}
            >
              {CHAINS.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full p-4 bg-[#1A1831] border border-[#2D2B54] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFDE00]"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Token</label>
            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="w-full text-left text-white bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4 hover:bg-[#231f42] transition-colors"
            >
              {selectedToken ? (
                <div className="flex items-center">
                  <img
                    src={selectedToken.icon}
                    alt={selectedToken.symbol}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  <span>{selectedToken.symbol}</span>
                </div>
              ) : (
                "Select Token"
              )}
            </button>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">Amount</label>
            <input
              type="text"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-[#1A1831] border border-[#2D2B54] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFDE00]"
            />
            <div className="text-right mt-2">
              <span className="text-gray-400 text-sm">
                Available: {parseFloat(balance).toFixed(2)}{" "}
                {selectedToken?.symbol || ""}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {["25%", "50%", "75%", "MAX"].map((label) => (
              <QuickAmountButton key={label} label={label} />
            ))}
          </div>

          {isEstimatingGas ? (
            <div className="bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4">
              <div className="flex items-center justify-center text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating fees...
              </div>
            </div>
          ) : estimatedCost ? (
            <div className="bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4">
              <div className="text-gray-400 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Network Fees:</span>
                  <span>
                    {estimatedCost.gas} {selectedToken.symbol}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Amount to Receive:</span>
                  <span className="text-white font-medium">
                    {amountToReceive ?? "--"} {selectedToken.symbol}
                  </span>
                </div>

                {[USDC_MAINNET, USDT_MAINNET].includes(
                  selectedToken?.address
                ) && (
                  <div className="flex justify-between text-white font-medium">
                    <span>Total Sent:</span>
                    <span>
                      {estimatedCost.total} {selectedToken.symbol}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={
              isLoading || !selectedToken || !amount || !recipientAddress
            }
            className="w-full py-4 rounded-xl bg-[#FFDE00] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5C800] transition-colors mt-8"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isTransactionPending ? "Processing..." : "Preparing..."}
              </div>
            ) : (
              "Send"
            )}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Notice!! <br /> You need to set a transaction Pin before sending a
            transaction, if you dont have one before - click{" "}
            <Link to="/settings/create-pin" className="text-white underline">
              here to set one
            </Link>
          </p>
          {isPinModalOpen && (
            <PinModal
              onConfirm={handleConfirmTransaction}
              onClose={() => setIsPinModalOpen(false)}
            />
          )}
        </div>
      </div>

      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSelect={(token) => {
          setSelectedToken(token);
          setIsTokenModalOpen(false);
        }}
        tokens={filterTokensByNetwork(tokens, selectedNetwork)}
      />
    </div>
  );
};

export default Send;
