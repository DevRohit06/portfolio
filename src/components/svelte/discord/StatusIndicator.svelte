<script lang="ts">
  export let status: string = "offline"; // online, idle, dnd, offline
</script>

<div
  class="status-dot"
  class:status-dot-pulse={status === "online" || status === "idle"}
  class:online={status === "online"}
  class:idle={status === "idle"}
  class:dnd={status === "dnd"}
  class:offline={status === "offline" || !status}
></div>

<style>
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

  .status-dot-pulse {
    animation: status-pulse 2s infinite;
  }

  @keyframes status-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(67, 181, 129, 0.4);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(67, 181, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(67, 181, 129, 0);
    }
  }

  .status-dot.online.status-dot-pulse {
    animation: status-pulse-green 2s infinite;
  }

  .status-dot.idle.status-dot-pulse {
    animation: status-pulse-yellow 2s infinite;
  }

  @keyframes status-pulse-green {
    0% {
      box-shadow: 0 0 0 0 rgba(67, 181, 129, 0.4);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(67, 181, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(67, 181, 129, 0);
    }
  }

  @keyframes status-pulse-yellow {
    0% {
      box-shadow: 0 0 0 0 rgba(250, 166, 26, 0.4);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(250, 166, 26, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(250, 166, 26, 0);
    }
  }
</style>
