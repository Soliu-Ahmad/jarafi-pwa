import { useEffect, useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { reset, setPin } from "../../redux/pinSlice";

const initialState = {
  wallet: "",
  pin: "",
  confirmPin: "",
};
const PinSetup = () => {
  const [formData, setFormData] = useState(initialState);

  const { pin, confirmPin } = formData;

  const { address } = useAccount();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, updateConfirmPwd] = useState(false);
  const { isSuccess, isError, message, isLoading } = useSelector(
    (state) => state.pin
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleConfirm = async () => {
    // console.log(pin.length);
    if (
      isNaN(pin) ||
      isNaN(confirmPin) ||
      pin.toString().length !== 4 ||
      confirmPin.toString().length !== 4
    ) {
      toast.error("PIN must be a 4-digit number");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    try {
      const pinData = { wallet: address, pin };
      await dispatch(setPin(pinData));
    } catch (error) {
      toast.error("Error saving PIN");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/dashboard");
      setFormData(initialState);
    } else if (isError) {
      toast.error(message);
    }

    dispatch(reset());
  }, [isSuccess, isError, message, dispatch, navigate]);
  return (
    <div className="min-h-screen bg-[#0F0140] flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-white"
      >
        <FaArrowLeftLong size={25} />
      </button>
      <div className=" p-6 rounded-lg shadow-md text-white">
        <h2 className="text-lg font-bold mb-4 text-center">
          Set Your Transaction PIN
        </h2>
        {address && (
          <p className="text-sm  text-center my-6">Wallet: {address}</p>
        )}

        <div className="flex gap-1 items-center border rounded mb-4 p-2">
          <input
            type={showPassword ? "text" : "password"}
            maxLength="4"
            className="w-full text-center bg-transparent  outline-none "
            placeholder="Enter PIN"
            value={pin}
            name="pin"
            onChange={handleInputChange}
          />

          {showPassword ? (
            <GoEyeClosed
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer"
            />
          ) : (
            <GoEye
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer"
            />
          )}
        </div>

        <div className="flex gap-1 items-center border rounded mb-2 p-2">
          <input
            type={showConfirmPwd ? "text" : "password"}
            maxLength="4"
            className="w-full text-center bg-transparent outline-none  "
            placeholder="Confirm PIN"
            value={confirmPin}
            onChange={handleInputChange}
            name="confirmPin"
          />

          {showConfirmPwd ? (
            <GoEyeClosed
              onClick={() => updateConfirmPwd(!showConfirmPwd)}
              className="cursor-pointer"
            />
          ) : (
            <GoEye
              onClick={() => updateConfirmPwd(!showConfirmPwd)}
              className="cursor-pointer"
            />
          )}
        </div>

        {isError && (
          <p className="text-red-500 text-sm text-center">{message}</p>
        )}
        {isSuccess && (
          <p className="text-green-500 text-sm text-center">
            PIN set successfully!
          </p>
        )}

        <button
          className={
            isLoading
              ? "w-full bg-[#F2E205] text-[#0F0140] py-2 mt-3 rounded animate-pulse"
              : "w-full bg-[#F2E205] text-[#0F0140] py-2 mt-3 rounded"
          }
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Set PIN"}
        </button>
      </div>
    </div>
  );
};

export default PinSetup;
