import { useState } from "react";
import {GoEye, GoEyeClosed} from "react-icons/go";

const PinModal = ({ onConfirm, onClose }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    setError("");
    onConfirm(pin);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-lg font-bold mb-4 text-center">Enter Your PIN</h2>

        <div className="w-full flex items-center border border-gray-300 rounded my-2">
          <input
            type={showPassword ? "text" : "password"}
            maxLength="4"
            className="w-full p-2  text-center outline-none"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button
            type="button"
            className="px-2"
            onClick={toggleShowPassword}
          >
            {showPassword ? <GoEye size={20} /> : <GoEyeClosed size={20} />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          className="w-full bg-blue-500 text-white py-2 mt-3 rounded"
          onClick={handleConfirm}
        >
          Confirm
        </button>
        <button
          className="w-full bg-gray-300 text-black py-2 mt-2 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PinModal;

