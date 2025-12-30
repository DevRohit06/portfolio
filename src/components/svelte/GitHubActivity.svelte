<!-- filepath: e:\Codes\portfolio\src\components\svelte\GitHubActivity.svelte -->
<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import { fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // Props
  export let title = "GITHUB ACTIVITY";
  export let weeks = 30; // Number of weeks to display
  export let cellSize = 13; // Size of each cell in pixels
  export let cellSpacing = 2; // Spacing between cells in pixels
  export let cellRadius = 2; // Border radius of cells
  export let contributionLevels = [
    "rgba(180, 180, 180, 0.2)", // Level 0 (no contributions)
    "rgba(220, 220, 220, 0.8)", // Level 1 (few contributions)
    "rgba(200, 200, 200, 0.9)", // Level 2 (some contributions)
    "rgba(180, 180, 180, 1)", // Level 3 (many contributions)
    "rgba(150, 150, 150, 1)", // Level 4 (lots of contributions)
  ];
  export let backgroundLevel = "rgba(85, 85, 85, 0.2)"; // Background color for cells
  export let lastPushedDate = new Date(); // Last pushed date
  export let activityData: number[][] = []; // Data for the graph
  export let showTooltip = false; // Whether to show tooltip on hover
  export let enableInteraction = false; // Whether to enable hover/click interactions
  export let username = "devrohit06"; // GitHub username
  export let loadRealData = true; // Whether to load real data from GitHub

  // Local variables
  let graphEl: HTMLElement;
  let days = 7; // Days per week
  let today = new Date();
  let tooltipVisible = false;
  let tooltipContent = "";
  let tooltipX = 0;
  let tooltipY = 0;
  let loading = true;
  let error = false;
  let totalContributions = 0;
  let errorMessage = "";

  // Format date as "Day, Month Day Year"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate random contribution data if none provided
  const generateData = () => {
    let data = [];
    for (let w = 0; w < weeks; w++) {
      let weekData = [];
      for (let d = 0; d < days; d++) {
        // Generate a random contribution level (0-4)
        // Higher probability of 0 and 1 to mimic real GitHub activity patterns
        const rand = Math.random();
        let level;
        if (rand < 0.6)
          level = 0; // 60% chance of no activity
        else if (rand < 0.8)
          level = 1; // 20% chance of level 1
        else if (rand < 0.9)
          level = 2; // 10% chance of level 2
        else if (rand < 0.97)
          level = 3; // 7% chance of level 3
        else level = 4; // 3% chance of level 4

        weekData.push(level);
      }
      data.push(weekData);
    }
    return data;
  };

  // Fetch GitHub contribution data
  const fetchGitHubContributions = async (username: string) => {
    try {
      loading = true;
      error = false;

      // Using GitHub's GraphQL API to get contribution data
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();

      // Check if today's data is in the response
      const todayStr = new Date().toISOString().split("T")[0];
      const todayData = data.contributions.find(
        (c: { date: string }) => c.date === todayStr,
      );

      // Update last pushed date if available
      if (data.contributions && data.contributions.length > 0) {
        // Find the most recent contribution with count > 0
        const recentContributions = [...data.contributions]
          .filter((c) => c.count > 0)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        if (recentContributions.length > 0) {
          lastPushedDate = new Date(recentContributions[0].date);
        }
      }

      // Process the data into our format
      totalContributions = data.contributions.reduce(
        (sum: any, day: { count: any }) => sum + (day.count || 0),
        0,
      );

      // Format the data for our grid display
      const processedData = processContributionData(data.contributions);
      activityData = processedData;

      loading = false;
    } catch (err) {
      console.error("Error fetching GitHub data:", err);
      error = true;
      errorMessage = (err as Error).message || "Failed to load GitHub data";
      loading = false;
    }
  };

  // Process the GitHub contribution data into our grid format
  const processContributionData = (contributions: any) => {
    const result = [];

    // First, organize contributions by week and day
    // We want the most recent weeks at the end of our array
    const contributionsByDate = new Map();
    const today = new Date();

    // Create a date object for the start date (weeks * 7 days ago)
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeks * 7);

    // Initialize the map with all dates in our range
    for (let i = 1; i < weeks * 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      contributionsByDate.set(dateStr, { level: 0, count: 0 });
    }

    // Fill in the actual contributions
    for (const contribution of contributions) {
      const dateStr = contribution.date;
      if (contributionsByDate.has(dateStr)) {
        contributionsByDate.set(dateStr, {
          level:
            typeof contribution.level === "number" ? contribution.level : 0,
          count: contribution.count || 0,
        });
      }
    }

    // Create weeks array from the map
    let currentWeek = [];
    let weekCount = 0;

    // Convert to array, sorted by date
    const sortedDates = Array.from(contributionsByDate.keys()).sort();

    for (const dateStr of sortedDates) {
      const contribData = contributionsByDate.get(dateStr);

      // Calculate level if not provided directly
      let level = contribData.level;

      currentWeek.push(level);

      // When we complete 7 days, push the week
      if (currentWeek.length === 7) {
        result.push([...currentWeek]);
        currentWeek = [];
        weekCount++;

        // Stop if we've collected enough weeks
        if (weekCount >= weeks) break;
      }
    }

    // If we have a partial week at the end, pad and push it
    if (currentWeek.length > 0 && currentWeek.length < 7) {
      while (currentWeek.length < 7) {
        currentWeek.push(0);
      }
      result.push(currentWeek);
    }

    return result;
  };

  // Handle tooltip
  const handleCellHover = (
    event: MouseEvent,
    w: number,
    d: number,
    level: number,
  ) => {
    if (!enableInteraction || !showTooltip) return;

    // Get the actual date for this cell
    const today = new Date();
    const totalDays = weeks * 7;
    const daysFromStart = w * 7 + d;
    const daysAgo = totalDays - daysFromStart - 1;

    const cellDate = new Date();
    cellDate.setDate(cellDate.getDate() - daysAgo);

    const formattedDate = formatDate(cellDate);
    const contributions =
      level === 0
        ? "No contributions"
        : level === 1
          ? "1-2 contributions"
          : level === 2
            ? "3-5 contributions"
            : level === 3
              ? "6-9 contributions"
              : "10+ contributions";

    tooltipContent = `${formattedDate}: ${contributions}`;
    tooltipVisible = true;
    tooltipX = event.clientX + 10;
    tooltipY = event.clientY + 10;
  };

  const handleCellLeave = () => {
    tooltipVisible = false;
  };

  // Initialize or update data when component mounts or props change
  onMount(async () => {
    if (loadRealData) {
      await fetchGitHubContributions(username);
    }
  });
