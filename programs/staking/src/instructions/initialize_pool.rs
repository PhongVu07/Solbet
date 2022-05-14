use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program_option::COption};
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::schemas::*;

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub staking_mint: Box<Account<'info, Mint>>,

    #[account(
        constraint = staking_vault.mint == staking_mint.key(),
        constraint = staking_vault.owner == pool_signer.key(),
        // in our "pool close" operation we want to assert it is still open
        constraint = staking_vault.close_authority == COption::None,
    )]
    pub staking_vault: Account<'info, TokenAccount>,

    pub reward_mint: Box<Account<'info, Mint>>,

    #[account(
        constraint = reward_vault.mint == reward_mint.key(),
        constraint = reward_vault.owner == pool_signer.key(),
        // in our "pool close" operation we want to assert it is still open
        constraint = reward_vault.close_authority == COption::None,
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [
            pool.to_account_info().key.as_ref()
        ],
        bump = bump,
    )]
    /// CHECK: nothing to check.
    pub pool_signer: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = Pool::SIZE,
    )]
    pub pool: Account<'info, Pool>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub const MIN_DURATION: u64 = 86400;

pub fn exec(
    ctx: Context<InitializePool>,
    bump: u8,
    reward_duration: u64,
    lock_period: u64,
) -> Result<()> {
    if reward_duration < MIN_DURATION {
        return Err(ErrorCode::DurationTooShort.into());
    }

    let pool = &mut ctx.accounts.pool;

    pool.authority = ctx.accounts.authority.key();
    pool.bump = bump;
    pool.paused = false;
    pool.staking_mint = ctx.accounts.staking_mint.key();
    pool.staking_vault = ctx.accounts.staking_vault.key();
    pool.reward_mint = ctx.accounts.reward_mint.key();
    pool.reward_vault = ctx.accounts.reward_vault.key();
    pool.reward_duration = reward_duration;
    pool.reward_duration_end = 0;
    pool.lock_period = lock_period;
    pool.last_update_time = 0;
    pool.reward_rate = 0;
    pool.reward_per_token_stored = 0;
    pool.user_stake_count = 0;
    pool.total_staked = 0;

    Ok(())
}
