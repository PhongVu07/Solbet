use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use anchor_lang::solana_program::clock;
use anchor_spl::{token};

use super::utils::*;
use crate::errors::ErrorCode;
use crate::schemas::*;

#[derive(Accounts)]
pub struct Fund<'info> {
    // Global accounts for the staking instance.
    #[account(
        mut,
        has_one = reward_vault,
        constraint = !pool.paused @ ErrorCode::PoolPaused,
    )]
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    pub reward_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        //require signed funder auth - otherwise constant micro fund could hold funds hostage
        constraint = funder.key() == pool.authority || pool.funders.iter().any(|x| *x == funder.key()),
    )]
    pub funder: Signer<'info>,
    #[account(mut)]
    pub from: Box<Account<'info, TokenAccount>>,

    // Program signers.
    #[account(
        seeds = [
            pool.to_account_info().key.as_ref()
        ],
        bump = pool.bump,
    )]
    /// CHECK: nothing to check.
    pub pool_signer: AccountInfo<'info>,

    // Misc.
    pub token_program: Program<'info, Token>,
}

pub fn exec(ctx: Context<Fund>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let total_staked = pool.total_staked;

    update_rewards(pool, None, total_staked).unwrap();

    let current_time = clock::Clock::get()
        .unwrap()
        .unix_timestamp
        .try_into()
        .unwrap();
    let reward_period_end = pool.reward_duration_end;

    if current_time >= reward_period_end {
        pool.reward_rate = amount.checked_div(pool.reward_duration).unwrap();
    } else {
        let remaining = pool.reward_duration_end.checked_sub(current_time).unwrap();
        let leftover = remaining.checked_mul(pool.reward_rate).unwrap();

        pool.reward_rate = amount
            .checked_add(leftover)
            .unwrap()
            .checked_div(pool.reward_duration)
            .unwrap();
    }

    // Transfer reward A tokens into the A vault.
    if amount > 0 {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.reward_vault.to_account_info(),
                authority: ctx.accounts.funder.to_account_info(),
            },
        );

        token::transfer(cpi_ctx, amount)?;
    }

    pool.last_update_time = current_time;
    pool.reward_duration_end = current_time.checked_add(pool.reward_duration).unwrap();

    Ok(())
}