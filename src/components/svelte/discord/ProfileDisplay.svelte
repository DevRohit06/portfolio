<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import StatusIndicator from "./StatusIndicator.svelte";

  export let userData: any = null;
  export let showButtons: boolean = true;
  export let inviteCode: string = "";
  export let username: string = "";

  // Open Discord direct message in a new tab
  const openDiscordDM = () => {
    if (userData?.discord_user?.id) {
      window.open(
        `https://discord.com/users/${userData.discord_user.id}`,
        "_blank"
      );
    }
  };

  // Open Discord add friend in a new tab
  const openDiscordAddFriend = () => {
    if (userData?.discord_user?.id) {
      window.open(
        `https://discord.com/users/${userData.discord_user.id}`,
        "_blank"
      );
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
    if (userData?.discord_user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=128`;
    }

    // Default Discord avatar based on user discriminator
    const discriminator = userData?.discord_user?.discriminator || "0";
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator) % 5}.png`;
  };

  // Get display name from Discord data
  const getDisplayName = () => {
    return (
      userData?.discord_user?.global_name ||
      userData?.discord_user?.username ||
      "Discord User"
    );
  };
</script>

<div
  class="profile-header p-4 flex flex-col justify-between"
  in:fade={{ duration: 300, delay: 100 }}
>
  <div class="flex items-center w-full">
    <div class="avatar-container flex-shrink-0 relative">
      <img
        src={getAvatarUrl()}
        alt="Discord Avatar"
        class="avatar-image size-12 rounded-full object-cover border-2 border-[var(--border-color)]/30 hover:border-[var(--border-color)]/60 transition-all duration-300"
      />
      <StatusIndicator status={userData.discord_status} />
    </div>
    <div class="flex items-start justify-between w-full ml-4">
      <div class="user-info flex-1">
        <div class="flex flex-col">
          <div
            class="user-name font-semibold text-[var(--text-primary)] text-lg"
            in:slide={{ duration: 300, delay: 150 }}
          >
            {getDisplayName()}
          </div>
          {#if userData?.discord_user?.discriminator && userData?.discord_user?.discriminator !== "0"}
            <div
              class="user-tag text-xs text-[var(--text-secondary)]"
              in:slide={{ duration: 300, delay: 200 }}
            >
              {userData.discord_user.username}#{userData.discord_user
                .discriminator}
            </div>
          {:else}
            <div
              class="user-tag text-xs text-[var(--text-secondary)]"
              in:slide={{ duration: 300, delay: 200 }}
            >
              {userData.discord_user?.username || ""}
            </div>
          {/if}
        </div>
      </div>

      <div>
        {#if showButtons}
          <div
            class="action-buttons-container"
            in:slide={{ duration: 300, delay: 300 }}
          >
            <div class="flex items-center gap-2">
              <button
                class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 transition-all duration-200"
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
                class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 transition-all duration-200"
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
                  class="discord-button flex items-center gap-1 hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 transition-all duration-200"
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
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-1">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-4"
          viewBox="0 0 256 256"
        >
          <path
            fill="var(--text-secondary)"
            d="M104 140a12 12 0 1 1-12-12a12 12 0 0 1 12 12m60-12a12 12 0 1 0 12 12a12 12 0 0 0-12-12m74.45 64.9l-67 29.71a16.17 16.17 0 0 1-21.71-9.1l-8.11-22q-6.72.45-13.63.46t-13.63-.46l-8.11 22a16.18 16.18 0 0 1-21.71 9.1l-67-29.71a15.93 15.93 0 0 1-9.06-18.51L38 58a16.07 16.07 0 0 1 13-11.86l36.06-5.93a16.22 16.22 0 0 1 18.26 11.88l3.26 12.84Q118.11 64 128 64t19.4.93l3.26-12.84a16.21 16.21 0 0 1 18.26-11.88L205 46.14A16.07 16.07 0 0 1 218 58l29.53 116.38a15.93 15.93 0 0 1-9.08 18.52M232 178.28L202.47 62h-.08l-36.06-6a.17.17 0 0 0-.17 0l-2.83 11.14c5 .94 10 2.06 14.83 3.42A8 8 0 0 1 176 86.31a8 8 0 0 1-2.16-.3A172.3 172.3 0 0 0 128 80a172.3 172.3 0 0 0-45.84 6a8 8 0 1 1-4.32-15.4c4.82-1.36 9.78-2.48 14.82-3.42L89.83 56h-.12l-36.1 5.93a.2.2 0 0 0-.09 0L24 178.33L91 208a.23.23 0 0 0 .22 0L98 189.72a173 173 0 0 1-20.14-4.32a8 8 0 0 1 4.3-15.4a172 172 0 0 0 45.84 6a172 172 0 0 0 45.84-6a8 8 0 0 1 4.32 15.41a173 173 0 0 1-20.16 4.31l6.75 18.28a.22.22 0 0 0 .21 0Z"
          ></path>
        </svg>
      </div>
      <p class="text-xs font-medium text-[var(--text-secondary)]">discord</p>
    </div>
    <p class="text-[var(--text-secondary)] text-xs">
      Powered by
      <a
        class="text-[var(--accent-primary)]"
        href="https://github.com/Phineas/lanyard">Lanyard</a
      >
    </p>
  </div>
</div>

<style>
  .profile-header {
    min-height: 105px; /* Maintain consistent height for profile display */
    display: flex;
    flex-direction: column;
  }

  .avatar-container {
    position: relative;
  }

  .avatar-image {
    background-color: var(--bg-secondary);
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
