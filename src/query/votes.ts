export const votes = (id: string) => {
  return `query Votes {
        votes (
          first: 1000
          where: {
            proposal: "${id}"
          }
        ) {
          id
          voter
          created
          choice
          vp
        }
      }
    `;
};
