import { GoPlus } from "react-icons/go";
import { useNavigate } from "react-router-dom";

const NBOverlay = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center justify-center p-6 ">
      <img src="/JaraFiLogin.png" alt="jarafi icon" width="183px" />

      <p className="text-[#0F0140] text-[24px] my-[30px] ">
        Link your bank account to get funds{" "}
      </p>

      <div
        className="border-dashed border-2 border-[#0F0140] rounded-lg p-2 text-[#262526] flex gap-2 items-center w-[350px] justify-center mt-[30px] cursor-pointer "
        onClick={() => navigate("/add-bank")}
      >
        <GoPlus size={20} /> Add Bank Account
      </div>
    </section>
  );
};

export default NBOverlay;
