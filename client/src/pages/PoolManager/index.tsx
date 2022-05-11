import React from 'react'
import { WalletKitProvider } from "@gokiprotocol/walletkit";

const PoolManager: React.FC = () => {
  return (
    <WalletKitProvider
      app={{
        name: "GoldPool",
      }}
    >
      <></>
    </WalletKitProvider>
  )
}
export default PoolManager