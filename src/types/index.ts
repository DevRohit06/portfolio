export interface GithubContributionDay {
  count: number
  date: string
}

export interface GithubContributionData {
  lastPushedAt: number
  totalContributions: number
  contributions: GithubContributionDay[]
}

export interface GithubRepositoryLastUpdated {
  name: string
  description: string
  forkCount: number
  stargazerCount: number
  url: string
  pushedAt: string
  updatedAt: string
}

export type MonkeyTypeLanguage = 'indonesian' | 'english'

export interface MonkeyTypeData {
  acc: number
  consistency: number
  language: MonkeyTypeLanguage
  wpm: number
  time: number
}
