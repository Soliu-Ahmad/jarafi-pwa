import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

const Verify = () => {
  const navigate = useNavigate();
  const { address } = useAccount();

  const [loading, setLoading] = useState(false);

  // Log environment variables for debugging
  console.log("Environment Variables:", {
    appID: import.meta.env.VITE_APP_DOJAH_APP_ID,
    publicKey: import.meta.env.VITE_APP_DOJAH_PUBLIC_KEY,
    widget_id: import.meta.env.VITE_APP_DOJAH_WIDGET_ID,
  });

  // Dojah credentials from environment variables
  const dojahCredentials = {
    appID: import.meta.env.VITE_APP_DOJAH_APP_ID,
    publicKey: import.meta.env.VITE_APP_DOJAH_PUBLIC_KEY,
    widget_id: import.meta.env.VITE_APP_DOJAH_WIDGET_ID,
    reference_id: address ? address.toString() : null,
  };

  // Dojah configuration
  const { appID, publicKey, widget_id, reference_id } = dojahCredentials;
  // const type = "custom"; // Widget type
  // const config = { widget_id, reference_id };

  // // Handle Dojah widget response
  // const response = (type, data) => {
  //   switch (type) {
  //     case "success":
  //       navigate("/card-display")
  //       console.log("Verification successful:", data);
  //       break;
  //     case "error":
  //       console.error("Verification error:", data);
  //       setLoading(false); // Reset loading state on error
  //       break;
  //     case "close":
  //       console.log("Widget closed by user");
  //       setLoading(false); // Reset loading state when widget is closed
  //       break;
  //     case "begin":
  //       console.log("Verification process started");
  //       break;
  //     case "loading":
  //       console.log("Widget is loading...");
  //       break;
  //     default:
  //       console.warn("Unknown response type:", type, data);
  //   }
  // };

  // Handle button click to start verification
  const handleClick = () => {
    if (!window.Connect) {
      console.error("Dojah script not loaded yet.");
      return;
    }

    setLoading(true);

    const options = {
      app_id: appID,
      p_key: publicKey,
      type: "custom",
      // user_data: {
      //   residence_country: "NG",
      //   // You can optionally pass first_name, last_name, dob, email here
      // },
      metadata: {
        user_id: address || "unknown",
      },
      config: {
        widget_id,
        reference_id
      },
      onSuccess: (res) => {
        console.log("Success", res);
        navigate("/card-display");
      },
      onError: (err) => {
        console.error("Error", err);
        setLoading(false);
      },
      onClose: () => {
        console.log("Widget closed");
        setLoading(false);
      },
    };

    const connect = new window.Connect(options);
    connect.setup();
    connect.open();
  };

  // Reset loading state if the component unmounts
  useEffect(() => {
    return () => setLoading(false);
  }, []);

  return (
    <section className="bg-[#D0D6FF80] min-h-screen flex flex-col justify-center items-center">
      <header className="bg-[#0F0140] w-full p-4 flex items-center justify-center">
        <h2 className="text-white text-2xl font-bold">My Card</h2>
      </header>

      <main className="flex flex-col items-center flex-grow w-auto md:w-[400px]">
        <div className="flex flex-col items-center justify-center mt-[120px] gap-10">
          <img
            src="/verify.png"
            alt="Verification Icon"
            className="h-[122px] w-[122px]"
          />
          <h4 className="font-['Merriweather Sans'] font-bold text-[24px] text-center text-[#262526]">
            Now, let's verify your photo ID
          </h4>
        </div>

        <p className="w-[228px] sm:w-[300px] mt-12 text-center text-[17px] text-[#6F6B6F] font-normal font-['Montserrat']">
          This will establish your identity, and prevent someone else from
          claiming your account.
        </p>

        <button
          onClick={handleClick}
          className="w-full md:w-[350px] flex justify-center items-center px-4 py-3 bg-[#F2E205] rounded-lg font-['Montserrat'] font-semibold text-base text-[#4F4E50] mt-6 hover:bg-[#E0D204] transition-colors duration-200"
          disabled={loading}
        >
          {loading ? "Loading... Please wait!" : "Continue"}
        </button>

        {/* Render the Dojah widget */}
        {/* {loading && (
          <Dojah
            response={response}
            appID={appID}
            publicKey={publicKey}
            type={type}
            config={config}
            
          />
        )} */}
      </main>
    </section>
  );
};

export default Verify;