</script>

<div class="github-activity-wrapper">
  <div
    class="activity-graph-container"
    bind:this={graphEl}
    in:fade={{ duration: 600, easing: cubicOut }}
  >
    {#if loading}
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading GitHub activity...</p>
      </div>
    {:else if error}
      <div class="error-container">
        <p>Failed to load GitHub activity.</p>
        <p class="error-message">{errorMessage}</p>
        <button
          on:click={() => fetchGitHubContributions(username)}
          class="retry-button">Retry</button
        >
      </div>
    {:else}
      <div
        class="activity-graph"
        style="--cell-size: {cellSize}px; --cell-spacing: {cellSpacing}px; --cell-radius: {cellRadius}px;"
      >
        {#each activityData as week, w}
          <div class="week">
            {#each week as day, d}
              <div
                class="day"
                style="background-color: {day === 0
                  ? backgroundLevel
                  : contributionLevels[day]}"
                on:mouseover={(e) => handleCellHover(e, w, d, day)}
                on:mouseout={handleCellLeave}
              ></div>
            {/each}
          </div>
        {/each}
      </div>

      {#if tooltipVisible}
        <div class="tooltip" style="left: {tooltipX}px; top: {tooltipY}px;">
          {tooltipContent}
        </div>
      {/if}
    {/if}
  </div>

  <div class="last-pushed">
    Last Pushed on {formatDate(lastPushedDate)}
  </div>
</div>

<style>
  .github-activity-wrapper {
    border-radius: 6px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
      sans-serif;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #24292e;
  }

  .activity-title {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .username {
    color: #0366d6;
    text-decoration: none;
    font-size: 13px;
    transition: text-decoration 0.3s ease-in-out;
  }

  .username:hover {
    text-decoration: underline;
  }

  .activity-graph-container {
    position: relative;
    margin: 10px 0;
    min-height: 100px;
  }

  .activity-graph {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    gap: var(--cell-spacing);
  }

  .week {
    display: flex;
    flex-direction: column;
    gap: var(--cell-spacing);
  }

  .day {
    width: var(--cell-size);
    height: var(--cell-size);

    border-radius: var(--cell-radius);
    transition:
      transform 0.3s ease-in-out,
      opacity 0.3s ease-in-out;
  }

  .tooltip {
    position: fixed;
    background-color: #24292e;
    color: white;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 3px 12px rgba(27, 31, 35, 0.15);
  }

  .last-pushed {
    margin-top: 8px;
    font-size: 12px;
    color: #57606a;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    text-align: center;
  }

  .loading-spinner {
    border: 3px solid #eee;
    border-top: 3px solid #24292e;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error-message {
    color: #cb2431;
    font-size: 12px;
    margin: 4px 0 12px 0;
  }

  .retry-button {
    padding: 6px 12px;
    background-color: #24292e;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
  }

  .retry-button:hover {
    background-color: #444d56;
  }

  /* Add some interaction if enabled */
  :global(.interactive) .day:hover {
    transform: scale(1.1);
    cursor: pointer;
  }
</style>
