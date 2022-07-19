import { proposal } from "./proposal";
import { votes } from "./votes";

const API_URL = "https://hub.snapshot.org/graphql";

const wrappedFetch = async (query: string) => {
  return await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  }).then((res) => res.json());
};

export const getProposal = async (id: string) => {
  return (await wrappedFetch(proposal(id))).data.proposal;
};

export const getVotes = async (id: string) => {
  return (await wrappedFetch(votes(id))).data.votes;
};
