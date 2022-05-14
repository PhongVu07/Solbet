use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock;

use crate::schemas::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct Pause<'info> {
    #[account(
        mut,
        has_one = authority,
        constraint = !pool.paused @ ErrorCode::PoolPaused,
        constraint = pool.reward_duration_end < clock::Clock::get().unwrap().unix_timestamp.try_into().unwrap(),
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Unpause<'info> {
    #[account(
        mut,
        has_one = authority,
        constraint = pool.paused,
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub authority: Signer<'info>,
}

pub fn exec_pause(ctx: Context<Pause>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    pool.paused = true;

    Ok(())
}

pub fn exec_unpause(ctx: Context<Unpause>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    pool.paused = false;
    Ok(())
}