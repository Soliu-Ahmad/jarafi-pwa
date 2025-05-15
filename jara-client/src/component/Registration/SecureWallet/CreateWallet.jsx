import React, { useState } from 'react';
import Notice from './Notice';
import { useNavigate, useLocation } from 'react-router-dom';

const CreateWallet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');

  const handleModalOpen = () => {
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
  };

  const handleNavigate = () => {
    navigate('/seedphrase?mode=recover');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center space-y-6">
          <img
            src="/chatbot.png"
            alt="ChatBot"
            className="w-32 h-32 mb-4 object-contain"
          />

          <div className="text-center space-y-6">
            <h2 className="text-gray-900 text-[20px] font-medium">
              Create wallet and encrypt seed phrase in your Google Drive.
            </h2>

            <p className="text-[#F21B1B] text-[14px]">
              Note: If on the first try wallet creation failed, close and restart
              your app.
            </p>
          </div>

          <div className="w-full space-y-3">
            <button
              className="w-full bg-yellow-400 py-3 px-4 rounded-xl text-gray-900 font-medium hover:bg-yellow-300 transition-colors"
              onClick={handleModalOpen}
            >
              Create wallet
            </button>

            <button
              onClick={handleNavigate}
              className="w-full bg-[#FCFEE8] py-3 px-4 rounded-xl text-gray-900 border-[#F2E205] border-[1.2px] font-medium hover:bg-[#f2e205e7] transition-colors"
            >
              Have an existing wallet? Recover
            </button>
          </div>
        </div>
      </div>

      {isOpen && <Notice onClose={handleModalClose} email={email} />}
    </div>
  );
};

export default CreateWallet;