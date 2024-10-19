'use client'
import { client } from "@/app/client";
import { useAuthContext } from "@/app/context/AuthContext";
import { ConnectButton } from "thirdweb/react";

import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";

const inAppWalletConfig = inAppWallet({
  auth: {
    options: [
      "google",
      "discord",
      "telegram",
      "farcaster",
      "email",
      "passkey",
      "phone",
    ],
  },
});

const wallets = [
  inAppWalletConfig,
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const SignInButton = () => {
  const {login} = useAuthContext();
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      connectModal={{ size: "compact" }}
      appMetadata={{
        name: "Voucher System",
        url: "https://vouch4edu.vercel.app",
      }}
      onConnect={(wallet) => login(wallet.getAccount().address)}
    />
  );
}

export default SignInButton;