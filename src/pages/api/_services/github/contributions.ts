import { GITHUB_ACCESS_TOKEN } from "astro:env/server";
import request from "graphql-request";

import { GetGithubContributions } from "../../../../lib/graphql";
import type { GithubContributionData } from "../../../../types";

const getGithubContributions = async (): Promise<GithubContributionData> => {
  // Calculate date range (current date to one year ago)
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setFullYear(toDate.getFullYear() - 1);

  const response = await request({
    url: "https://api.github.com/graphql",
    document: GetGithubContributions,
    variables: {
      userName: "devrohit06",
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    },
    requestHeaders: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
    },
  });

  const parsedResponse = (response as any).user.contributionsCollection
    .contributionCalendar;

  return {
    lastPushedAt: (response as any).user.repositories.nodes[0].pushedAt,
    totalContributions: parsedResponse.totalContributions,
    contributions: parsedResponse.weeks.flatMap((week: any) => {
      return week.contributionDays.map((day: any) => {
        return {
          count: day.contributionCount,
          date: day.date.replace(/-/g, "/"),
        };
      });
    }),
  };
};

export default getGithubContributions;
