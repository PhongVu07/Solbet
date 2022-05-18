import { PublicKey } from '@solana/web3.js';

export type UserAccount = {
  account: PublicKey,
  bump: number,
}

export type PoolDetail = {
  tvl: number,
  apr: string,
  paused: boolean,
}