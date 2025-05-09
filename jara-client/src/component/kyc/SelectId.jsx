import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const details = [
    {
      id: 1,
      name: "Jara Card",
      doe: "08/30",
      address: "4922****7383",
      balance: "1576.56",
    },
  ];

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/card-display", { state: { details } });
    }, 1500);
  };
  const options = [
    "Enter National ID number",
    "ID Card",
    "Passport",
    "Driver's license",
  ];

  return (
    <div className="bg-[#F6F5F6] min-h-screen flex flex-col items-center">
      <div className="flex flex-col items-center max-w-md w-full px-6 mt-36">
        <h1 className="text-xl sm:text-2xl font-['Merriweather_Sans'] text-[#141414]">
          Select ID to verify
        </h1>
        <p className="text-sm sm:text-base text-[#6F6B6F] mt-2">
          You’ll be required to take a clear picture of the ID
        </p>

        {/* Dropdown */}
        <div className="relative w-full mt-12">
          <div
            className="w-full py-3 px-4 bg-white rounded-lg flex justify-between items-center cursor-pointer border border-gray-300 hover:bg-gray-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-gray-700">{selectedOption || "ID Type"}</span>
            <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200" />
          </div>

          {isOpen && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {options.map((option, index) => (
                <div
                  key={option}
                  className="flex justify-between items-center px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedOption(option);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-gray-700">{option}</span>
                  <div className="w-6 h-6 flex items-center justify-center border-2 border-gray-400 rounded-full">
                    {selectedOption === option && (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          className={`w-full max-w-sm mt-16 py-3 bg-[#F2E205] rounded-lg font-semibold text-gray-800 transition-opacity ${
            selectedOption ? "opacity-100" : "opacity-50 cursor-not-allowed"
          }`}
          disabled={!selectedOption || loading}
          onClick={handleClick}
        >
          {loading ? "Loading... Please wait!" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default Verify;
