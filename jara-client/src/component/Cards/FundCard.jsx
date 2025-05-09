import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { LuCreditCard, LuSettings2, LuWalletMinimal } from "react-icons/lu";
import { RiTokenSwapLine } from "react-icons/ri";
import { FundWithBalance, FundWithExternal } from "./FundingOption";
import { IoIosArrowBack } from "react-icons/io";
import { FaExchangeAlt } from "react-icons/fa";

const FundCard = ({ onClose }) => {
  const [activeModal, setActiveModal] = useState("fundOptions");
  const [selectedNetwork, setSelectedNetwork] = useState("Celo");
  const [isBalanceModal, setIsBalanceModal] = useState(false);
  const [isExternalModal, setIsExternalModal] = useState(false);

  const navigTE = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const networks = [{ id: "Celo", name: "Celo" }];

  const activateBalance = () => {
    setIsBalanceModal(true);
  };
  const activateExternal = () => {
    setIsExternalModal(true);
  };

  const closeModal = () => {
    setIsBalanceModal(false);
    setIsExternalModal(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      {!isBalanceModal && !isExternalModal ? (
        <div className="bg-white shadow-xl p-6 w-full space-y-6 h-full flex justify-center relative">
          <div className="w-full max-w-md">
            <div>
              <button onClick={onClose}>
                <IoIosArrowBack size={25} />
              </button>

              <h2 className="text-[24px] font-semibold text-[#262526]">
                How would you like to fund your card?
              </h2>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Network
              </label>
              <select
                className="p-2 border rounded-md w-full"
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
              >
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>
            {activeModal === "fundOptions" && (
              <div className="space-y-4 mt-4">
                <button
                  className="w-full flex items-center p-4 border gap-4 rounded-lg shadow-sm hover:bg-gray-100"
                  onClick={activateBalance}
                >
                  <div className="border-2 border-[#F2E205] bg-[#FCFEE8] rounded-full h-10 w-10 text-center flex items-center justify-center">
                    <LuWalletMinimal className=" text-[#262526]" size={25} />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-left">
                      JaraFi Wallet
                    </h3>
                    <p className="text-sm text-gray-600">
                      Pay with wallet balance
                    </p>
                  </div>
                </button>
                <button
                  className="w-full flex items-center p-4 border gap-4 rounded-lg shadow-sm hover:bg-gray-100"
                  onClick={activateExternal}
                >
                  <div className="border-2 border-[#F2E205] bg-[#FCFEE8] rounded-full h-10 w-10 text-center flex items-center justify-center">
                    <RiTokenSwapLine className=" text-[#262526]" size={25} />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-left">
                      External Wallet
                    </h3>
                    <p className="text-sm text-gray-600">
                      Deposit funds from an external wallet
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {isBalanceModal && <FundWithBalance onClose={closeModal} />}
      {isExternalModal && <FundWithExternal onClose={closeModal} />}

      <FooterNav isActive={isActive} />
    </div>
  );
};

const FooterNav = ({ isActive }) => (
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
);

export default FundCard;
