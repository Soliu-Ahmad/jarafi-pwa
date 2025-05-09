import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const SelectResidence = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const countries = [{ name: "Nigeria", flag: "ngn flag.png" }];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => navigate("/select-id"), 1500);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center relative px-4">
      {/* Back Button */}
      <button className="absolute top-4 left-4" onClick={() => navigate(-1)}>
        <MdArrowBackIosNew size={20} className="text-purple-900" />
      </button>

      {/* Card Wrapper */}
      <div className="flex flex-col items-center  w-full max-w-md  h-full p-6 mt-28 rounded-lg">
        {/* Heading */}
        <div className="text-left w-full mb-6">
          <h1 className="text-2xl font-medium text-gray-900">Country of Residence</h1>
          <p className="text-sm text-gray-500">Where do you live most of the time?</p>
        </div>

        {/* Dropdown */}
        <div className="relative w-full">
          <div
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <img
                src={selectedCountry.flag}
                alt={selectedCountry.name}
                className="w-8 h-8 rounded-full shadow-md object-cover"
              />
              <span className="text-gray-700 font-semibold text-base">{selectedCountry.name}</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
          {isOpen && (
            <div className="absolute w-full mt-2 bg-white rounded-lg shadow-md z-10">
              {countries.map((country) => (
                <div
                  key={country.name}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={country.flag}
                    alt={country.name}
                    className="w-8 h-8 rounded-full shadow-md object-cover"
                  />
                  <span className="text-gray-700 font-semibold text-base">{country.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleClick}
          className="w-full py-3 bg-yellow-400 rounded-lg font-semibold text-gray-800 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Loading... Please wait!" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default SelectResidence;