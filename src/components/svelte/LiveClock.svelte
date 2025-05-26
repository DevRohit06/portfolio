<script>
  import { onMount, onDestroy } from "svelte";

  let time = new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let interval;

  onMount(() => {
    interval = setInterval(() => {
      time = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<span class=" tabular-nums">{time} IST</span>
