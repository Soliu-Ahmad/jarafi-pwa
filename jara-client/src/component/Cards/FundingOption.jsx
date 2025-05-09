import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";

import { FaMinus, FaEquals, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


// FundWithBalance Component
const FundWithBalance = ({ onClose }) => {
  const [value, setValue] = useState(5);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === "" || Number(inputValue) >= 5) {
      setValue(inputValue);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full h-full relative">
      <div>
        <IoIosArrowBack
          size={25}
          color="#0F0140"
          onClick={onClose}
          className="cursor-pointer absolute top-4 left-4"
        />
      </div>
    </div>
  );
};

// FundWithExternal Component
const FundWithExternal = ({ onClose }) => {
  const [value, setValue] = useState(5);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === "" || Number(inputValue) >= 5) {
      setValue(inputValue);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-xl w-full h-full relative flex justify-center">
      <div>
        <IoIosArrowBack
          size={25}
          color="#0F0140"
          onClick={onClose}
          className="cursor-pointer absolute top-4 left-4"
        />
      </div>

      <section className="flex flex-col items-center py-6 w-full md:w-[350px] ">
        <p>Fund with External Wallet.</p>

        <form className="w-full relative">
          <div className="w-full mt-6 bg-white border-b border-gray-200 rounded-b-lg p-2">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Your card gets
            </label>
            <input
              type="number"
              value={value}
              onChange={handleChange}
              className="text-gray-900 text-[25px] font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              min="5"
            />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaMinus size={25} color="#000" />

                <p className="bg-green-600  text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                  FREE
                </p>
              </div>

              <p className="text-gray-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                Fee
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaEquals size={25} color="#000" />

                <p className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                  ${value.toFixed(2)}
                </p>
              </div>

              <p className="text-gray-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                Total Amount
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTimes size={25} color="#000" />

                <p className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                  1.0149
                </p>
              </div>

              <p className="text-gray-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                Rate{" "}
              </p>
            </div>
          </div>

          <div className="border-t mt-6">
            <p className="text-gray-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              You pay
            </p>
            <p className="text-gray-500 text-[25px] font-bold mr-2 px-2.5 py-0.5 rounded">
              ${value.toFixed(2)} USDT
            </p>
          </div>

          <button
            className="w-full bg-purple-500 p-4 rounded-lg text-white mt-6"
            onClick={() =>
              navigate("/final-funding", { state: { value: value } })
            }
          >
            Continue
          </button>
        </form>
      </section>
    </div>
  );
};

export { FundWithBalance, FundWithExternal };
