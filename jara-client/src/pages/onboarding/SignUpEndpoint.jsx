import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignUpEndpoint = () => {
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

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      className="bg-[#F2E205] h-screen w-full p-6 flex flex-col items-center justify-center gap-[80px] text-center text-[#0F0140] relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <img
        src="/wp.svg"
        alt="Background Top Left"
        className="absolute top-0 right-0 md:hidden"
      />
      <img
        src="/wpii.svg"
        alt="Background Bottom Right"
        className="absolute bottom-0 right-0 md:hidden"
      />
      <img
        src="/vite.svg"
        alt="Background Top Left"
        className="absolute top-0 left-0 w-36 md:w-48 lg:w-64 hidden md:block"
      />
      <img
        src="/bg-down.svg"
        alt="Background Bottom Left"
        className="absolute bottom-10 left-0 w-28 md:w-40 lg:w-56 hidden md:block"
      />
      <img
        src="/bgEight.png"
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

      <div className="flex flex-col items-center space-y-6 md:mt-12">
        <img
          src="/WIS.png"
          alt="Wallet Info System"
          className="max-w-md h-auto object-contain"
        />

        <h1 className="md:text-3xl text-xl font-bold md:p-2 w-2/3">
          Wallet Address = Phone Number
        </h1>

        <p className="text-lg md:text-xl max-w-lg leading-relaxed md:p-2 w-2/3">
          Send and receive stable coins using your mobile number as your wallet
          address.
        </p>
      </div>

      <motion.div
        className="flex flex-col items-center space-y-2 mb-[3.5rem] "
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          className="bg-[#0F0140] py-3 px-8 text-[#F6F5F6] text-[16px] rounded-lg text-lg font-medium shadow-lg w-full md:w-[350px] hover:bg-[#0f0140b8] transition-transform transform"
          onClick={() => navigate("/sign-up-user")}
        >
          Sign Up
        </motion.button>
        <motion.button
          className="bg-[#FCFEE8] py-3 px-8 text-[#4F4E50] text-[16px] border-[1px] border-[#F2E205] rounded-lg text-lg font-medium shadow-lg w-full md:w-[350px] hover:bg-[#0F0140] hover:text-[#fff] transition-colors duration-300 delay-300 transform"
          onClick={() => navigate("/login")}
        >
          Already have one? Log in
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SignUpEndpoint;
