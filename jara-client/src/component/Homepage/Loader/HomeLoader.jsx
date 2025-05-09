import React from "react";
import "./HomeLoader.css";

const HomeLoader = () => {
  return (
    <div className="flex flex-col text-[#F2E205] items-center justify-center">
      <div className="spinner"></div>
      <p className="text-2xl font-[Monteserrat sans] ">JARAFI</p>
    </div>
  );
};

export default HomeLoader;
