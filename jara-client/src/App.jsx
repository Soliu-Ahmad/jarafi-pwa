import React from "react";
import { Route, Routes } from "react-router-dom";
import {
  ConfirmEmail,
  Congratulation,
  CreateWallet,
  Home,
  HomePage,
  Login,
  MainPage,
  MainScreen,
  ReceiveAssets,
  Register,
  SignUpEndpoint,
  Swap,
  TokenDetails,
  TWE,
  WalletShowcase,
  Send,
  CardPage,
  Settings,
  FinalFundingExt,
  RequestCard,
  Verify,
  GetVerified,
  SelectResidence,
  SelectId,
  PinSetup,
  BankDetails,
} from "./index";

import { AuthRoute, IdleTimeout } from "./component/Registration/AuthRoute";
import { TOKENS } from "./constant/otherChains";
import AuthWrapper from "./component/Registration/AuthWrapper";

const tokens = TOKENS;

function App() {
  return (
    <>
      <IdleTimeout />
      <Routes>
        <Route
          path="/"
          element={
            <AuthWrapper>
              <Home />
            </AuthWrapper>
          }
        />
        <Route path="/dashboard" element={<HomePage />} />
        <Route
          path="/token-details/:id"
          element={<TokenDetails tokens={tokens} />}
        />
        <Route path="/p2p" element={<MainPage />} />
        <Route path="/final-funding" element={<FinalFundingExt />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/get-verified" element={<GetVerified />} />
        <Route path="/select-residence" element={<SelectResidence />} />
        <Route path="/select-id" element={<SelectId />} />

        <Route
          path="/main-screen"
          element={
            <AuthWrapper>
              <MainScreen />
            </AuthWrapper>
          }
        />
        <Route
          path="/trade-with-ease"
          element={
            <AuthWrapper>
              <TWE />
            </AuthWrapper>
          }
        />
        <Route
          path="/sign-up-endpoint"
          element={
            <AuthWrapper>
              <SignUpEndpoint />
            </AuthWrapper>
          }
        />
        <Route
          path="/create-wallet"
          element={
            <AuthWrapper>
              <CreateWallet />
            </AuthWrapper>
          }
        />
        <Route
          path="/wallet-showcase"
          element={
            <AuthWrapper>
              <WalletShowcase />
            </AuthWrapper>
          }
        />
        <Route path="/congrats" element={<Congratulation />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/create-pin" element={<PinSetup />} />

        {/* Protected routes */}
        <Route
          path="/card-display"
          element={<AuthRoute element={<CardPage />} />}
        />
        <Route
          path="/request-card"
          element={<AuthRoute element={<RequestCard />} />}
        />
        <Route path="/send" element={<AuthRoute element={<Send />} />} />
        <Route path="/swap" element={<AuthRoute element={<Swap />} />} />
        <Route
          path="/recieve"
          element={<AuthRoute element={<ReceiveAssets />} />}
        />

        <Route
          path="/add-bank"
          element={<AuthRoute element={<BankDetails />} />}
        />

        {/* Auth-only pages wrapped with AuthWrapper */}
        <Route
          path="/login"
          element={
            <AuthWrapper>
              <Login />
            </AuthWrapper>
          }
        />
        <Route
          path="/sign-up-user"
          element={
            <AuthWrapper>
              <Register />
            </AuthWrapper>
          }
        />
        <Route
          path="/confirm-email"
          element={
            <AuthWrapper>
              <ConfirmEmail />
            </AuthWrapper>
          }
        />
      </Routes>
    </>
  );
}

export default App;
