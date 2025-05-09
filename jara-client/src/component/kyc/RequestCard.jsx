import React, { useState } from "react";
import { Zap, ShoppingCart, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const RequestCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/verify");
    }, 1500);
  };
  return (
    <section className="bg-[#D0D6FF80] min-h-screen flex flex-col justify-center items-center">
      {/* Header */}
      <header className="bg-[#0F0140] w-full p-4 flex items-center justify-center">
        <h2 className="text-white text-2xl font-bold">My Card</h2>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center flex-grow w-auto md:w-[400px] ">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mt-20 gap-10">
          <img src="/JaraFiLogin.png" alt="JaraFi Logo" className="w-44 h-14" />
          <h4 className="font-['Merriweather Sans'] font-bold text-2xl text-center text-[#262526] md:w-56">
            Spend your money anywhere
          </h4>
        </div>

        {/* Features Section */}
        <div className="w-full md:w-[350px] h-[185px] box-border flex flex-col justify-center items-start p-6 gap-5 border border-dashed border-gray-300 rounded-lg mt-12">
          <h6 className="text-xl font-semibold">Features for you</h6>
          <div className="space-y-2 text-left text-[#6F6B6F] text-sm">
            <FeatureItem
              icon={<Zap size={14} color="#F2E205" />}
              text="Fast and affordable funding"
            />
            <FeatureItem
              icon={<ShoppingCart size={14} color="#6E53CB" />}
              text="Accepted globally, online"
            />
            <FeatureItem
              icon={<Lock size={14} color="black" />}
              text="Card control for maximum security"
            />
          </div>
        </div>

        {/* Request Card Button */}
        <button
          onClick={handleClick}
          className="w-full md:w-[350px] flex justify-center items-center px-4 py-3 bg-[#F2E205] rounded-lg font-['Montserrat'] font-semibold text-base text-[#4F4E50] mt-6"
          disabled={loading}
        >
          {loading ? "Loading... Please wait!" : "Request for a card"}
        </button>
      </main>
    </section>
  );
};

// FeatureItem Component
const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-2">
    <div className="flex justify-center items-center w-6 h-6 bg-white rounded-full p-1">
      {icon}
    </div>
    <p className="text-sm">{text}</p>
  </div>
);

export default RequestCard;
