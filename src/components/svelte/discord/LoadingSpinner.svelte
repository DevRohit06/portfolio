<script lang="ts">
  export let message: string = "Loading Discord activity...";
</script>

<div class="loading-container">
  <div class="loading-spinner"></div>
  <p class="text-[var(--text-secondary)]">{message}</p>
</div>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 105px;
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
</style>
