import { Plus, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { LuCreditCard, LuSettings2, LuWalletMinimal } from "react-icons/lu";
import { RiTokenSwapLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FundCard from "./FundCard";
import { CiBarcode } from "react-icons/ci";
import { FiCreditCard } from "react-icons/fi";
import { useAccount } from "wagmi";
import axios from "axios";
import { FaExchangeAlt } from "react-icons/fa";

export default function CardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [verified, setVerified] = useState(null); // Initial state is null
  const [isLoading, setIsLoading] = useState(true); // Track API loading
  const { address } = useAccount();

  const referenceId = address ? address.toString() : null;

  // Mock card details for success state
  const mockCardDetails = [
    // {
    //   id: 1,
    //   name: "SOLIU MUHAMMED",
    //   address: referenceId || "0x403852dB7a42F87B4e8bB5230c7d68Edf5a3c21b",
    //   doe: "08/27/2029",
    // },
  ];

  // Fetch KYC status
  useEffect(() => {
    if (!referenceId) {
      setIsLoading(false);
      return;
    }

    const getVerifiedUser = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `https://jarafibackend.vercel.app/pwauser/${referenceId}`,
          { withCredentials: true }
        );
        console.log("API Response:", response.data); // Debug API response
        if (response.status === 200) {
          const status = response.data?.kycStatus || "pending"; // Default to pending
          setVerified(null);
          console.log("Set verified to:", status); // Debug state update
        }
      } catch (error) {
        console.error(
          `User ${address} not verified:`,
          error.response || error.message
        );
        setVerified("pending"); // Default to pending on error
      } finally {
        setIsLoading(false);
      }
    };

    getVerifiedUser();
  }, [address]);

  // Countdown for redirect when verified is null or failed
  useEffect(() => {
    if (verified !== null && verified !== "failed") {
      setCountdown(5); // Reset countdown for non-redirect states
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [verified]);

  // Redirect to /request-card when countdown reaches 0 for null or failed states
  useEffect(() => {
    if (countdown === 0 && (verified === null || verified === "failed")) {
      console.log("Redirecting to /request-card, verified:", verified);
      navigate("/request-card");
    }
  }, [countdown, verified, navigate]);

  // Log state changes for debugging
  useEffect(() => {
    console.log(
      "Current state - verified:",
      verified,
      "countdown:",
      countdown,
      "isLoading:",
      isLoading
    );
  }, [verified, countdown, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <section className="relative">
      <div className="flex justify-center items-center mb-4 bg-[#0F0140] p-4">
        <h1 className="text-2xl font-bold text-white">Cards</h1>
      </div>

      <div className="min-h-screen bg-gray-50 p-6 relative flex flex-col items-center">
        {verified === null ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              You don't have a card yet!
            </h2>
            <p className="text-gray-600 mt-2">
              Redirecting you to the request card page in{" "}
              <span className="text-[#0F0140] font-bold">{countdown}</span>{" "}
              seconds...
            </p>
          </div>
        ) : verified === "pending" ? (
          <div className="w-screen bg-[#D0D6FF] fixed top-0 left-0 z-50 h-screen backdrop:blur-sm">
            <h1 className="p-6 w-full bg-[#0F0140] text-center font-bold text-2xl text-white">
              KYC Verification
            </h1>

            <div className="flex flex-col gap-[55px] justify-center items-center p-10 pt-6 text-center">
              <img src="/kyc.svg" alt="" />
              <h1 className="text-[#262526] font-bold text-2xl">
                Please wait while we verify your identity
              </h1>
              <div className="flex flex-col gap-4">
                <p className="text-[#6F6B6F] text-[12px]">
                  Thank you for submitting your information.
                </p>
                <p className="font-semibold text-[#6F6B6F] text-[12px]">
                  We’ll send you a notification within 15-30mins with the status
                  of your verification.
                </p>
              </div>
              <button
                onClick={() => navigate("/card-display")}
                className="bg-[#F2E205] md:w-1/3 rounded-xl p-4 text-[#4F4E50] w-full font-semibold"
              >
                Access dashboard
              </button>
            </div>
          </div>
        ) : verified === "success" ? (
          <div className="w-[350px] md:w-[450px] space-y-8 flex flex-col justify-center items-center">
            <div className="relative aspect-[1.6/1] w-full">
              <div className="absolute inset-0 bg-[url('/JaraFi-icon.png')] bg-cover bg-no-repeat border-[1.2px] border-black rounded-2xl p-6 text-black">
                {mockCardDetails.map((card) => (
                  <div
                    key={card.id}
                    className="flex flex-col h-full justify-between"
                  >
                    <div className="space-y-10">
                      <div className="flex justify-between items-center w-full">
                        <CiBarcode color="#1F2223" size={40} />
                        <div className="flex flex-col justify-end text-right gap-2">
                          <span className="text-[18px] font-light">
                            {card.name}
                          </span>
                          <span className="text-[14px] font-light">
                            {card.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-mono text-[14px]">{card.doe}</div>
                      <img
                        src="https://www.mastercard.com.ng/content/dam/mccom/brandcenter/thumbnails/mastercard_circles_92px_2x.png"
                        alt="mastercard logo"
                        className="w-[26px] h-[16px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center justify-center w-full">
              <button
                className="flex flex-col items-center justify-center bg-transparent border-[1.2px] rounded-lg p-4 w-[120px] h-[100px] transition-all hover:bg-gray-100"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={30} className="text-[#0F0140]" />
                <span className="text-sm font-medium text-gray-800">Fund</span>
              </button>
              <button
                className="flex flex-col items-center justify-center bg-transparent border-[1.2px] rounded-lg p-4 w-[120px] h-[100px] transition-all hover:bg-gray-100"
                onClick={() =>
                  navigate("/card-details", {
                    state: { details: mockCardDetails },
                  })
                }
              >
                <Eye size={30} className="text-[#0F0140]" />
                <span className="text-sm font-medium text-gray-800">
                  Details
                </span>
              </button>
            </div>
            <div className="justify-start items-start w-full">
              <div className="flex justify-start gap-4">
                <button className="text-[16px] text-[#3D3C3D] font-[Montserrat]">
                  Activity
                </button>
                <button className="text-[16px] text-[#3D3C3D] font-[Montserrat]">
                  Subscription
                </button>
              </div>
              <div>
                <div className="flex justify-between my-4">
                  <p className="text-[12px] text-[#8A868A]">Feb 14</p>
                  <p className="text-[12px] text-[#8A868A]">See all</p>
                </div>
                <div className="flex justify-between items-center">
                  <FiCreditCard size={14} color="#5D5C5E" />
                  <p className="text-[14px] text-[#3D3C3D]">
                    Card withdrawal(crypto)
                  </p>
                  <p className="text-[14px] text-[#F21B1B]">-100 USD</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              KYC Verification Failed
            </h2>
            <p className="text-gray-600 mt-2">
              Your KYC verification was not successful. Redirecting to retry KYC
              in <span className="text-[#0F0140] font-bold">{countdown}</span>{" "}
              seconds...
            </p>
          </div>
        )}

        {isModalOpen && (
          <FundCard
            setIsModalOpen={setIsModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}

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
      </div>
    </section>
  );
}
