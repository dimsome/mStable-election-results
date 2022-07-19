import { getProposal, getVotes } from "./query/";
import { cleanVotes } from "./modules/cleanVotes";
import { multiWinnerRCV } from "./modules/multiWinnerRCV";

// Edit here to change how many seats are available
const SEATS = 4;

// Edit here the proposal ID, this is just used as an example
// Example vote here: https://snapshot.org/#/index-coop.eth/proposal/0xd0dc9324c4d617b769dae26a498d1d32d41af01f3ed630a5cdb50ccde124aa44
const PROPOSAL_ID =
  "0xd0dc9324c4d617b769dae26a498d1d32d41af01f3ed630a5cdb50ccde124aa44";

// TODO: Add functionality to remove choices from the calculation
const removedChoices = [];

const exec = async () => {
  //
  // TODO: Modify and add function to save the calculation results
  let shouldSave = true;

  const proposal = await getProposal(PROPOSAL_ID);

  console.log(
    `Fetched Proposal: "${proposal.title}" from Space: "${proposal.space.name}"`
  );
  console.log(`Voting Type: "${proposal.type}"`);

  if (proposal.type !== "ranked-choice") {
    console.log(`This proposal is NOT ranked choice, cannot continue!`);
    return;
  }

  if (proposal.end < Date.now()) {
    console.log(
      `This proposal is still being voted on, no results will be written to file!`
    );
    shouldSave = false;
  }
  console.log(`There are ${proposal.votes} votes for this proposal`);

  console.log(`Fetching votes...`);
  let votes = cleanVotes(await getVotes(PROPOSAL_ID), proposal.choices.length);
  console.log(`There are ${votes.length} votes casted`);

  console.log(`Running Multi-Winner RCV...`);
  const winners = multiWinnerRCV(
    votes,
    proposal.choices,
    SEATS,
    removedChoices
  );

  console.log(`Winners: ${winners}`);
};

exec();
