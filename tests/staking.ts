import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { createAccount, createMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import assert from "assert";
import { Staking } from "../target/types/staking";

describe("staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const stakingProgram = anchor.workspace.Staking as Program<Staking>;
  let stakingMint: PublicKey;
  let stakingVault: anchor.web3.PublicKey;
  let rewardMint: PublicKey;
  let rewardVault: anchor.web3.PublicKey;
  let pool: anchor.web3.Keypair;
  let poolSigner: anchor.web3.PublicKey;
  let bump: number;
  let user: anchor.web3.PublicKey;
  let ownerTokenAccount: anchor.web3.PublicKey;
  const lockPeriod = new anchor.BN(0);
  const rewardDuration = new anchor.BN(86400 * 7);
  let wallet: anchor.Wallet = provider.wallet as anchor.Wallet;

  before(async () => {
    stakingMint = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 9 );
    rewardMint = await createMint(provider.connection, wallet.payer, wallet.publicKey, null, 9 );
  });

  beforeEach(async () => {
    pool = anchor.web3.Keypair.generate();

    let [_poolSigner, _bump] = await anchor.web3.PublicKey.findProgramAddress(
      [pool.publicKey.toBuffer()],
      stakingProgram.programId
    );
    poolSigner = _poolSigner;
    bump = _bump;

    stakingVault = await createAccount(provider.connection, wallet.payer, stakingMint, poolSigner);
    rewardVault = await createAccount(provider.connection, wallet.payer, rewardMint, poolSigner);
  });

  describe("initialize pool", () => {
    it("check initialized pool values", async () => {
      await initializePool(false);

      const poolAccount = await stakingProgram.account.pool.fetch(
        pool.publicKey
      );
      assert.equal(
        poolAccount.authority.toString(),
        wallet.publicKey.toString()
      );
      assert.equal(poolAccount.bump, bump);
      assert.equal(poolAccount.paused, false);
      assert.equal(poolAccount.stakingMint.toString(), stakingMint);
      assert.equal(poolAccount.stakingVault.toString(), stakingVault);
      assert.equal(poolAccount.rewardMint.toString(), rewardMint);
      assert.equal(poolAccount.rewardVault.toString(), rewardVault);
      assert.equal(
        poolAccount.rewardDuration.toString(),
        rewardDuration.toString()
      );
      assert.equal(poolAccount.rewardDurationEnd.toString(), "0");
      assert.equal(poolAccount.lockPeriod.toString(), lockPeriod.toString());
      assert.equal(poolAccount.lastUpdateTime.toString(), "0");
      assert.equal(poolAccount.rewardRate.toString(), "0");
      assert.equal(poolAccount.rewardPerTokenStored.toString(), "0");
      assert.equal(poolAccount.userStakeCount.toString(), "0");
      assert.equal(poolAccount.funders.length, 5);
    });
  });

  const initializePool = async (noTier: boolean) => {
    await stakingProgram.methods
      .initializePool(bump, rewardDuration, lockPeriod)
      .accounts({
        authority: wallet.publicKey,
        stakingMint,
        stakingVault,
        rewardMint: rewardMint,
        rewardVault: rewardVault,
        poolSigner: poolSigner,
        pool: pool.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .postInstructions([
        await stakingProgram.account.pool.createInstruction(pool),
      ])
      .signers([pool])
      .rpc();
  };
});
