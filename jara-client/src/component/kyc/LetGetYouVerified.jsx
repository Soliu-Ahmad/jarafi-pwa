import React, { useState } from "react";

import { CreditCard, Scan } from "lucide-react";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { LuScanFace } from "react-icons/lu";

const Verify = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/select-residence");
    }, 1500);
  };
  return (
    <section className="bg-[#F6F5F6] min-h-screen flex flex-col items-center relative">
      <button className="absolute top-4 left-4" onClick={() => navigate(-1)}>
        <MdArrowBackIosNew size={20} color="#0f0140" />
      </button>
      <div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col justify-center items-center gap-[15px] w-[242px] sm:w-[300px] mx-auto mt-[143px]">
            <h1 className="w-[242px] sm:w-[300px] h-[29px] sm:h-[34px] font-['Merriweather_Sans'] font-normal text-[24px] sm:text-[28px] leading-[120%] text-center text-[#141414]">
              Let's get you verified!
            </h1>
            <p className="w-[184px] sm:w-[220px] h-[14px] sm:h-[16px] font-['Montserrat'] font-normal text-[12px] sm:text-[14px] leading-[120%] text-center text-[#6F6B6F]">
              Follow the simple steps below:
            </p>
          </div>
          <div>
            <div className="flex flex-col items-start gap-[30px] w-[297px] mx-auto mt-[80px] mb-20">
              <div className="flex flex-row items-center gap-[15px] w-full">
                <div className="w-[35px] h-[35px] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-black" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-start gap-[8px] w-[247px]">
                  <p className="w-full h-[14px] font-normal text-[12px] sm:text-[14px] leading-[120%] text-[#6F6B6F]">
                    Step 1
                  </p>
                  <h5 className="w-full h-[19px]  font-semibold text-[16px] sm:text-[18px] leading-[120%] text-[#262526]">
                    Provide an identity document
                  </h5>
                </div>
              </div>

              <div className="flex flex-row items-center gap-[15px] w-full">
                <div className="w-[35px] h-[35px] flex items-center justify-center">
                  <LuScanFace className="w-5 h-5 text-black" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-start gap-[8px] w-[247px]">
                  <p className="w-full h-[14px]  font-normal text-[12px] sm:text-[14px] leading-[120%] text-[#6F6B6F]">
                    Step 2
                  </p>
                  <h5 className="w-full h-[19px]  font-semibold text-[16px] sm:text-[18px] leading-[120%] text-[#262526]">
                    Get ready for a live face scan
                  </h5>
                </div>
              </div>
            </div>

            <button
              onClick={handleClick}
              className="w-full md:w-[350px] flex justify-center items-center px-4 py-3 bg-[#F2E205] rounded-lg font-['Montserrat'] font-semibold text-base text-[#4F4E50] mt-6"
              disabled={loading}
            >
              {loading ? "Loading... Please wait!" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verify;
