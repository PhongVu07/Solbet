use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::schemas::*;

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // Stake instance.
    #[account(
        mut,
        constraint = !pool.paused @ ErrorCode::PoolPaused,
    )]
    pub pool: Account<'info, Pool>,

    // User.
    #[account(
        init,
        payer = authority,
        seeds = [
            authority.key.as_ref(),
            pool.to_account_info().key.as_ref()
        ],
        space = User::SIZE,
        bump,
    )]
    pub user: Account<'info, User>,

    pub system_program: Program<'info, System>,
}

pub fn exec(ctx: Context<CreateUser>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    user.pool = *ctx.accounts.pool.to_account_info().key;
    user.authority = *ctx.accounts.authority.key;
    user.reward_per_token_complete = 0;
    user.reward_per_token_pending = 0;
    user.balance_staked = 0;
    user.maturity_time = 0;
    user.bump = *ctx.bumps.get("user").unwrap();

    let pool = &mut ctx.accounts.pool;
    pool.user_stake_count = pool.user_stake_count.checked_add(1).unwrap();

    Ok(())
}