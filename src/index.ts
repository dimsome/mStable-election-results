import * as path from "path";
import * as fs from "fs";

import { getProposal, getVotes } from "./query/";
import { cleanVotes } from "./modules/cleanVotes";
import { multiWinnerRCV } from "./modules/multiWinnerRCV";

// Get args from command line
import minimist from "minimist";
const argv = minimist(process.argv.slice(2), {
  string: ["p"],
});

// -s <number>
// -p <id>

// ProtocolDAO VOTE: https://snapshot.org/#/mstablegovernance.eth/proposal/0x38bb1ddabc3dc063720b9f180c945d3ed8ac2099a3163eb45654c49de5112362
// const PROPOSAL_ID =
//   "0x38bb1ddabc3dc063720b9f180c945d3ed8ac2099a3163eb45654c49de5112362";
// const SEATS = 4;

// TreasuryDAO VOTE: https://snapshot.org/#/mstablegovernance.eth/proposal/0xd1cb8ca65b3f2e784267e76244116f67081444c740e54d304238aaa15a1a8b9a
// const PROPOSAL_ID =
//   "0xd1cb8ca65b3f2e784267e76244116f67081444c740e54d304238aaa15a1a8b9a";
// const SEATS = 6;

// TODO: Add functionality to remove choices from the calculation
const removedChoices = [];

const exec = async () => {
  // Check if arguments are provided
  if (!argv.s || !argv.p) {
    console.log("Please provide -s and -p arguments");
    return;
  }

  console.log(`Getting votes for proposal ${argv.p}`);
  console.log(`Got ${argv.s} seats to allocate`);

  let shouldSave = true;

  const proposal = await getProposal(argv.p);

  const allChoices = [...proposal.choices];

  console.log(
    `Fetched Proposal: "${proposal.title}" from Space: "${proposal.space.name}"`
  );
  console.log(`Voting Type: "${proposal.type}"`);

  if (proposal.type !== "ranked-choice") {
    console.log(`This proposal is NOT ranked choice, cannot continue!`);
    return;
  }

  // if (proposal.end < Date.now() / 1000) {
  //   console.log(
  //     `This proposal is still being voted on, no results will be written to file!`
  //   );
  //   shouldSave = false;
  // }
  console.log(`There are ${proposal.votes} votes for this proposal`);

  console.log(`Fetching votes...`);
  let votes = cleanVotes(await getVotes(argv.p), proposal.choices.length);
  console.log(`There are ${votes.length} votes casted`);

  console.log(`Running Multi-Winner RCV...`);
  const { winners, rounds } = multiWinnerRCV(
    votes,
    proposal.choices,
    argv.s,
    removedChoices
  );

  console.log(`Winners: ${winners}`);

  if (shouldSave) {
    const resultsObj = {
      proposalId: argv.p,
      seats: argv.s,
      removedChoices: removedChoices,
      proposal: {
        ...proposal,
        choices: allChoices,
      },
      winners: winners,
      rounds: rounds,
      votes: votes,
    };

    console.log(`Writing results to file...`);
    try {
      fs.writeFileSync(
        path.join(__dirname, "../results", `${argv.p}.json`),
        JSON.stringify(resultsObj, null, 2),
        { flag: "w+" }
      );
    } catch (err) {
      console.error(err);
    }
  }
  console.log(`Done!`);
};

exec();
