<script lang="ts">
  import "../../styles/discord.css";
  import { onMount, onDestroy } from "svelte";
  import { fade, slide, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // Props
  export let userId = "743173584935190620"; // Default Discord user ID
  export let accentColor = "#0000CC"; // Match the site's accent blue color
  export let username = ""; // Discord username for add friend button
  export let inviteCode = ""; // Discord server invite code (optional)
  export let showButtons = true; // Whether to show action buttons
  export let avatarUrl = ""; // Custom avatar URL (optional)
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
  let remainingTime = "";
  let totalTime = "";

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

  // Get activity type label
  const getActivityTypeLabel = (type: number): string => {
    switch (type) {
      case ACTIVITY_TYPES.PLAYING:
        return "Playing";
      case ACTIVITY_TYPES.STREAMING:
        return "Streaming";
      case ACTIVITY_TYPES.LISTENING:
        return "Listening to";
      case ACTIVITY_TYPES.WATCHING:
        return "Watching";
      case ACTIVITY_TYPES.COMPETING:
        return "Competing in";
      default:
        return "Active on";
    }
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
        // Send identify payload after connection
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

  // Parse image URL from Discord's format with special handling for Spotify
  const parseImageUrl = (imageUrl: string, activity: any): string => {
    console.log("activity", activity);
    if (!imageUrl) return "";

    // The format from Discord is typically "spotify:albumid"
    if (imageUrl.startsWith("spotify:")) {
      const spotifyId = imageUrl.split(":").pop();
      return `https://i.scdn.co/image/${spotifyId}`;
    }
    // Handle mp:external format (for Google images, etc.)
    if (imageUrl.startsWith("mp:external")) {
      // For URLs like mp:external/44eWiHhVcx8AfXTwgTwcJP80yehaivaQnW1uVMamnGQ/https/lh3.googleusercontent.com/...
      const httpsIndex = imageUrl.indexOf("/https/");
      if (httpsIndex !== -1) {
        // Extract everything after /https/ and prepend https://
        const path = imageUrl.substring(httpsIndex + 6); // +6 to skip "/https/"

        // Use Discord's CDN for Google Images to avoid rate limiting
        return `https://media.discordapp.net/external/${imageUrl.substring(11, httpsIndex)}/https/${path}`;
      }
      return imageUrl;
    }

    // Handle standard Discord CDN URLs
    if (activity && activity.application_id) {
      return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageUrl}.png`;
    }

    return imageUrl;
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

  // Format the time remaining for a song
  const formatTimeRemaining = (start: number, end: number) => {
    if (!start || !end) return "";

    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    const remaining = end - now;

    // If no time remaining or invalid values, return empty string
    if (remaining <= 0 || total <= 0) return "";

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get activity platform icon
  const getPlatformIcon = (platform: string): string => {
    switch (platform?.toLowerCase()) {
      case "desktop":
        return "💻";
      case "mobile":
        return "📱";
      case "web":
        return "🌐";
      default:
        return "";
    }
  };

  // Get formatted elapsed time
  const getElapsedTime = (start: number): string => {
    if (!start) return "";

    const elapsed = Date.now() - start;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);

    return hours > 0 ? `${hours}h ${minutes}m elapsed` : `${minutes}m elapsed`;
  };

  // Format current time in HH:MM format
  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Create reactive time that updates every minute
  let currentTime = getCurrentTime();
  let timeInterval: ReturnType<typeof setInterval> | null = null;

  // Setup time interval
  const setupTimeInterval = () => {
    // Update immediately
    currentTime = getCurrentTime();

    // Update every minute
    timeInterval = setInterval(() => {
      currentTime = getCurrentTime();
    }, 60000); // Every minute
  };

  // Get activity color based on type
  const getActivityColor = (type: number): string => {
    // switch (type) {
    //   case ACTIVITY_TYPES.LISTENING:
    return "var(--accent-primary)"; // Spotify green
    //   case ACTIVITY_TYPES.PLAYING:
    //     return "#5865F2"; // Discord blurple
    //   case ACTIVITY_TYPES.STREAMING:
    //     return "#9146FF"; // Twitch purple
    //   case ACTIVITY_TYPES.WATCHING:
    //     return "#FF0000"; // YouTube red
    //   default:
    //     return accentColor; // Default accent color
    // }
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

  // Setup progress interval to keep the progress bar updated
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

      // Update remaining time immediately
      remainingTime = formatTimeRemaining(
        currentActivity.timestamps.start,
        currentActivity.timestamps.end
      );

      // Setup interval to update every second
      progressInterval = setInterval(() => {
        currentProgress = calculateProgress(
          currentActivity.timestamps.start,
          currentActivity.timestamps.end
        );

        // Update remaining time with each interval
        remainingTime = formatTimeRemaining(
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

  // Handle image load error
  const handleImageError = () => {
    imageLoadError = true;
  };

  // Open Discord direct message in a new tab
  const openDiscordDM = () => {
    window.open(`https://discord.com/users/${userId}`, "_blank");
  };

  // Open Discord add friend in a new tab
  const openDiscordAddFriend = () => {
    if (username) {
      window.open(`https://discord.com/users/${userId}`, "_blank");
    }
  };

  // Open Discord server invite in a new tab
  const openDiscordServer = () => {
    if (inviteCode) {
      window.open(`https://discord.gg/${inviteCode}`, "_blank");
    }
  };

  // Get Discord user avatar URL
  const getAvatarUrl = () => {
    if (avatarUrl) return avatarUrl;

    if (activityData?.discord_user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${activityData.discord_user.id}/${activityData.discord_user.avatar}.png?size=128`;
    }

    // Default Discord avatar based on user discriminator
    const discriminator = activityData?.discord_user?.discriminator || "0";
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator) % 5}.png`;
  };

  // Get display name from Discord data
  const getDisplayName = () => {
    return (
      activityData?.discord_user?.global_name ||
      activityData?.discord_user?.username ||
      "Discord User"
    );
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

  // Determine if we should show platform info
  $: totalTime = currentActivity?.timestamps?.end
    ? new Date(currentActivity.timestamps.end).toLocaleTimeString([], {
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  // Get activity color
  $: activityColor = currentActivity
    ? getActivityColor(currentActivity.type)
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

    if (timeInterval) {
      clearInterval(timeInterval);
    }
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
    setupTimeInterval();

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

{#if showAllActivities}
  {#if activityData?.activities && activityData.activities.length > 0}
    <!-- Using a key to force re-render when activities change -->
    {#key forceRender}
      {#each activityData.activities as activity, index}
        {@const activityId = `activity-${index}-${activity.application_id || activity.name || index}`}
        <div
          class="discord-activity border border-[var(--border-color)] p-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-300 overflow-hidden fixed-height mb-2"
        >
          {#if loading}
            <div class="loading-container" in:fade={{ duration: 300 }}>
              <div class="loading-spinner"></div>
              <p class="text-[var(--text-secondary)]">
                Loading Discord activity...
              </p>
            </div>
          {:else if error}
            <div class="error-container" in:fade={{ duration: 300 }}>
              <p class="text-[var(--text-secondary)]">{error}</p>
              <button
                on:click={connectWebSocket}
                class="retry-button mt-2 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5"
              >
                Retry
              </button>
            </div>
          {:else}
            <!-- Activity Display -->
            <div
              class="activity-card p-4"
              in:fade={{ duration: 400, delay: 100 }}
            >
              <div class="flex items-start">
                <!-- Activity image -->
                <div class="relative min-w-[56px]">
                  {#if activity.assets?.large_image && !imageLoadError}
                    <div
                      class="activity-image-wrapper"
                      style="--activity-color: {getActivityColor(
                        activity.type
                      )}"
                    >
                      <img
                        src={parseImageUrl(
                          activity.assets.large_image,
                          activity
                        )}
                        alt={activity.assets?.large_text || "Activity Image"}
                        class="size-18 {pulseAnimation ? 'pulse' : ''}"
                        on:error={handleImageError}
                      />
                    </div>
                  {:else}
                    <!-- Placeholder for missing or failed images -->
                    <div
                      class="activity-placeholder"
                      style="--activity-color: {getActivityColor(
                        activity.type
                      )}"
                    >
                      <span>
                        {#if activity.type === ACTIVITY_TYPES.LISTENING}
                          ♪
                        {:else if activity.type === ACTIVITY_TYPES.PLAYING}
                          {activity.name?.charAt(0) || "?"}
                        {:else if activity.type === ACTIVITY_TYPES.WATCHING}
                          📺
                        {:else if activity.type === ACTIVITY_TYPES.STREAMING}
                          🎥
                        {:else}
                          🏆
                        {/if}
                      </span>
                    </div>
                  {/if}
                </div>

                <!-- Activity details -->
                <div class="ml-3 flex-1 min-w-0">
                  <div
                    class="activity-label flex items-center gap-3 whitespace-nowrap"
                    in:slide={{ duration: 300, delay: 200 }}
                  >
                    {getActivityTypeLabel(activity.type)}
                    {#if activityData?.spotify || activity.application_id === "463151177836658699"}
                      <div
                        class="service-badge whitespace-nowrap"
                        in:fade={{ duration: 400, delay: 500 }}
                      >
                        {#if activityData?.spotify && activity.type === ACTIVITY_TYPES.LISTENING}
                          <img
                            src="https://open.spotify.com/favicon.ico"
                            alt="Spotify"
                            class="service-icon"
                          />
                          <span class="service-name">Spotify</span>
                        {:else if activity.application_id === "463151177836658699"}
                          <img
                            src="https://music.youtube.com/favicon.ico"
                            alt="YouTube Music"
                            class="service-icon"
                          />
                          <span class="service-name">YouTube Music</span>
                        {/if}
                      </div>
                    {/if}
                  </div>

                  <div
                    class="activity-title"
                    in:slide={{ duration: 300, delay: 250 }}
                  >
                    {activity.type === ACTIVITY_TYPES.LISTENING
                      ? activity.details || "Unknown Track"
                      : activity.name || "Unknown Activity"}
                  </div>

                  <div
                    class="activity-subtitle"
                    in:slide={{ duration: 300, delay: 300 }}
                  >
                    {#if activity.type === ACTIVITY_TYPES.LISTENING}
                      {activity.state || "Unknown Artist"}
                    {:else if activity.type === ACTIVITY_TYPES.PLAYING}
                      <p>
                        {activity.details || ""}
                        {activity.state ? `- ${activity.state}` : ""}
                      </p>
                    {:else if activity.state}
                      {activity.state}
                    {/if}
                  </div>

                  <!-- Progress bar with enhanced styling -->
                  {#if activity.timestamps?.start && activity.timestamps?.end}
                    <div
                      class="progress-container"
                      in:slide={{ duration: 300, delay: 400 }}
                    >
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          style="width: {getActivityProgress(
                            activity,
                            activityId
                          )}%; background-color: {getActivityColor(
                            activity.type
                          )}"
                        ></div>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    {/key}
  {:else if activityData}
    <!-- Show user profile when no activities are present -->
    <div
      class="discord-activity border border-[var(--border-color)] p-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-300 overflow-hidden fixed-height"
    >
      <div class="profile-header p-4 flex items-center">
        <div class="avatar-container flex-shrink-0 relative">
          <img
            src={getAvatarUrl()}
            alt="Discord Avatar"
            class="avatar-image w-12 h-12 rounded-full object-cover border border-[var(--border-color)]/40"
          />
          <div
            class="status-dot"
            class:online={activityData.discord_status === "online"}
            class:idle={activityData.discord_status === "idle"}
            class:dnd={activityData.discord_status === "dnd"}
            class:offline={activityData.discord_status === "offline" ||
              !activityData.discord_status}
          ></div>
        </div>
        <div class="flex items-center justify-between w-full">
          <div class="user-info ml-3 flex-1">
            <div class="flex items-center justify-between">
              <div>
                <div class="user-name font-medium text-[var(--text-primary)]">
                  {getDisplayName()}
                </div>
                {#if activityData?.discord_user?.discriminator && activityData?.discord_user?.discriminator !== "0"}
                  <div class="user-tag text-xs text-[var(--text-secondary)]">
                    {activityData.discord_user.username}#{activityData
                      .discord_user.discriminator}
                  </div>
                {:else}
                  <div class="user-tag text-xs text-[var(--text-secondary)]">
                    {activityData.discord_user?.username || ""}
                  </div>
                {/if}
              </div>
            </div>
          </div>
          <div>
            {#if showButtons}
              <div
                class="action-buttons-container"
                in:slide={{ duration: 300, delay: 500 }}
              >
                <div class="flex items-center gap-2">
                  <button
                    class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 transition-colors duration-200"
                    on:click={openDiscordDM}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#5865F2"
                    >
                      <path
                        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
                      />
                      <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                    </svg>
                    <span>Message</span>
                  </button>

                  <button
                    class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 transition-colors duration-200"
                    on:click={openDiscordAddFriend}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#5865F2"
                    >
                      <path
                        d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      />
                    </svg>
                    <span>Add</span>
                  </button>

                  {#if inviteCode}
                    <button
                      class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 transition-colors duration-200"
                      on:click={openDiscordServer}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="#5865F2"
                      >
                        <path
                          d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"
                        />
                      </svg>
                      <span>Join Server</span>
                    </button>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
{:else}
  <!-- The non-showActivity view can remain as is since it's already designed to show one activity -->
  <div
    class="discord-activity border border-[var(--border-color)] p-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-300 overflow-hidden fixed-height"
  >
    {#if loading}
      <div class="loading-container" in:fade={{ duration: 300 }}>
        <div class="loading-spinner"></div>
        <p class="text-[var(--text-secondary)]">Loading Discord activity...</p>
      </div>
    {:else if error}
      <div class="error-container" in:fade={{ duration: 300 }}>
        <p class="text-[var(--text-secondary)]">{error}</p>
        <button
          on:click={connectWebSocket}
          class="retry-button mt-2 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5"
        >
          Retry
        </button>
      </div>
    {:else}
      <!-- User Profile Header -->

      <!-- Activity Display -->
      {#if currentActivity}
        <div class="activity-card p-4" in:fade={{ duration: 400, delay: 100 }}>
          <div class="flex items-start">
            <!-- Activity image -->
            <div class="relative min-w-[56px]">
              {#if currentActivity.assets?.large_image && !imageLoadError}
                <div
                  class="activity-image-wrapper"
                  style="--activity-color: {activityColor}"
                >
                  <img
                    src={parseImageUrl(
                      currentActivity.assets.large_image,
                      currentActivity
                    )}
                    alt={currentActivity.assets?.large_text || "Activity Image"}
                    class="size-18 {pulseAnimation ? 'pulse' : ''}"
                    on:error={handleImageError}
                  />
                </div>
              {:else}
                <!-- Placeholder for missing or failed images -->
                <div
                  class="activity-placeholder"
                  style="--activity-color: {activityColor}"
                >
                  <span>
                    {#if currentActivity.type === ACTIVITY_TYPES.LISTENING}
                      ♪
                    {:else if currentActivity.type === ACTIVITY_TYPES.PLAYING}
                      {currentActivity.name?.charAt(0) || "?"}
                    {:else if currentActivity.type === ACTIVITY_TYPES.WATCHING}
                      📺
                    {:else if currentActivity.type === ACTIVITY_TYPES.STREAMING}
                      🎥
                    {:else}
                      🏆
                    {/if}
                  </span>
                </div>
              {/if}
            </div>

            <!-- Activity details -->
            <div class="ml-3 flex-1 min-w-0">
              <div
                class="activity-label flex items-center gap-3 whitespace-nowrap"
                in:slide={{ duration: 300, delay: 200 }}
              >
                {getActivityTypeLabel(currentActivity.type)}
                {#if activityData?.spotify || currentActivity.application_id === "463151177836658699"}
                  <div
                    class="service-badge whitespace-nowrap"
                    in:fade={{ duration: 400, delay: 500 }}
                  >
                    {#if activityData?.spotify}
                      <img
                        src="https://open.spotify.com/favicon.ico"
                        alt="Spotify"
                        class="service-icon"
                      />
                      <span class="service-name">Spotify</span>
                    {:else if currentActivity.application_id === "463151177836658699"}
                      <img
                        src="https://music.youtube.com/favicon.ico"
                        alt="YouTube Music"
                        class="service-icon"
                      />
                      <span class="service-name">YouTube Music</span>
                    {/if}
                  </div>
                {/if}
              </div>

              <div
                class="activity-title"
                in:slide={{ duration: 300, delay: 250 }}
              >
                {currentActivity.type === ACTIVITY_TYPES.LISTENING
                  ? currentActivity.details || "Unknown Track"
                  : currentActivity.name || "Unknown Activity"}
              </div>

              <div
                class="activity-subtitle"
                in:slide={{ duration: 300, delay: 300 }}
              >
                {#if currentActivity.type === ACTIVITY_TYPES.LISTENING}
                  {currentActivity.state || "Unknown Artist"}
                {:else if currentActivity.type === ACTIVITY_TYPES.PLAYING}
                  <p>
                    {currentActivity.details || ""} - {currentActivity.state}
                  </p>
                  <!-- {currentActivity.state || "Unknown Game"} -->
                {:else if currentActivity.state}
                  {currentActivity.state}
                {/if}
              </div>

              <!-- Progress bar with enhanced styling -->
              {#if currentActivity.timestamps?.start && currentActivity.timestamps?.end}
                <div
                  class="progress-container"
                  in:slide={{ duration: 300, delay: 400 }}
                >
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      style="width: {currentProgress}%; background-color: {activityColor}"
                    ></div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {:else if activityData}
        <div class="profile-header p-4 flex items-center">
          <div class="avatar-container flex-shrink-0 relative">
            <img
              src={getAvatarUrl()}
              alt="Discord Avatar"
              class="avatar-image w-12 h-12 rounded-full object-cover border border-[var(--border-color)]/40"
            />
            <div
              class="status-dot"
              class:online={activityData.discord_status === "online"}
              class:idle={activityData.discord_status === "idle"}
              class:dnd={activityData.discord_status === "dnd"}
              class:offline={activityData.discord_status === "offline" ||
                !activityData.discord_status}
            ></div>
          </div>
          <div class="flex items-center justify-between w-full">
            <div class="user-info ml-3 flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <div class="user-name font-medium text-[var(--text-primary)]">
                    {getDisplayName()}
                  </div>
                  {#if activityData?.discord_user?.discriminator && activityData?.discord_user?.discriminator !== "0"}
                    <div class="user-tag text-xs text-[var(--text-secondary)]">
                      {activityData.discord_user.username}#{activityData
                        .discord_user.discriminator}
                    </div>
                  {:else}
                    <div class="user-tag text-xs text-[var(--text-secondary)]">
                      {activityData.discord_user?.username || ""}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            <div>
              {#if showButtons}
                <div
                  class="action-buttons-container"
                  in:slide={{ duration: 300, delay: 500 }}
                >
                  <div class="flex items-center gap-2">
                    <button
                      class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 transition-colors duration-200"
                      on:click={openDiscordDM}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#5865F2"
                      >
                        <path
                          d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"
                        />
                        <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                      </svg>
                      <span>Message</span>
                    </button>

                    <button
                      class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 transition-colors duration-200"
                      on:click={openDiscordAddFriend}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#5865F2"
                      >
                        <path
                          d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        />
                      </svg>
                      <span>Add</span>
                    </button>

                    {#if inviteCode}
                      <button
                        class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 transition-colors duration-200"
                        on:click={openDiscordServer}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="#5865F2"
                        >
                          <path
                            d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"
                          />
                        </svg>
                        <span>Join Server</span>
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>
          <!-- Action Buttons -->
        </div>
      {/if}
    {/if}
  </div>
{/if}

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

  /* Loading and error states */
  .loading-container,
  .error-container,
  .no-activity {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 105px; /* Maintain minimum height for these states */
    text-align: center;
    padding: 16px;
  }

  .loading-spinner {
    border: 2px solid var(--border-color-alpha);
    border-top: 2px solid var(--border-color);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Profile styles */
  .avatar-container {
    position: relative;
  }

  .status-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--bg-secondary);
  }

  .status-dot.online {
    background-color: #43b581;
  }
  .status-dot.idle {
    background-color: #faa61a;
  }
  .status-dot.dnd {
    background-color: #f04747;
  }
  .status-dot.offline {
    background-color: #747f8d;
  }

  /* Activity image styles */

  @keyframes pulse-subtle {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }

  .activity-placeholder {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--card-bg);
    color: var(--text-secondary);
    font-size: 20px;
    font-weight: bold;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }

  .activity-card {
    min-height: 105px; /* Maintain consistent height for activity display */
  }

  .profile-header {
    min-height: 105px; /* Maintain consistent height for profile display */
    display: flex;
    align-items: center;
  }

  /* Activity text styles */
  .activity-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
  }

  .activity-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .activity-title:hover {
    overflow: visible;
    white-space: nowrap;
    animation: scroll-text 8s linear infinite;
  }

  .activity-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .activity-subtitle:hover {
    overflow: visible;
    white-space: nowrap;
  }

  @keyframes scroll-text {
    0% {
      transform: translateX(0);
    }
    30% {
      transform: translateX(0);
    }
    80% {
      transform: translateX(calc(-100% + 100px));
    }
    100% {
      transform: translateX(0);
    }
  }

  /* Progress bar */
  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: var(--border-color-alpha);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 6px;
  }

  .progress-fill {
    height: 100%;
    transition: width 1s linear;
    border-radius: 2px;
  }

  /* Service badges */
  .service-badge {
    display: flex;
    align-items: center;
  }

  .service-icon {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }

  .service-name {
    font-size: 11px;
    color: var(--text-secondary);
  }

  /* Discord buttons */
  .discord-button {
    padding: 6px 12px;
    background-color: transparent;
    border: 1px solid rgba(88, 101, 242, 0.3);
    border-radius: 4px;
    color: #5865f2;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .discord-button:hover {
    border-color: rgba(88, 101, 242, 0.6);
  }

  .discord-button:active {
    transform: translateY(1px);
  }

  .discord-button svg {
    flex-shrink: 0;
  }
</style>
