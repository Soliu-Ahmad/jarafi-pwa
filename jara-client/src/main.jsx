import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WagmiProvider } from "wagmi";
import { config } from "./constant/config.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@getpara/react-sdk/styles.css";
import { Provider } from "react-redux";
import store from "./redux/store.js";
// import { wagmiConfig } from "./constant/wagmiClient.js";

const queryClient = new QueryClient();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      subscribeToPush();
    }
  });
}

function subscribeToPush() {
  navigator.serviceWorker.ready.then((registration) => {
    registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_APP_WEB_PUSH_PUBLIC_KEY,
      })
      .then((subscription) => {
        console.log("Subscribed to push notifications:", subscription);
        localStorage.setItem("push-subscription", JSON.stringify(subscription));
      })
      .catch((error) => {
        console.error("Failed to subscribe to push notifications:", error);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <ToastContainer />
            <App />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
