<script lang="ts">
  import "../../../styles/discord.css";
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";

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

  // State variables
  let isConnected = false;
  let reconnectAttempts = 0;
  let maxReconnectAttempts = 5;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let ws: WebSocket | null = null;
  let activityData: any = null;
  let error: string | null = null;
  let loading = true;
  let imageLoadError = false;
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let currentProgress = 0;
  let pulseAnimation = true; // Control the pulse animation

  // Multiple activities progress tracking - use plain object for better reactivity
  let progressValues: Record<string, number> = {};
  let progressIntervals: Record<string, ReturnType<typeof setInterval>> = {};

  // Force reactivity updates
  let progressUpdateCounter = 0;

  // Discord activity types
  const ACTIVITY_TYPES = {
    PLAYING: 0,
    STREAMING: 1,
    LISTENING: 2,
    WATCHING: 3,
    CUSTOM: 4,
    COMPETING: 5,
  };

  // Lanyard WebSocket connection
  const connectWebSocket = () => {
    loading = true;
    error = null;

    // Close existing connection if any
    if (ws) {
      ws.close();
    }

    try {
      // Connect to Lanyard WebSocket API
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      // WebSocket event handlers
      ws.onopen = () => {
        isConnected = true;
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onclose = (event) => {
        isConnected = false;
        handleDisconnect();
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnected = false;
      };
    } catch (err) {
      console.error("Failed to connect to Lanyard WebSocket:", err);
      error = "Failed to connect to Discord activity service";
      loading = false;
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    // Handle different opcodes based on Lanyard API documentation
    switch (data.op) {
      case 1: // Hello
        // Respond with identify payload
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              op: 2, // Initialize/Identify opcode
              d: {
                subscribe_to_id: userId,
              },
            })
          );
        }

        // Set up heartbeat interval
        if (data.d && data.d.heartbeat_interval) {
          setupHeartbeat(data.d.heartbeat_interval);
        }
        break;

      case 0: // Event
        // Handle different event types
        if (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE") {
          // Update activity data
          activityData = data.d;
          loading = false;
        }
        break;

      default:
        break;
    }
  };

  // Setup heartbeat interval
  const setupHeartbeat = (interval: number) => {
    const heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ op: 3 })); // Heartbeat opcode
      } else {
        clearInterval(heartbeatInterval);
      }
    }, interval);

    // Clean up interval on component destruction
    return () => clearInterval(heartbeatInterval);
  };

  // Handle disconnection and reconnect if needed
  const handleDisconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      reconnectTimeout = setTimeout(() => {
        connectWebSocket();
      }, delay);
    } else {
      error =
        "Couldn't connect to Discord activity service after multiple attempts";
      loading = false;
    }
  };

  // Calculate and update progress bar for current activity
  const calculateProgress = (start: number, end: number): number => {
    if (!start || !end) return 0;

    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;

    // Return progress as percentage (0-100)
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  // Setup progress tracking for multiple activities
  const setupActivityProgress = (activity: any, activityId: string) => {
    if (activity?.timestamps?.start && activity?.timestamps?.end) {
      // Set initial progress value
      progressValues[activityId] = calculateProgress(
        activity.timestamps.start,
        activity.timestamps.end
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
          activity.timestamps.end
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
      activity.timestamps.end
    );
  };

  // Setup progress interval for the current activity
  const setupProgressInterval = () => {
    // Clear any existing interval
    if (progressInterval) clearInterval(progressInterval);

    // Only setup interval if we have an activity with timestamps
    if (
      currentActivity?.timestamps?.start &&
      currentActivity?.timestamps?.end
    ) {
      // Update immediately
      currentProgress = calculateProgress(
        currentActivity.timestamps.start,
        currentActivity.timestamps.end
      );

      // Setup interval to update every second
      progressInterval = setInterval(() => {
        currentProgress = calculateProgress(
          currentActivity.timestamps.start,
          currentActivity.timestamps.end
        );

        // Clear interval when activity ends
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 1000);
    }
  };

  // Find the most relevant activity to display
  $: currentActivity = activityData?.activities?.length
    ? activityData.activities.sort((a: any, b: any) => {
        // Prioritize listening activities (music) if present
        if (
          a.type === ACTIVITY_TYPES.LISTENING &&
          b.type !== ACTIVITY_TYPES.LISTENING
        )
          return -1;
        if (
          b.type === ACTIVITY_TYPES.LISTENING &&
          a.type !== ACTIVITY_TYPES.LISTENING
        )
          return 1;

        // Then prioritize playing games
        if (
          a.type === ACTIVITY_TYPES.PLAYING &&
          b.type !== ACTIVITY_TYPES.PLAYING
        )
          return -1;
        if (
          b.type === ACTIVITY_TYPES.PLAYING &&
          a.type !== ACTIVITY_TYPES.PLAYING
        )
          return 1;

        return 0;
      })[0]
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

  // Cleanup function
  const cleanup = () => {
    if (ws) {
      ws.close();
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Clear all progress intervals for multiple activities
    Object.values(progressIntervals).forEach((interval) => {
      clearInterval(interval);
    });

    progressIntervals = {};
  };

  // Watch for changes in activityData to setup progress tracking
  $: if (activityData?.activities && showActivity) {
    // Setup progress tracking for each activity
    activityData.activities.forEach((activity: any, index: number) => {
      const activityId = `activity-${index}-${activity.application_id || activity.name || index}`;
      setupActivityProgress(activity, activityId);
    });
  }

  // Create a reactive statement to force updates
  $: forceRender = progressUpdateCounter;

  onMount(() => {
    connectWebSocket();

    // Listen for theme changes
    const handleThemeChange = () => {
      // Force refresh of status dot borders and other elements that might need updating
      if (activityData) {
        activityData = { ...activityData };
      }
    };

    document.addEventListener("themeChanged", handleThemeChange);

    // Return cleanup function
    return () => {
      cleanup();
      document.removeEventListener("themeChanged", handleThemeChange);
    };
  });

  onDestroy(cleanup);
</script>

<div
  class="discord-activity border border-[var(--border-color)] p-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-300 overflow-hidden fixed-height"
>
  {#if showAllActivities}
    {#if loading}
      <LoadingSpinner message="Loading Discord activities..." />
    {:else if error}
      <ErrorDisplay errorMessage={error} onRetry={connectWebSocket} />
    {:else if activityData?.activities && activityData.activities.length > 0}
      <!-- Using a key to force re-render when activities change -->
      {#key forceRender}
        {#each activityData.activities as activity, index}
          {@const activityId = `activity-${index}-${activity.application_id || activity.name || index}`}
          <div class="mb-2">
            <ActivityCard
              {activity}
              {activityId}
              progress={getActivityProgress(activity, activityId)}
              {activityColor}
              {imageLoadError}
              {pulseAnimation}
            />
          </div>
        {/each}
      {/key}
    {:else if activityData}
      <ProfileDisplay
        userData={activityData}
        {showButtons}
        {inviteCode}
        {username}
      />
    {/if}
  {:else}
    <!-- The non-showAllActivities view (showing only the most relevant activity) -->
    {#if loading}
      <LoadingSpinner message="Loading Discord activity..." />
    {:else if error}
      <ErrorDisplay errorMessage={error} onRetry={connectWebSocket} />
    {:else if currentActivity}
      <ActivityCard
        activity={currentActivity}
        activityId="current-activity"
        progress={currentProgress}
        {activityColor}
        {imageLoadError}
        {pulseAnimation}
      />
    {:else if activityData}
      <ProfileDisplay
        userData={activityData}
        {showButtons}
        {inviteCode}
        {username}
      />
    {/if}
  {/if}
</div>

<style>
  .discord-activity {
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
      sans-serif;
  }

  /* Fixed height container */
  .fixed-height {
    min-height: 105px;
  }
</style>
