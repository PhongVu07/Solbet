import * as anchor from "@project-serum/anchor";
import { ConnectedWallet } from "@saberhq/use-solana";
import { Connection, PublicKey } from "@solana/web3.js";

import { SOLPOOL_PROGRAM_ID } from "../constants";
import idl from "../constants/staking.json";

export const getStakingProgram = (
  connection: Connection,
  connectedWallet: ConnectedWallet | anchor.Wallet | null
) => {
  if (!!connectedWallet) {
    const provider = new anchor.AnchorProvider(connection, connectedWallet, {
      skipPreflight: false,
    });

    const stakingProgram = new anchor.Program(
      idl as anchor.Idl,
      SOLPOOL_PROGRAM_ID,
      provider
    );

    return stakingProgram;
  }

  throw new Error("Wallet not connected")
};

export const getStakeAccount = async (
  program: anchor.Program,
  user: PublicKey
): Promise<any> => {
  try {
    const accountResponse = await program.account.user.fetch(user);
    return accountResponse;
  } catch (error) {
    return null;
  }
};

export const getParsedTokenAccountsByOwner = async (
  owner: PublicKey,
  mint: PublicKey,
  connection: Connection
) => {
  const tokens = await connection.getParsedTokenAccountsByOwner(owner, {
    mint,
  });
  if (tokens.value.length === 0) {
    return undefined;
  }
  return tokens.value[0].pubkey;
};

// @ts-ignore
export const getPoolDetail = async (poolAccount, connection: Connection) => {
  const tvlNoLock = await connection.getTokenAccountBalance(
    poolAccount?.stakingVault
  );
  const nr1 = parseInt(poolAccount?.rewardRate.toString()) * 365 * 86400;
  const dr1 =
    parseInt(tvlNoLock.value.amount) === 0
      ? 0
      : parseInt(tvlNoLock.value.amount);
  const a = isNaN((nr1 / dr1) * 100) ? 0 : (nr1 / dr1) * 100;
  return {
    tvl: tvlNoLock.value.uiAmount || 0,
    apr: a.toFixed(2),
    paused: poolAccount.paused,
  };
};

export const fetchUserAccount = async (
  wallet: ConnectedWallet,
  pool: PublicKey,
  connection: Connection
) => {
  const stakingProgram = getStakingProgram(connection, wallet)

  const [userAccount, userAccountBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), pool.toBuffer()],
      SOLPOOL_PROGRAM_ID
    );
  const userPoolAccount = {
    account: userAccount,
    bump: userAccountBump,
  };
  let userPoolDetail;

  const exist = await connection.getBalance(userAccount);
  if (exist && !!stakingProgram) {
    userPoolDetail = await getStakeAccount(stakingProgram, userAccount);
  }

  return {
    userPoolAccount,
    userPoolDetail,
  };
};
