import React, { useState, useEffect } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import { MdOutlineInfo } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@getpara/react-sdk';
import { ethers } from 'ethers';

const SeedPhrase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectWallet } = useWallet();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('mode') === 'recover') {
      setIsRecoveryMode(true);
    }
  }, [location]);

  const handleSeedPhraseChange = (e) => {
    setSeedPhrase(e.target.value);
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.write('Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem');
    alert('Seed phrase copied to clipboard!');
  };

  const handleRecoverWallet = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!seedPhrase.trim()) {
        throw new Error('Please enter a seed phrase.');
      }

      const words = seedPhrase.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        throw new Error('Seed phrase must be 12 or 24 words.');
      }

      if (!ethers.Mnemonic.isValidMnemonic(seedPhrase.trim())) {
        throw new Error('Invalid seed phrase. Please check and try again.');
      }

      await connectWallet({
        connector: "injected",
        seedPhrase: seedPhrase.trim(),
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Recovery error:', err.message); // Log for debugging
      setError(err.message || 'Failed to recover wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-5">
      <div className="max-w-md mx-auto">
        <h1 className="text-lg text-blue-600 text-center font-semibold">
          {isRecoveryMode ? 'Recover Your Wallet' : 'Your New SEED Phrase is Ready!'}
        </h1>

        <div className="flex flex-col items-center my-6">
          {!isRecoveryMode ? (
            <>
              {/* Display Seed Phrase */}
              <div className="w-[309px] border border-gray-500 rounded-[10px] p-4">
                <p className="mb-2 text-xs text-gray-800">Generated SEED phrase</p>
                <p className="text-sm text-gray-800">
                  Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem Vorem
                </p>
                <div
                  className="h-8 w-8 bg-yellow-100 flex justify-center items-center p-1 mt-2 ml-auto cursor-pointer"
                  onClick={copyToClipboard}
                >
                  <IoCopyOutline size={15} className="text-black" />
                </div>
              </div>

              <div className="mt-8 mb-4 flex items-center space-x-2 self-start w-[243px]">
                <MdOutlineInfo size={24} className="text-gray-500" />
                <p className="text-gray-500">Don't lose this phrase!</p>
              </div>

              <div className="w-[309px] border border-gray-500 rounded-[10px] p-4">
                <p className="text-xs mb-1">
                  Horem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et Korem ipsum dolor sit amet, consectetur
                  adipiscing elit.
                </p>
                <p className="text-xs mb-1">
                  Nunc vulputate libero et velit interdum, ac aliquet odio
                  mattis. Korem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Recovery Input */}
              <div className="w-[309px] border border-gray-500 rounded-[10px] p-4">
                <p className="mb-2 text-xs text-gray-800">Enter your SEED phrase</p>
                <textarea
                  className="w-full h-24 p-2 text-sm text-gray-800 border border-gray-300 rounded"
                  value={seedPhrase}
                  onChange={handleSeedPhraseChange}
                  placeholder="Enter your 12 or 24-word seed phrase, separated by spaces"
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>
            </>
          )}
        </div>

        {isRecoveryMode ? (
          <button
            className="w-full bg-blue-600 py-3 rounded-[10px] text-white text-sm font-semibold disabled:opacity-50"
            onClick={handleRecoverWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Recovering...' : 'Recover Wallet'}
          </button>
        ) : (
          <>
            <button className="w-full bg-yellow-100 py-3 rounded-[10px] text-gray-700 text-sm font-semibold mb-2">
              Back up on email
            </button>
            <button
              className="w-full bg-gray-100 py-3 rounded-[10px] text-gray-700 text-sm font-semibold border border-yellow-100"
              onClick={() => navigate('/dashboard')}
            >
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SeedPhrase;