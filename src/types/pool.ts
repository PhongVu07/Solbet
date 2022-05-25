import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type PoolDetail = {
  tvl: number,
  apr: string,
  paused: boolean,
}

export type RawPoolAccount = {
  authority: PublicKey;
  bump: number;
  funders: PublicKey[];
  lastUpdateTime: BN;
  lockPeriod: BN;
  paused: boolean;
  publicKey: PublicKey;
  rewardDuration: BN;
  rewardDurationEnd: BN;
  rewardMint: PublicKey;
  rewardPerTokenStored: BN;
  rewardRate: BN;
  rewardVault: PublicKey;
  stakingMint: PublicKey;
  stakingVault: PublicKey;
  totalStaked: BN;
  userStakeCount: number;
};
