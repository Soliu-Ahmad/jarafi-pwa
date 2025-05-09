import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MainScreen = () => {
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

  const imageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.8 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        key={location.key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-[#0F0140] h-screen w-full p-6 flex flex-col items-center justify-center gap-[80px] relative"
      >
        <motion.img
          src="/bg-up.png"
          alt="Background Top Left"
          className="absolute top-0 left-0 w-36 md:w-48 lg:w-64 hidden md:block"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        />
        <motion.img
          src="/mobile.svg"
          alt="Background Top Left"
          className="absolute top-0 left-0 md:w-48 lg:w-64 md:hidden"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        />
        <motion.img
          src="/bg-down.svg"
          alt="Background Bottom Left"
          className="absolute bottom-0 left-0 w-28 md:w-40 lg:w-56 hidden md:block"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        />
        <motion.img
          src="/bgFour.png"
          alt="Background Bottom Right"
          className="absolute bottom-4 right-0 rotate-30 w-36 md:w-48 lg:w-64 hidden md:block"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        />
        <motion.img
          src="/bgThree.png"
          alt="Background Top Right"
          className="absolute top-0 right-0 w-36 md:w-48 lg:w-64 hidden md:block"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        />

        {/* Content Section */}
        <motion.div
          className="flex flex-col items-center text-center text-white space-y-6 mt-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/jarafi-yellow.png"
            alt="Jarafi Logo"
            className="w-32 md:w-40 lg:w-48"
          />
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug max-w-lg">
            Keep all your stable coins in one place
          </p>
          <p className="text-[14px] font-bold leading-snug max-w-lg">
            Send, receive, and exchange stable coins seamlessly!
          </p>
        </motion.div>

        {/* Buttons Section */}
        <motion.div
          className="mb-12 space-y-4 flex flex-col items-center gap-[80px]"
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
        >
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

          <motion.button
            className="bg-[#F2E205] duration-300 py-3 px-8 text-[#4F4E50] max-w-sm rounded-lg text-lg font-medium shadow-lg w-[350px] text-center hover:bg-[#e4d704] transition-transform transform "
            onClick={() => navigate("/trade-with-ease")}
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MainScreen;
