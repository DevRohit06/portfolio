import { gql } from "graphql-request";

export const GetGithubContributions = gql`
  query ($userName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
    user(login: $userName) {
      repositories(
        first: 1
        orderBy: { direction: DESC, field: PUSHED_AT }
        ownerAffiliations: [OWNER]
      ) {
        nodes {
          name
          pushedAt
        }
      }
      contributionsCollection(from: $fromDate, to: $toDate) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

export const GetRepoInfo = gql`
  query ($username: String!, $repositoryName: String!) {
    repository(name: $repositoryName, owner: $username) {
      id
      name
      nameWithOwner
      description
      forkCount
      stargazerCount
      openGraphImageUrl
      pushedAt
      updatedAt
      url
    }
  }
`;
