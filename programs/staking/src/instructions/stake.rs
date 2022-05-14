use anchor_lang::prelude::*;
use anchor_spl::{token};
use anchor_spl::token::{Token, TokenAccount};
use anchor_lang::solana_program::clock;

use super::utils::*;
use crate::errors::ErrorCode;
use crate::schemas::*;

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // Global accounts for the staking instance.
    #[account(
        mut,
        has_one = staking_vault,
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        constraint = staking_vault.owner == *pool_signer.key,
    )]
    pub staking_vault: Account<'info, TokenAccount>,

    // User.
    #[account(
        mut,
        has_one = authority,
        has_one = pool,
        seeds = [
            authority.key.as_ref(),
            pool.to_account_info().key.as_ref()
        ],
        bump = user.bump,
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub stake_from_account: Account<'info, TokenAccount>,

    // Program signers.
    #[account(
        seeds = [
            pool.to_account_info().key.as_ref()
        ],
        bump = pool.bump,
    )]
    /// CHECK: nothing to check.
    pub pool_signer: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn exec_stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    if amount == 0 {
        return Err(ErrorCode::AmountMustBeGreaterThanZero.into());
    }

    let pool = &mut ctx.accounts.pool;
    if pool.paused {
        return Err(ErrorCode::PoolPaused.into());
    }

    let total_staked = pool.total_staked;

    let user_opt = Some(&mut ctx.accounts.user);
    update_rewards(pool, user_opt, total_staked).unwrap();
    let clock = clock::Clock::get().unwrap();
    ctx.accounts.user.balance_staked = ctx
        .accounts
        .user
        .balance_staked
        .checked_add(amount)
        .unwrap();
    ctx.accounts.user.maturity_time = u64::try_from(clock.unix_timestamp)
        .unwrap()
        .checked_add(pool.lock_period)
        .unwrap();

    // Transfer tokens into the stake vault.
    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.stake_from_account.to_account_info(),
                to: ctx.accounts.staking_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;
    }

    pool.total_staked += amount;

    Ok(())
}

pub fn exec_unstake(ctx: Context<Stake>, spt_amount: u64) -> Result<()> {
    if spt_amount == 0 {
        return Err(ErrorCode::AmountMustBeGreaterThanZero.into());
    }

    let clock = clock::Clock::get().unwrap();
    if ctx.accounts.user.maturity_time > u64::try_from(clock.unix_timestamp).unwrap() {
        return Err(ErrorCode::CannotStakeOrClaimBeforeMaturity.into());
    }

    if ctx.accounts.user.balance_staked < spt_amount {
        return Err(ErrorCode::InsufficientFundUnstake.into());
    }

    let pool = &mut ctx.accounts.pool;
    let total_staked = pool.total_staked;

    let user_opt = Some(&mut ctx.accounts.user);
    update_rewards(pool, user_opt, total_staked).unwrap();
    ctx.accounts.user.balance_staked = ctx
        .accounts
        .user
        .balance_staked
        .checked_sub(spt_amount)
        .unwrap();

    pool.total_staked -= spt_amount;

    // Transfer tokens from the pool vault to user vault.
    {
        let seeds = &[pool.to_account_info().key.as_ref(), &[pool.bump]];
        let pool_signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.staking_vault.to_account_info(),
                to: ctx.accounts.stake_from_account.to_account_info(),
                authority: ctx.accounts.pool_signer.to_account_info(),
            },
            pool_signer,
        );
        token::transfer(cpi_ctx, spt_amount.try_into().unwrap())?;
    }

    Ok(())
}