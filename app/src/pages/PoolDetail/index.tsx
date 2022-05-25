import React, { useEffect, useState } from "react";
import { Input } from "antd";
import { ComponentContainer } from "./style";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnectedWallet } from "@saberhq/use-solana";

import { usePool } from "temp";

const { Search } = Input;

const PoolDetail: React.FC = () => {
  const [poolPubkey, setPoolPubkey] = useState<string>("");
  const wallet = useConnectedWallet();

  const connection: Connection = new Connection(
    "https://api.devnet.solana.com"
  );
  const {
    userStakeAccount,
    poolDetail,
    setReload,
    stake,
    unstake,
    claim,
    getPendingReward,
  } = usePool({
    poolAddress: poolPubkey ? new PublicKey(poolPubkey) : PublicKey.default,
    connection,
    wallet,
  });

  return (
    <ComponentContainer>
      <Search
        placeholder="Input Pool Public Key"
        allowClear
        enterButton
        size="middle"
        onSearch={(value) => setPoolPubkey(value)}
      />
    </ComponentContainer>
  );
};
export default PoolDetail;
