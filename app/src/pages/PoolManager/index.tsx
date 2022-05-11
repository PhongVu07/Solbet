import React from "react";
import { WalletKitProvider, useWalletKit } from "@gokiprotocol/walletkit";
import { useSolana, useConnectedWallet } from "@saberhq/use-solana";

const PoolManager: React.FC = () => {
  const { disconnect } = useSolana();
  const wallet = useConnectedWallet();
  const { connect } = useWalletKit();

  return <>Pool Manager</>;
};
export default PoolManager;
