// // wagmiClient.js
// import { http, createConfig } from "wagmi";
// import { paraConnector } from "@getpara/wagmi-v2-integration";
// import { OAuthMethod } from "@getpara/web-sdk";
// import para from "./paraClient";
// import { CELO_CHAIN, ETHEREUM_CHAIN, STARKNET_CHAIN } from "./otherChains";

// const connector = paraConnector({
//   para,
//   chains: [CELO_CHAIN, ETHEREUM_CHAIN, STARKNET_CHAIN],
//   appName: "Jarafi PWA",
//   options: {},
//   nameOverride: "Para",
//   idOverride: "para",
//   oAuthMethods: Object.values(OAuthMethod),
//   disableEmailLogin: false,
//   disablePhoneLogin: false,
//   onRampTestMode: true,
// });

// export const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: [connector],
//   transports: {
//     [CELO_CHAIN.id]: http(),
//     [ETHEREUM_CHAIN.id]: http(),
//     [STARKNET_CHAIN.id]: http(),
//   },
// });
