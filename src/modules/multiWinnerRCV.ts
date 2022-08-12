const shiftVotes = (votes: any, exclusionList: any) => {
  if (exclusionList.length === 0) {
    return votes;
  }

  votes.forEach((vote: any, index: number) => {
    for (let i = 0; i < vote.choice.length; i++) {
      if (exclusionList.includes(vote.choice[i])) {
        votes[index].choice.splice(i, 1);
      }
    }
  });

  return votes;
};

export const multiWinnerRCV = (
  votes: any,
  choices: any,
  seats: number,
  removedChoices: any
) => {
  // Check if the number of seats is greater or equal than the number of choices
  if (seats >= choices.length) {
    console.log(
      "The number of seats is greater or equal than the number of choices, all win!"
    );
    return choices;
  }

  const rounds = [];

  // Prepare Votes
  // Replace all numbers in voters with their corresponding choice name
  for (let i = 0; i < votes.length; i++) {
    let choice = [];
    for (let j = 0; j < votes[i].choice.length; j++) {
      choice.push(choices[votes[i].choice[j] - 1]);
    }
    votes[i].choice = choice;
  }

  // Remove excluded choices (because we need to recalculate)
  votes = shiftVotes(votes, removedChoices);

  // Define starting variables
  let totalVotes = 0;
  let winners = [];
  let round = 1;

  while (winners.length < seats) {
    //
    console.log(`=========================`);
    console.log(`Round ${round}`);
    console.log(`Left Choices: ${choices}`);
    console.log(`Remaining Seats: ${seats - winners.length}`);

    // Filter votes that have exhausted all choices
    votes.filter((vote: any) => vote.choice.length > 0);

    // Shift votes if have choices for candidates that already have been selected
    for (let i = 0; i < seats; i++) {
      votes = shiftVotes(votes, winners);
    }

    // Get the total votes from the first round
    if (round === 1) {
      votes.forEach((vote: any) => {
        totalVotes += vote.vp;
      });
    }
    // Calculate the threshold for the next round
    const threshold = totalVotes / (seats + 1) + 1;

    console.log(
      `Threshold for this round: ${threshold} at ${totalVotes} total votes`
    );

    // Count all votes for each choice
    let votesForChoice = [];
    choices.forEach((choice: any) => {
      votesForChoice[choice] = 0;
    });

    votes.forEach((vote: any) => {
      votesForChoice[vote.choice[0]] += vote.vp;
    });

    console.log(`Votes for each choice: `);
    console.log(votesForChoice);
    let remainingChoices = { ...votesForChoice };

    let sortedChoice = Object.keys(votesForChoice).sort(
      (a: any, b: any) => votesForChoice[b] - votesForChoice[a]
    );

    let roundResult: string;

    if (votesForChoice[sortedChoice[0]] > threshold) {
      roundResult = `${sortedChoice[0]} has reached the threshold`;
      console.log(roundResult);
      winners.push(sortedChoice[0]);
      let lastWinnerIndex = choices.indexOf(sortedChoice[0]);

      // What is the percentage of surplus votes for the last winner?
      const surplusVotes = votesForChoice[choices[lastWinnerIndex]] - threshold;
      const surplusPercentage =
        surplusVotes / votesForChoice[choices[lastWinnerIndex]];
      console.log(`Surplus votes: ${surplusVotes}`);
      console.log(`Surplus percentage: ${surplusPercentage}`);

      // Remove the winner from the votes and shift their votes
      votes.forEach((vote: any, index: number) => {
        if (vote.choice[0] === choices[lastWinnerIndex]) {
          votes[index].choice.shift();
          votes[index].vp = vote.vp * surplusPercentage;
        }
      });

      // Remove the winner from choices
      choices.splice(lastWinnerIndex, 1);
      console.log(`Choices: ${choices}`);
    } else {
      roundResult = `${sortedChoice[0]} has not reached the threshold`;
      console.log("No winner this round");
      // Remove the choice with the lowest vote count
      let sortedVotesForChoice = Object.keys(votesForChoice).sort(
        (a: any, b: any) => votesForChoice[a] - votesForChoice[b]
      );
      const lowestVote = sortedVotesForChoice[0];
      roundResult += `, ${lowestVote} with the lowest votes has been removed`;
      console.log(`Removing lowest vote: ${lowestVote}`);

      // Remove from the votes array the votes that have the lowest vote count and shift to the second choice
      votes.forEach((vote: any, index: number) => {
        if (vote.choice[0] === lowestVote) {
          votes[index].choice.shift();
        }
      });

      choices.splice(choices.indexOf(lowestVote), 1);
    }

    if (round == 100) {
      console.log("100 rounds, no winner, something went wrong");
      break;
    }

    rounds.push({
      round: round,
      remainingChoices,
      remainingSeats: seats - winners.length,
      threshold: threshold,
      roundResult,
    });

    round++;
  }

  return { winners, rounds };
};
