<script lang="ts">
  import "../../../styles/discord.css";
  import { fade } from "svelte/transition";
  import { useDiscordActivity } from "discord-lanyard-activity/svelte";
  import {
    getMostRelevantActivity,
    calculateProgress,
  } from "discord-lanyard-activity";

  import ActivityCard from "./ActivityCard.svelte";
  import ProfileDisplay from "./ProfileDisplay.svelte";
  import LoadingSpinner from "./LoadingSpinner.svelte";
  import ErrorDisplay from "./ErrorDisplay.svelte";

  // Props
  export let userId = "743173584935190620"; // Default Discord user ID
  export let accentColor = "#0000CC"; // Match the site's accent blue color
  export let username = ""; // Discord username for add friend button
  export let inviteCode = ""; // Discord server invite code (optional)
  export let showButtons = true; // Whether to show action buttons
  export let showActivity = true; // Whether to show activity or not
  export let showAllActivities = false; // Whether to show all activities or just the first one
  export let className = ""; // Additional CSS classes

  // State variables
  let imageLoadError = false;
  let pulseAnimation = true; // Control the pulse animation
  let currentProgress = 0;

  // Multiple activities progress tracking
  let progressValues: Record<string, number> = {};
  let progressIntervals: Record<string, ReturnType<typeof setInterval>> = {};
  let progressUpdateCounter = 0;

  // Use the discord-lanyard-activity Svelte hook
  const activity = useDiscordActivity({
    userId,
  });

  // Get current activity from data
  $: currentActivity = $activity.data
    ? getMostRelevantActivity($activity.data.activities)
    : null;

  // Setup progress interval when activity changes
  $: if (currentActivity) {
    setupProgressInterval();
    imageLoadError = false;

    // Disable pulse animation after 3 seconds to save resources
    setTimeout(() => {
      pulseAnimation = false;
    }, 3000);
  }

  // Get activity color
  $: activityColor = currentActivity
    ? "var(--accent-primary)" // Using accent color for consistency
    : accentColor;

  // Calculate and update progress bar for current activity
  const setupProgressInterval = () => {
    if (
      currentActivity?.timestamps?.start &&
      currentActivity?.timestamps?.end
    ) {
      // Update immediately
      currentProgress = calculateProgress(
        currentActivity.timestamps.start,
        currentActivity.timestamps.end,
      );

      // Setup interval to update every second
      const interval = setInterval(() => {
        if (
          currentActivity?.timestamps?.start &&
          currentActivity?.timestamps?.end
        ) {
          currentProgress = calculateProgress(
            currentActivity.timestamps.start,
            currentActivity.timestamps.end,
          );

          // Clear interval when activity ends
          if (currentProgress >= 100) {
            clearInterval(interval);
          }
        }
      }, 1000);

      // Return cleanup function
      return () => clearInterval(interval);
    }
  };

  // Setup progress tracking for multiple activities
  const setupActivityProgress = (activity: any, activityId: string) => {
    if (activity?.timestamps?.start && activity?.timestamps?.end) {
      // Set initial progress value
      progressValues[activityId] = calculateProgress(
        activity.timestamps.start,
        activity.timestamps.end,
      );

      // Force reactivity update
      progressUpdateCounter++;

      // Clear any existing interval for this activity
      if (progressIntervals[activityId]) {
        clearInterval(progressIntervals[activityId]);
      }

      // Set up a new interval to update this activity's progress
      const interval = setInterval(() => {
        progressValues[activityId] = calculateProgress(
          activity.timestamps.start,
          activity.timestamps.end,
        );

        // Force reactivity update
        progressUpdateCounter++;

        // Clear interval when activity ends
        if (progressValues[activityId] >= 100) {
          clearInterval(interval);
          delete progressIntervals[activityId];
        }
      }, 1000);

      // Store the interval reference
      progressIntervals[activityId] = interval;
    }
  };

  // Get progress for a specific activity
  const getActivityProgress = (activity: any, activityId: string): number => {
    if (!activity?.timestamps?.start || !activity?.timestamps?.end) {
      return 0;
    }

    // If we have a stored progress value, use it
    if (activityId in progressValues) {
      return progressValues[activityId] || 0;
    }

    // Otherwise calculate it once
    return calculateProgress(
      activity.timestamps.start,
      activity.timestamps.end,
    );
  };

  // Watch for changes in activityData to setup progress tracking
  $: if ($activity.data?.activities && showActivity) {
    // Setup progress tracking for each activity
    $activity.data.activities.forEach((act: any, index: number) => {
      const activityId = `activity-${index}-${act.application_id || act.name || index}`;
      setupActivityProgress(act, activityId);
    });
  }

  // Create a reactive statement to force updates
  $: forceRender = progressUpdateCounter;
</script>

<div
  class="discord-activity border border-[var(--border-color)] p-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] overflow-hidden fixed-height {className}"
  class:fixed-height={!className.includes("h-")}
>
  {#if showAllActivities}
    {#if $activity.isLoading}
      <LoadingSpinner message="Loading Discord activities..." />
    {:else if $activity.error}
      <ErrorDisplay
        errorMessage={$activity.error.message}
        onRetry={activity.reconnect}
      />
    {:else if $activity.data?.activities && $activity.data.activities.length > 0}
      <!-- Using a key to force re-render when activities change -->
      {#key forceRender}
        {#each $activity.data.activities as act, index}
          {@const activityId = `activity-${index}-${act.application_id || act.name || index}`}
          <div class="">
            <ActivityCard
              activity={act}
              {activityId}
              progress={getActivityProgress(act, activityId)}
              {activityColor}
              {imageLoadError}
              {pulseAnimation}
            />
          </div>
        {/each}
      {/key}
    {:else if $activity.data}
      <ProfileDisplay
        userData={$activity.data}
        {showButtons}
        {inviteCode}
        {username}
      />
    {/if}
  {:else}
    <!-- The non-showAllActivities view (showing only the most relevant activity) -->
    {#if $activity.isLoading}
      <LoadingSpinner message="Loading Discord activity..." />
    {:else if $activity.error}
      <ErrorDisplay
        errorMessage={$activity.error.message}
        onRetry={activity.reconnect}
      />
    {:else if currentActivity}
      <ActivityCard
        activity={currentActivity}
        activityId="current-activity"
        progress={currentProgress}
        {activityColor}
        {imageLoadError}
        {pulseAnimation}
      />
    {:else if $activity.data}
      <ProfileDisplay
        userData={$activity.data}
        {showButtons}
        {inviteCode}
        {username}
      />
    {/if}
  {/if}
</div>

<style>
  .discord-activity {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
      sans-serif;
  }

  /* Fixed height container */
  .fixed-height {
    min-height: 105px;
  }
</style>
