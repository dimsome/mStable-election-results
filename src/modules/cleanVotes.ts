export const cleanVotes = (votes: any, choices: Number) => {
  // Remove votes that have more choices than available
  let cleanedVotes = votes.filter((vote: any) => vote.choice.length <= choices);
  // Remove with voting power 0
  cleanedVotes = cleanedVotes.filter((vote: any) => vote.vp > 0);
  console.log(cleanedVotes.length);
  // Remove double casted votes, leave the most recent one
  for (let i = 0; i < cleanedVotes.length; i++) {
    const vote = cleanedVotes[i];
    for (let j = i + 1; j < cleanedVotes.length; j++) {
      const otherVote = cleanedVotes[j];
      if (vote.voter === otherVote.voter) {
        if (vote.created < otherVote.created) {
          cleanedVotes.splice(i, 1);
        } else {
          cleanedVotes.splice(j, 1);
        }
      }
    }
  }

  return cleanedVotes;
};
