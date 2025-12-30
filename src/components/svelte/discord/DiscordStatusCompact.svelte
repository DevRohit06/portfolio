<script lang="ts">
    import { useDiscordActivity } from "discord-lanyard-activity/svelte";
    import {
        getActivityTypeLabel,
        getAvatarUrl,
        parseImageUrl,
    } from "discord-lanyard-activity";
    export let userId = "743173584935190620";

    const activity = useDiscordActivity({ userId });

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "online":
                return "#23a55a";
            case "idle":
                return "#f0b232";
            case "dnd":
                return "#f23f43";
            default:
                return "#80848e";
        }
    };

    // Get avatar URL
    $: avatarUrl = $activity.data?.discord_user
        ? getAvatarUrl(
              $activity.data.discord_user.id,
              $activity.data.discord_user.avatar,
              $activity.data.discord_user.discriminator,
          )
        : "";

    $: statusColor = $activity.data
        ? getStatusColor($activity.data.discord_status)
        : "#80848e";
    $: statusText = $activity.data?.discord_status || "offline";

    // Get current activity (prioritize Spotify/listening)
    $: currentActivity = $activity.data?.listening_to_spotify
        ? null // We'll use spotify data instead
        : $activity.data?.activities?.find((a) => a.type !== 4) || null; // Exclude custom status

    // Spotify data
    $: spotify = $activity.data?.spotify;
    $: isListening = $activity.data?.listening_to_spotify && spotify;

    // Activity image
    $: activityImage = (() => {
        if (isListening && spotify?.album_art_url) {
            return spotify.album_art_url;
        }
        if (currentActivity?.assets?.large_image) {
            return parseImageUrl(
                currentActivity.assets.large_image,
                currentActivity,
            );
        }
        return null;
    })();

    // Activity info
    $: activityName = (() => {
        if (isListening && spotify) {
            return spotify.song;
        }
        if (currentActivity) {
            return currentActivity.details || currentActivity.name;
        }
        return null;
    })();

    $: activityDetails = (() => {
        if (isListening && spotify) {
            return `by ${spotify.artist}`;
        }
        if (currentActivity?.state) {
            return currentActivity.state;
        }
        return null;
    })();

    $: activityLabel = (() => {
        if (isListening) {
            return "Listening to Spotify";
        }
        if (currentActivity) {
            return getActivityTypeLabel(currentActivity.type);
        }
        return null;
    })();

    let imageError = false;
</script>

<a
    href="https://discord.com/users/{userId}"
    target="_blank"
    rel="noopener noreferrer"
    class="discord-compact pl-1"
    title={activityName || `Discord: ${statusText}`}
>
    <!-- Activity/Album Image or Avatar -->
    <div class="image-wrapper">
        {#if $activity.isLoading}
            <div class="image-placeholder"></div>
        {:else if activityImage && !imageError}
            <img
                src={activityImage}
                alt={activityName || "Activity"}
                class="activity-image"
                on:error={() => (imageError = true)}
            />
        {:else if avatarUrl}
            <img src={avatarUrl} alt="Discord" class="avatar-image" />
        {:else}
            <div class="image-placeholder"></div>
        {/if}
        <span class="status-dot" style="background-color: {statusColor}"></span>
    </div>

    <!-- Activity Info -->
    <div class="info">
        {#if activityLabel}
            <span class="activity-label">{activityLabel}</span>
        {:else}
            <span class="status-label">{statusText}</span>
        {/if}

        {#if activityName}
            <span class="activity-name">{activityName}</span>
        {:else if $activity.data?.discord_user}
            <span class="username">
                <svg
                    class="discord-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                    />
                </svg>
                {$activity.data.discord_user.global_name ||
                    $activity.data.discord_user.username}
            </span>
        {/if}

        {#if activityDetails}
            <span class="activity-details">{activityDetails}</span>
        {/if}
    </div>
</a>

<style>
    .discord-compact {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: var(--text-secondary);

        border: 1px solid transparent;
    }

    .image-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .activity-image {
        width: 40px;
        height: 40px;
        object-fit: cover;
    }

    .avatar-image {
        width: 40px;
        height: 40px;
        object-fit: cover;
    }

    .image-placeholder {
        width: 40px;
        height: 40px;
        background: var(--bg-tertiary, #e5e5e5);
    }

    .status-dot {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 3px solid var(--bg-secondary, #fff);
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 0;
        line-height: 1.3;
        min-width: 0;
        flex: 1;
    }

    .status-label {
        font-size: 11px;
        text-transform: capitalize;
        color: var(--text-secondary);
    }

    .activity-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary);
        opacity: 0.8;
    }

    .activity-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .activity-details {
        font-size: 11px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .username {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 12px;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .discord-icon {
        width: 12px;
        height: 12px;
        flex-shrink: 0;
        color: #5865f2;
    }

    /* Responsive styles */
    @media (max-width: 1024px) {
        .activity-image,
        .avatar-image,
        .image-placeholder {
            width: 44px;
            height: 44px;
        }

        .activity-name {
            font-size: 12px;
        }

        .activity-details {
            font-size: 10px;
        }
    }

    @media (max-width: 768px) {
        .discord-compact {
            gap: 0.5rem;
        }

        .activity-image,
        .avatar-image,
        .image-placeholder {
            width: 40px;
            height: 40px;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            border-width: 2px;
        }

        .activity-label,
        .status-label {
            font-size: 9px;
        }

        .activity-name {
            font-size: 11px;
        }

        .activity-details {
            font-size: 10px;
        }

        .username {
            font-size: 11px;
        }

        .discord-icon {
            width: 11px;
            height: 11px;
        }
    }

    @media (max-width: 480px) {
        .discord-compact {
            gap: 0.5rem;
        }

        .activity-image,
        .avatar-image,
        .image-placeholder {
            width: 40px;
            height: 40px;
        }

        .status-dot {
            width: 10px;
            height: 10px;
        }

        .activity-label,
        .status-label {
            font-size: 9px;
        }

        .activity-name {
            font-size: 11px;
        }

        .activity-details {
            font-size: 10px;
        }

        .username {
            font-size: 11px;
        }

        .discord-icon {
            width: 10px;
            height: 10px;
        }
    }
</style>
