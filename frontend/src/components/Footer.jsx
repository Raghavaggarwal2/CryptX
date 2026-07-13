import React from "react";

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 flex flex-col justify-center items-center text-white bottom-0 fixed w-full py-3 z-20">
      <div className="logo text-white font-bold text-2xl">
        <span className="text-highlight">&lt;</span>
        Crypt
        <span className="text-highlight"> X/ &gt;</span>
      </div>
      <div className="font-bold text-md">Created by Raghav</div>
    </div>
  );
};

export default Footer;
