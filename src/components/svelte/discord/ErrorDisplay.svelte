<script lang="ts">
  export let errorMessage: string =
    "Failed to connect to Discord activity service";
  export let onRetry: () => void;
</script>

<div class="error-container">
  <p class="text-[var(--text-secondary)]">{errorMessage}</p>
  <button
    on:click={onRetry}
    class="retry-button mt-2 text-sm text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5"
  >
    Retry
  </button>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 105px;
    text-align: center;
    padding: 16px;
  }

  .retry-button {
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 4px;
    border: none;
    background: transparent;
  }
</style>
