import React from "react";
import { WalletKitProvider } from "@gokiprotocol/walletkit";

const PoolDetail: React.FC = () => {
  return (
    <WalletKitProvider
      app={{
        name: "GoldPool",
      }}
    >
      <></>
    </WalletKitProvider>
  );
};
export default PoolDetail;
