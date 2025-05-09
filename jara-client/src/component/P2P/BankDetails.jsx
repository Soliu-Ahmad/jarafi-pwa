import React, { useEffect, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { LuSettings2, LuWalletMinimal } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const BankDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [accountType, setAccountType] = useState("");
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get("https://restcountries.com/v3.1/all");
        const data = res.data.map((c) => ({
          name: c.name.common,
          code: c.cca2,
          region: c.region,
          currency: Object.keys(c.currencies || {})[0] || "NGN",
        }));
        setCountries(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Failed to load countries");
      }
    };

    fetchCountries();
  }, []);

  const handleCountrySelect = async (code) => {
    const country = countries.find((c) => c.code === code);
    setSelectedCountry(country);

    const ibanAfricanCountries = ["TN", "MA", "DZ"];
    const isIban =
      ibanAfricanCountries.includes(code) || country.region !== "Africa";
    const acctType = isIban ? "iban" : "nuban";
    setAccountType(acctType);

    try {
      const response = await axios.get(
        `https://sandboxapi.fincra.com/core/banks?currency=${country.currency}&country=${code}`,
        {
          headers: {
            accept: "application/json",
            "api-key": import.meta.env.VITE_APP_FINCRA_API_KEY,
          },
        }
      );
      setBanks(response.data.data || []);
    } catch (err) {
      toast.error("Could not fetch banks for selected country");
    }
  };

  const handleBankSelect = (name) => {
    const bank = banks.find((b) => b.name === name);
    setBankName(name);
    setBankCode(bank?.code || "");
  };

  const handleVerify = async () => {
    if (!isVerified) {
      setIsLoading(true);
      try {
        const res = await axios.post(
          "https://sandboxapi.fincra.com/core/accounts/resolve",
          {
            accountNumber,
            type: accountType,
            bankCode,
          },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "api-key": import.meta.env.VITE_APP_FINCRA_API_KEY,
            },
          }
        );

        const resolvedName = res.data.data?.accountName;
        if (resolvedName) {
          setAccountName(resolvedName);
          setIsVerified(true);
          toast.success("Account verified!");
        } else {
          toast.error("Account verification failed.");
        }
      } catch (error) {
        toast.error("Error verifying account.");
      } finally {
        setIsLoading(false);
      }
    } else {
      navigate("/p2p", {
        state: {
          bankName,
          bankCode,
          accountNumber,
          accountName,
          accountType,
          country: selectedCountry?.name,
        },
      });
    }
  };

  return (
    <section className="min-h-screen w-full flex justify-center items-center p-4 sm:p-8 relative">
      <header className="bg-[#0F0140] w-full p-4 flex items-center justify-center absolute top-0 left-0">
        <h2 className="text-[#F6F5F6] text-[24px] font-bold">
          Link Bank Account
        </h2>
      </header>

      <main className="flex flex-col items-center gap-6 md:w-[450px] w-full pt-24">
        <div className="space-y-4 w-full">
          <p className="text-[24px] text-[#141414] font-[700] my-6">
            Bank Details.
          </p>

          <div className="mb-4">
            <label className="block mb-1">Country</label>
            <select
              onChange={(e) => handleCountrySelect(e.target.value)}
              className="w-full border-none outline-none p-2 rounded"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCountry && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Account Type</label>
                <input
                  value={accountType.toUpperCase()}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-[16px] font-[400] text-[#4F4E50]">
                  Bank Name
                </label>
                <select
                  onChange={(e) => handleBankSelect(e.target.value)}
                  className="w-full border p-2 rounded outline-none"
                >
                  <option value="">Select Bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {bankCode && (
                <div className="mb-4">
                  <label className="block mb-1">Bank Code</label>
                  <input
                    type="text"
                    value={bankCode}
                    disabled
                    className="w-full border p-2 rounded bg-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-[16px] font-[400] text-[#4F4E50]">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1 w-full border border-[#262526BF] rounded-lg p-2 outline-none placeholder:text-[#D1D0D1] placeholder:text-[14px]"
                  placeholder="enter account number"
                />
              </div>

              <div>
                <label className="block text-[16px] font-[400] text-[#4F4E50]">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  disabled
                  className="mt-1 w-full border border-[#262526BF] rounded-lg p-2 outline-none placeholder:text-[#D1D0D1] placeholder:text-[14px]"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={
                  isLoading || !accountNumber || !bankCode || !accountType
                }
                className="mt-6 w-full bg-[#F2E205] text-[#4F4E50] py-2 rounded-lg text-[16px] transition duration-200 hover:opacity-90 disabled:opacity-60"
              >
                {isLoading
                  ? "Verifying..."
                  : isVerified
                  ? "Proceed"
                  : "Verify Account"}
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 bg-white py-4 w-full flex items-center justify-between px-[40px] md:px-[120px] border-t-[1px] border-[#B0AFB1]">
        <Link to="/dashboard">
          <LuWalletMinimal
            size={25}
            color={isActive("/dashboard") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
        <Link to="/p2p">
          <FaExchangeAlt
            size={25}
            color={
              isActive("/p2p") || isActive("/add-bank") ? "#0F0140" : "#B0AFB1"
            }
          />
        </Link>
        <Link to="/settings">
          <LuSettings2
            size={25}
            color={isActive("/settings") ? "#0F0140" : "#B0AFB1"}
          />
        </Link>
      </footer>
    </section>
  );
};

export default BankDetails;
