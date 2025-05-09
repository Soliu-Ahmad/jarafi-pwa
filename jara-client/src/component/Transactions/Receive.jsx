import { useState } from "react";
import { CELO_CHAIN, ETHEREUM_CHAIN, TOKENS } from "../../constant/otherChains";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Share } from "lucide-react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";


const ReceiveAssets = () => {
  const { address } = useAccount();
  const CHAINS = [CELO_CHAIN, ETHEREUM_CHAIN];
  const tokens = TOKENS;

  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const navigate = useNavigate();

  const supportedTokens = tokens.filter((token) => {
    if (token.networks) {
      return token.networks[selectedChain.id] !== undefined;
    }
    return token.chainId === selectedChain.id;
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    toast("Address copied to clipboard!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Wallet Address",
          text: address,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          await navigator.clipboard.writeText(address);
          toast("Address copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(address);
      toast("Address copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0140] flex flex-col items-center justify-center font-montserrat text-[#F6F5F6] relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
        <IoIosArrowBack size={25} color="#F6F5F6" />
      </button>
      <h1 className="text-2xl font-bold mb-[40px]">Receive Assets</h1>

      <div className="bg-white rounded-[20px] w-[90%] max-w-[600px] h-[516px] p-[40px] flex flex-col items-center shadow-md space-y-6">
        <div className="flex gap-2 w-full justify-center">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => setSelectedChain(chain)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedChain.id === chain.id
                  ? "bg-[#F2E205] text-[#0F0140]"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>

        {/* QR Code Section */}
        <div className="flex items-center justify-center w-[190px] h-[190px] mt-[40px]">
          <QRCodeSVG
            value={address}
            size={190}
            bgColor="#FFFFFF"
            fgColor="#000000"
            className="rounded-lg"
          />
        </div>

        <div className="w-full flex flex-col items-center space-y-4">
          <div className="flex gap-6 items-center mt-6">
            <div className="w-[192px]">
              <p className="text-[10px] sm:text-[10px] text-[#0F0140]">
                {`This address can receive tokens on the ${selectedChain.name} network`}
              </p>
              <p className="text-[12px] font-[500] mt-2 text-gray-700 break-all">
                {address}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopy}
                className="w-[32px] h-[32px] bg-[#F2E205] rounded flex items-center justify-center hover:bg-[#F2E205]/90"
              >
                <Copy className="text-[#0F0140] w-[15px] h-[15px]" />
              </button>
              <button
                onClick={handleShare}
                className="w-[32px] h-[32px] bg-[#F2E205] rounded flex items-center justify-center hover:bg-[#F2E205]/90"
              >
                <Share className="text-[#0F0140] w-[15px] h-[15px]" />
              </button>
            </div>
          </div>
        </div>

        <p className="w-[293px] text-[12px] text-[#0F014080]">
          This address can only be used to receive tokens on the{" "}
          {selectedChain.name} network.
        </p>
      </div>
    </div>
  );
};

export default ReceiveAssets;
