export const proposal = (id: string) => {
  return `query Proposal {
        proposal(id:"${id}") {
            title
            choices
            start
            end
            type
            votes
            space {
              id
              name
            }
        }
      }
    `;
};
