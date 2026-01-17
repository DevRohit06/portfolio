<script lang="ts">
  import { onMount } from "svelte";

  export let siteKey: string;
  export let compact: boolean = false;

  let name = "";
  let email = "";
  let subject = "";
  let message = "";
  let turnstileToken = "";
  let turnstileWidgetId: string | null = null;

  let isSubmitting = false;
  let submitStatus: "idle" | "success" | "error" = "idle";
  let errorMessage = "";

  let turnstileContainer: HTMLDivElement;
  let turnstileLoaded = false;
  let useCompactTurnstile = false;

  function loadTurnstile() {
    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      renderTurnstile();
    };
    document.head.appendChild(script);
  }

  function renderTurnstile() {
    if (!window.turnstile || !turnstileContainer || turnstileLoaded) return;

    turnstileLoaded = true;

    // Use compact size on small screens
    const isSmallScreen = window.innerWidth < 400;

    turnstileWidgetId = window.turnstile.render(turnstileContainer, {
      sitekey: siteKey,
      size: isSmallScreen ? "compact" : "normal",
      callback: (token: string) => {
        turnstileToken = token;
      },
      "expired-callback": () => {
        turnstileToken = "";
      },
      "error-callback": () => {
        turnstileToken = "";
        errorMessage = "CAPTCHA error. Please refresh and try again.";
      },
      theme: document.documentElement.classList.contains("dark-theme")
        ? "dark"
        : "light",
    });

    // Listen for theme changes
    document.addEventListener("themeChanged", updateTurnstileTheme);
  }

  function updateTurnstileTheme() {
    if (window.turnstile && turnstileWidgetId) {
      // Reset turnstile to apply new theme
      window.turnstile.reset(turnstileWidgetId);
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!turnstileToken) {
      errorMessage = "Please complete the CAPTCHA verification";
      return;
    }

    isSubmitting = true;
    submitStatus = "idle";
    errorMessage = "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      submitStatus = "success";
      // Reset form
      name = "";
      email = "";
      subject = "";
      message = "";

      // Reset turnstile
      if (window.turnstile && turnstileWidgetId) {
        window.turnstile.reset(turnstileWidgetId);
      }
      turnstileToken = "";
    } catch (err) {
      submitStatus = "error";
      errorMessage = err instanceof Error ? err.message : "Something went wrong";
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    loadTurnstile();

    return () => {
      document.removeEventListener("themeChanged", updateTurnstileTheme);
      if (window.turnstile && turnstileWidgetId) {
        window.turnstile.remove(turnstileWidgetId);
      }
    };
  });
</script>

<form
  on:submit={handleSubmit}
  class="contact-form"
  class:compact
>
  <div class="form-row" class:stacked={!compact}>
    <div class="form-group">
      <label for="name">Name</label>
      <input
        type="text"
        id="name"
        bind:value={name}
        required
        placeholder="Your name"
        disabled={isSubmitting}
      />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        required
        placeholder="your@email.com"
        disabled={isSubmitting}
      />
    </div>
  </div>

  <div class="form-group">
    <label for="subject">Subject</label>
    <input
      type="text"
      id="subject"
      bind:value={subject}
      required
      placeholder="What's this about?"
      disabled={isSubmitting}
    />
  </div>

  <div class="form-group">
    <label for="message">Message</label>
    <textarea
      id="message"
      bind:value={message}
      required
      placeholder="Your message..."
      rows={compact ? 4 : 6}
      disabled={isSubmitting}
    ></textarea>
  </div>

  <div class="turnstile-wrapper">
    <div bind:this={turnstileContainer}></div>
  </div>

  {#if submitStatus === "success"}
    <div class="status-message success">
      Message sent successfully! I'll get back to you soon.
    </div>
  {/if}

  {#if submitStatus === "error" || errorMessage}
    <div class="status-message error">
      {errorMessage || "Failed to send message. Please try again."}
    </div>
  {/if}

  <button type="submit" class="submit-btn" disabled={isSubmitting || !turnstileToken}>
    {#if isSubmitting}
      <span class="spinner"></span>
      Sending...
    {:else}
      Send Message
    {/if}
  </button>
</form>

<style>
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .contact-form.compact {
    gap: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-row.stacked {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  input,
  textarea {
    padding: 0.75rem 1rem;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.9375rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.15);
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }

  input:disabled,
  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .turnstile-wrapper {
    display: flex;
    justify-content: flex-start;
    max-width: 100%;
    overflow: hidden;
  }

  /* Scale down turnstile on very small screens */
  @media (max-width: 340px) {
    .turnstile-wrapper {
      transform: scale(0.85);
      transform-origin: left center;
    }
  }

  .status-message {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .status-message.success {
    background-color: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .status-message.error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
    align-self: flex-start;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: var(--accent-secondary);
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
