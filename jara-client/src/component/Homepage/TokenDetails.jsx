import React, { useEffect, useState } from "react";
import { RiTokenSwapLine } from "react-icons/ri";
import {

  LuSettings2,
  LuWalletMinimal,
  LuArrowUpToLine,
} from "react-icons/lu";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { FaExchangeAlt } from "react-icons/fa";
import { Contract, ethers, JsonRpcProvider } from "ethers";
import Activities from "./Activities";
import { FaArrowLeftLong } from "react-icons/fa6";

const TokenDetails = ({ tokens }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { address } = useAccount();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mockData, setMockData] = useState([]);
  const [activeTab, setActiveTab] = useState("balance");
  const [tokenData, setTokenData] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      // Find the token with id matching the route param.
      const selectedToken = tokens.find((t) => t.id.toString() === id);
      if (selectedToken) {
        setTokenData(selectedToken);
      } else {
        setError("Token not found");
      }

      // Format tokens for display in the list (if needed)
      const formattedMockData = tokens.map((t) => ({
        id: t.id,
        token_name: t.name,
        icon: t.icon,
        balance: t.balance ? t.balance : "0",
      }));

      // console.log(formattedMockData)
      setMockData(formattedMockData);
    }
  }, [tokens, id]);

  const isActive = (path) => location.pathname === path;

  // Remove navigate calls; simply set the active tab.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const fetchTokenBalance = async () => {
    if (!address || !tokenData?.address) {
      setError("Token data not available");
      setIsLoading(false);
      return;
    }

    // console.log(tokenData)

    try {
      const provider =
        tokenData.chainId === 1
          ? new JsonRpcProvider("https://eth.llamarpc.com")
          : new JsonRpcProvider("https://forno.celo.org");
      const contract = new Contract(
        tokenData.address,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );

      const balance = await contract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(
        balance,
        tokenData.decimals || 18
      );
      setTokenBalance(formattedBalance);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      setError("Failed to fetch token balance");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenData) {
      // console.log(tokenData)
      fetchTokenBalance();
    }
  }, [address, tokenData]);

  useEffect(() => {
    // Prevent scrolling when component mounts
    document.body.classList.add("overflow-hidden");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  if (isLoading) {
    return (
      <section className="h-screen w-full flex items-center justify-center">
        <p className="text-white">Loading details...</p>
      </section>
    );
  }

  if (error || !tokenData) {
    return (
      <section className="bg-[#0F0140] h-screen w-full flex flex-col items-center justify-center">
        <p className="text-white mb-4">{error || "Token data not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#F2E205] rounded-lg px-4 py-2 text-[#0F0140]"
        >
          Go Back
        </button>
      </section>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <section className="bg-[#1D143E] h-screen w-full overflow-x-hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <Link to="/dashboard">
            <button
              onClick={() => navigate(-1)}
              className="text-white flex items-center gap-2"
            >
              <FaArrowLeftLong size={25} />
            </button>
          </Link>
        </div>

        <header className=" bg-[#1D143E] my-4 py-4 md:my-10 flex items-center justify-center">
          <section className="flex flex-col justify-between w-full max-w-[1024px] px-4 md:p-6">
            <section className="flex items-center gap-2 flex-col">
              <div className="flex items-center gap-2">
                <img
                  src={tokenData.icon}
                  className="w-[24px] h-[24px] rounded-full"
                  alt={tokenData.name}
                />
                <p className="text-[#F2EDE4] text-[16px]">{tokenData.name}</p>
              </div>
              <section className="mt-4">
                <p className="text-[#F2EDE4] text-[30px]">
                  {" "}
                  {parseFloat(tokenBalance).toFixed(2) ||
                    tokenData?.quote?.USD?.price?.toFixed(2)}{" "}
                  {tokenData.symbol}
                </p>
              </section>
            </section>

            <section className="flex justify-between items-center px-8 mt-12">
              {[
                {
                  label: "Send",
                  icon: <LuArrowUpToLine size={25} color="#0F0140" />,
                  routes: "/send",
                },
                {
                  label: "Withdraw",
                  icon: <LuArrowUpToLine size={25} color="#0F0140" />,
                  rotate: true,
                  routes: "/withdraw",
                },
              ].map(({ label, icon, routes, rotate }, index) => (
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

        <main className="overflow-hidden bg-white min-h-[67.5vh]">
          <div className="h-full  flex flex-col">
            <div className="flex border-b">
              <button
                onClick={() => handleTabChange("balance")}
                className={`p-4 text-[14px] w-1/2 ${
                  activeTab === "balance"
                    ? "text-[#0F0140] border-b-2 border-[#0F0140] font-medium"
                    : "text-[#464446] font-normal"
                }`}
              >
                Your Balance
              </button>
              <button
                onClick={() => handleTabChange("activity")}
                disabled={true}
                className={`p-4 text-[14px] w-1/2 ${
                  activeTab === "activity"
                    ? "text-[#0F0140] border-b-2 border-[#0F0140] font-medium"
                    : "text-[#464446] font-normal"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Activity
              </button>
            </div>
            {activeTab === "balance" && (
              <div className="p-4 flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <img
                    src={tokenData.icon}
                    className="w-[50px] h-[50px] rounded-full"
                    alt={tokenData.name}
                  />
                  <div className="flex flex-col justify-center">
                    <p className="text-[16px] text-[#464446]">
                      {tokenData.name}
                    </p>
                    <p className="text-[14px] text-[#464446]">
                      {tokenData.name === "Celo"
                        ? tokenData.name
                        : tokenData.network}{" "}
                      Network
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[#0F0140]">
                    {parseFloat(tokenBalance).toFixed(2)} {tokenData.symbol}
                  </p>
                </div>
              </div>
            )}
            {activeTab === "activity" && (
              <div className="p-4">
                <Activities tokenData={tokenData} address={address} />
              </div>
            )}
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
          {/* <Link to="/card-display">
                  <LuCreditCard
                    size={25}
                    color={isActive("/card-display") ? "#0F0140" : "#B0AFB1"}
                  />
                </Link> */}
          <Link to="/settings">
            <LuSettings2
              size={25}
              color={isActive("/settings") ? "#0F0140" : "#B0AFB1"}
            />
          </Link>
        </footer>
      </section>
    </div>
  );
};

export default TokenDetails;
