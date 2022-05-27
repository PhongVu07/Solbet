import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getStakingProgram } from "../actions";
import { RawPoolAccount } from "../types";

export const fund = async (
  amount: number,
  pool: RawPoolAccount,
  provider: anchor.AnchorProvider
) => {
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;

  const stakingProgram = getStakingProgram(connection, wallet);
  const tokenAccount = (
    await PublicKey.findProgramAddress(
      [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        pool.rewardMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
  const [poolSigner, _bump] = await anchor.web3.PublicKey.findProgramAddress(
    [pool.publicKey.toBuffer()],
    stakingProgram.programId
  );

  const tx = await stakingProgram.methods.fund(new anchor.BN(amount)).accounts({
    pool: pool.publicKey,
    stakingVault: pool.stakingVault,
    rewardVault: pool.rewardVault,
    funder: wallet.publicKey,
    from: tokenAccount,
    poolSigner: poolSigner,
    tokenProgram: TOKEN_PROGRAM_ID,
  }).rpc();

  console.log("Tx: ", tx);
  return tx;
};
