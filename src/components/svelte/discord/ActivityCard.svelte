<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import {
    getActivityTypeLabel,
    parseImageUrl,
    detectMusicService,
    type DiscordActivity,
  } from "discord-lanyard-activity";

  export let activity: DiscordActivity | null = null;
  export let activityId: string;
  export let progress: number = 0;
  export let activityColor: string = "var(--accent-primary)";
  export let imageLoadError: boolean = false;
  export let pulseAnimation: boolean = true;

  // Discord activity types
  const ACTIVITY_TYPES = {
    PLAYING: 0,
    STREAMING: 1,
    LISTENING: 2,
    WATCHING: 3,
    CUSTOM: 4,
    COMPETING: 5,
  };

  // Handle image load error
  const handleImageError = () => {
    imageLoadError = true;
  };

  // Get the detected music service
  $: musicService = activity ? detectMusicService(activity) : null;
</script>

<div class="activity-card p-4" in:fade={{ duration: 400, delay: 100 }}>
  <div class="flex items-start">
    <!-- Activity image -->
    <div class="relative min-w-[56px]">
      {#if activity?.assets?.large_image && !imageLoadError}
        <div
          class="activity-image-wrapper relative"
          style="--activity-color: {activityColor}"
        >
          <img
            src={parseImageUrl(activity.assets.large_image, activity)}
            alt={activity.assets?.large_text || "Activity Image"}
            class="size-18 {pulseAnimation ? 'pulse' : ''}"
            on:error={handleImageError}
          />
          {#if activity.assets?.small_image}
            <div class="absolute bottom-1 right-0">
              <img
                src={parseImageUrl(activity.assets.small_image, activity)}
                alt={activity.assets?.small_text || "Activity Image"}
                class="size-4"
                on:error={handleImageError}
              />
            </div>
          {/if}
        </div>
      {:else}
        <!-- Placeholder for missing or failed images -->
        <div
          class="activity-placeholder"
          style="--activity-color: {activityColor}"
        >
          <span>
            {#if activity?.type === ACTIVITY_TYPES.LISTENING}
              ♪
            {:else if activity?.type === ACTIVITY_TYPES.PLAYING}
              {activity?.name?.charAt(0) || "?"}
            {:else if activity?.type === ACTIVITY_TYPES.WATCHING}
              📺
            {:else if activity?.type === ACTIVITY_TYPES.STREAMING}
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
        {activity ? getActivityTypeLabel(activity.type) : "Active on"}
        {#if musicService}
          <div
            class="service-badge whitespace-nowrap"
            in:fade={{ duration: 400, delay: 500 }}
          >
            <img
              src={musicService.icon}
              alt={musicService.name}
              class="service-icon"
              on:error={() => {
                // Fallback to a generic music icon if service icon fails to load
                if (musicService) {
                  musicService.icon =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'/%3E%3C/svg%3E";
                }
              }}
            />
            <span class="service-name">{musicService.name}</span>
          </div>
        {/if}
      </div>

      <div class="activity-title" in:slide={{ duration: 300, delay: 250 }}>
        {activity?.type === ACTIVITY_TYPES.LISTENING
          ? activity.details || "Unknown Track"
          : activity?.name || "Unknown Activity"}
      </div>

      <div class="activity-subtitle" in:slide={{ duration: 300, delay: 300 }}>
        {#if activity?.type === ACTIVITY_TYPES.LISTENING}
          {activity.state || "Unknown Artist"}
        {:else if activity?.type === ACTIVITY_TYPES.PLAYING}
          <p>
            {activity.details || ""}
            {activity.state ? `- ${activity.state}` : ""}
          </p>
        {:else if activity?.state}
          {activity.state}
        {/if}
      </div>

      <!-- Progress bar with enhanced styling -->
      {#if activity?.timestamps?.start && activity?.timestamps?.end}
        <div
          class="progress-container"
          in:slide={{ duration: 300, delay: 400 }}
        >
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {progress}%; background-color: {activityColor}"
            ></div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Activity image styles */
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
    padding: 2px 6px;
    background-color: var(--bg-tertiary, rgba(0, 0, 0, 0.1));
    border-radius: 8px;
    border: 1px solid var(--border-color-alpha);
  }

  .service-icon {
    width: 14px;
    height: 14px;
    margin-right: 6px;
    border-radius: 2px;
  }

  .service-name {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }
</style>
