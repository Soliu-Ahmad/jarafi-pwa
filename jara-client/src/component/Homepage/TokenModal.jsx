import React from "react";

const TokenModal = ({ isOpen, onClose, onSelect, tokens }) => {
  // console.log(tokens)

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#110F24] w-full max-w-md rounded-2xl">
        <div className="p-6 border-b border-[#2D2B54]">
          <h2 className="text-white text-xl font-medium">Select a Token</h2>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {tokens.map((token) => (
            <button
              key={token.id}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              className="w-full flex items-center bg-[#1A1831] border border-[#2D2B54] rounded-xl p-4 mb-3 text-left hover:bg-[#231f42] transition-colors"
            >
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-8 h-8 mr-3 rounded-full"
              />
              <div>
                <span className="text-white font-medium">
                  {token.symbol}
                </span>
                <p className="text-gray-400 text-sm">{token.name}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-[#2D2B54]">
          <button
            onClick={onClose}
            className="w-full bg-[#FFDE00] rounded-xl py-4 text-black font-medium hover:bg-[#E5C800] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
