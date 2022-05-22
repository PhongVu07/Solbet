import { getStakingProgram } from "./../temp/usePool/utils";
import * as anchor from "@project-serum/anchor";
import {
  AccountLayout,
  createInitializeAccountInstruction,
  getMinimumBalanceForRentExemptAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const createPool = async (
  time: number,
  mint: string,
  provider: anchor.AnchorProvider
) => {
  const lockPeriod = new anchor.BN(time);
  const tokenMint = new PublicKey(mint);
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;

  const stakingProgram = getStakingProgram(connection, wallet);

  const pool = anchor.web3.Keypair.generate();
  let [poolSigner, nonce] = await anchor.web3.PublicKey.findProgramAddress(
    [pool.publicKey.toBuffer()],
    stakingProgram.programId
  );

  const stakingVaultKeypair = anchor.web3.Keypair.generate();
  const rewardVaultKeypair = anchor.web3.Keypair.generate();

  const rewardDuration = new anchor.BN(3600 * 24 * 7);
  const tx = await stakingProgram.methods
    .initializePool(nonce, rewardDuration, lockPeriod)
    .accounts({
      authority: wallet.publicKey,
      stakingMint: tokenMint,
      stakingVault: stakingVaultKeypair.publicKey,
      rewardMint: tokenMint,
      rewardVault: rewardVaultKeypair.publicKey,
      poolSigner: poolSigner,
      pool: pool.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions([
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: stakingVaultKeypair.publicKey,
        space: AccountLayout.span,
        lamports: await getMinimumBalanceForRentExemptAccount(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: rewardVaultKeypair.publicKey,
        space: AccountLayout.span,
        lamports: await getMinimumBalanceForRentExemptAccount(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeAccountInstruction(
        stakingVaultKeypair.publicKey,
        tokenMint,
        poolSigner
      ),
      createInitializeAccountInstruction(
        rewardVaultKeypair.publicKey,
        tokenMint,
        poolSigner
      ),
    ])
    .signers([pool, stakingVaultKeypair, rewardVaultKeypair])
    .rpc();

  return tx;
};
