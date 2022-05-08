use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use anchor_lang::solana_program::clock;
use anchor_spl::{token};

use super::utils::*;
use crate::errors::ErrorCode;
use crate::schemas::*;

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    pub authority: Signer<'info>,

    // Global accounts for the staking instance.
    #[account(
        mut,
        has_one = staking_vault,
        has_one = reward_vault,
    )]
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    pub staking_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

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
    pub reward_account: Box<Account<'info, TokenAccount>>,

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

pub fn exec(ctx: Context<ClaimReward>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let total_staked = pool.total_staked;

    let clock = clock::Clock::get().unwrap();
    if ctx.accounts.user.maturity_time > u64::try_from(clock.unix_timestamp).unwrap() {
        return Err(ErrorCode::CannotStakeOrClaimBeforeMaturity.into());
    }

    let user_opt = Some(&mut ctx.accounts.user);
    update_rewards(pool, user_opt, total_staked).unwrap();

    let seeds = &[pool.to_account_info().key.as_ref(), &[pool.bump]];
    let pool_signer = &[&seeds[..]];

    if ctx.accounts.user.reward_per_token_pending > 0 {
        let mut reward_amount = ctx.accounts.user.reward_per_token_pending;
        let vault_balance = ctx.accounts.reward_vault.amount;

        ctx.accounts.user.reward_per_token_pending = 0;
        if vault_balance < reward_amount {
            reward_amount = vault_balance;
        }

        if reward_amount > 0 {
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.reward_vault.to_account_info(),
                    to: ctx.accounts.reward_account.to_account_info(),
                    authority: ctx.accounts.pool_signer.to_account_info(),
                },
                pool_signer,
            );
            token::transfer(cpi_ctx, reward_amount)?;
        }
    }
    Ok(())
}