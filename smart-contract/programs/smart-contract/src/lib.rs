use anchor_lang::prelude::*;

declare_id!("HrcYHz2aTi7YT6QJcUbsD3eEF4UDXt7qo1S12b4B9rz6");

#[program]
pub mod vote_program {
    use super::*;

    // Create a new poll
    pub fn create_poll(
        ctx: Context<CreatePoll>,
        question: String,
        options: Vec<String>,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.creator = ctx.accounts.creator.key();
        poll.question = question;
        poll.options = options.clone();
        poll.vote_counts = vec![0; options.len()];
        poll.total_votes = 0;

        msg!("Poll created: {}", poll.question);
        Ok(())
    }

    // Cast a vote
    pub fn vote(ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let vote_record = &mut ctx.accounts.vote_record;

        // Check if option is valid
        require!(
            (option_index as usize) < poll.options.len(),
            VoteError::InvalidOption
        );

        // Create vote record
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.poll = poll.key();
        vote_record.option_index = option_index;

        // Increment vote count
        poll.vote_counts[option_index as usize] += 1;
        poll.total_votes += 1;

        msg!("Vote cast for option: {}", option_index);
        Ok(())
    }
}

// Accounts required for creating a poll
#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 204 + 544 + 84 + 8,
        seeds = [b"poll", creator.key().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Accounts required for voting
#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = voter,
        space = 8 + 32 + 32 + 1,
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// Poll data structure
#[account]
pub struct Poll {
    pub creator: Pubkey,           // Who created it
    pub question: String,          // The question
    pub options: Vec<String>,      // Available options
    pub vote_counts: Vec<u64>,     // Vote count for each option
    pub total_votes: u64,          // Total votes cast
}

// Vote record data structure
#[account]
pub struct VoteRecord {
    pub voter: Pubkey,        // Who voted
    pub poll: Pubkey,         // Which poll
    pub option_index: u8,     // Which option chosen
}

// Error codes
#[error_code]
pub enum VoteError {
    #[msg("Invalid option index")]
    InvalidOption,
}