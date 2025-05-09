import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TWE = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // Prevent scrolling when component mounts
    document.body.classList.add("overflow-hidden");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
  const isActive = (path) => location.pathname === path;

  // Animation variants for Framer Motion
  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  const pageTransition = {
    duration: 0.8,
    ease: "easeInOut",
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="bg-[#0F0140] h-screen w-full p-6 flex flex-col items-center justify-center gap-[80px] text-center text-white relative"
    >
      <img
        src="/bg-up.png"
        alt="Background Top Left"
        className="absolute top-0 left-0 w-36 md:w-48 lg:w-64 hidden md:block"
      />
      <img
        src="/start.svg"
        alt="Background Top Left"
        className="absolute top-0 left-0 w-36 md:w-48 lg:w-64 md:hidden"
      />
      <img
        src="/bg-down.svg"
        alt="Background Bottom Left"
        className="absolute bottom-10 left-0 w-28 md:w-40 lg:w-56 hidden md:block"
      />
      <img
        src="/bgSeven.png"
        alt="Background Center Right"
        className="absolute top-52 right-16 w-40 md:w-56 lg:w-72 hidden md:block"
      />
      <img
        src="/bgTen.png"
        alt="Background Top Right"
        className="absolute top-0 right-0 w-36 md:w-48 lg:w-64 hidden md:block"
      />
      <img
        src="/bgTen.png"
        alt="Background Bottom Right Rotated"
        className="absolute md:-bottom-9 md:right-10 -bottom-6 right-6 w-36 md:w-48 lg:w-64 rotate-90 hidden md:block"
      />
      <img
        src="/startii.svg"
        alt="Background Bottom Right Rotated"
        className="absolute -bottom-0 right-0 w-36 md:w-48 lg:w-64 md:hidden"
      />

      <div className="flex flex-col items-center space-y-6 mt-12">
        <img
          src="/cryptodron.png"
          alt="Trade with ease"
          className="max-w-md h-auto object-contain"
        />

        <h1 className="text-3xl md:text-4xl font-bold">Trade with Ease</h1>

        <p className="text-lg md:text-xl max-w-lg leading-relaxed w-[350px]">
          Trade your stable coins to fiat currency using our trusted P2P agents!
        </p>
      </div>

      <div className="mb-12 space-y-8 flex flex-col items-center gap-[80px]">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/main-screen")}
            className={`border-[1.2px] p-[1.8px] rounded-lg text-md font-medium shadow hover:bg-gray-200 duration-300 ${
              isActive("/main-screen")
                ? "bg-white text-[#0F0140]"
                : "border-[#ffffff] text-white"
            }`}
          ></button>

          <button
            onClick={() => navigate("/trade-with-ease")}
            className={`border-[1.2px] p-[1.8px] rounded-lg text-md font-medium shadow hover:bg-gray-200 duration-300 ${
              isActive("/trade-with-ease")
                ? "bg-white text-[#0F0140]"
                : "border-[#ffffff] text-white"
            }`}
          ></button>

          <button
            onClick={() => navigate("/sign-up-endpoint")}
            className={`border-[1.2px] p-[1.8px] rounded-lg text-md font-medium shadow hover:bg-gray-200 duration-300 ${
              isActive("/sign-up-endpoint")
                ? "bg-white text-[#0F0140]"
                : "border-[#ffffff] text-white"
            }`}
          ></button>
        </div>

        <button
          className="bg-[#F2E205] duration-300 py-3 px-8 text-[#4F4E50] max-w-sm rounded-lg text-lg font-medium shadow-lg w-[350px] text-center hover:bg-[#e4d704] transition-transform transform "
          onClick={() => navigate("/sign-up-endpoint")}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default TWE;
