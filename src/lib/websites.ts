// Collection of websites that can be used with the Favicon component
export type Website = {
  name: string;
  url: string;
  description?: string;
  category?: string;
};

export const websites: Record<string, Website> = {
  github: {
    name: "GitHub",
    url: "https://github.com",
    description: "Code hosting platform for version control and collaboration",
    category: "development",
  },
  stackoverflow: {
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    description: "Question and answer community for developers",
    category: "development",
  },
  devto: {
    name: "Dev.to",
    url: "https://dev.to",
    description: "Community of software developers",
    category: "community",
  },
  medium: {
    name: "Medium",
    url: "https://medium.com",
    description: "Platform for reading and writing articles",
    category: "publishing",
  },
  hashnode: {
    name: "Hashnode",
    url: "https://hashnode.com",
    description: "Blogging platform for developers",
    category: "publishing",
  },
  producthunt: {
    name: "Product Hunt",
    url: "https://producthunt.com",
    description: "Platform to discover and share new products",
    category: "product",
  },
  codepen: {
    name: "CodePen",
    url: "https://codepen.io",
    description:
      "Social development environment for front-end designers and developers",
    category: "development",
  },
  freecodecamp: {
    name: "freeCodeCamp",
    url: "https://www.freecodecamp.org",
    description: "Learn to code for free",
    category: "learning",
  },
};

// Helper function to get websites by category
export const getWebsitesByCategory = (category: string): Website[] => {
  return Object.values(websites).filter((site) => site.category === category);
};
