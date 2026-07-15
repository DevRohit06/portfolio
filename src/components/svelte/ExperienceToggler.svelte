<script lang="ts">
  import { fade, fly, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // Define the type for experience data

  // Sample data - this can be replaced with props or imported data
  let experiences = [
    {
      id: 1,
      title: "Full-Stack Engineer",
      role: "Full-Stack Engineer",
      company: "Qbtrix",
      duration: "DEC 2024 -  PRESENT",
      description:
        "I own frontend across several of Qbtrix's products, building most of the UI and the state management behind it, while also working on AI agents and internal tooling. That includes our ripple-iui framework (per-widget binding contracts, composite layouts, live spec sync) and soul-protocol, an open standard for portable AI identity.",
      isActive: true,
      links: [
        { id: 1, title: "Qbtrix", url: "https://qbtrix.com" },
        { id: 2, title: "Interacly", url: "https://interacly.com" },
      ],
    },
    {
      id: 2,
      title: "Full-Stack Developer Intern",
      role: "Full-Stack Developer Intern",
      company: "Qbtrix",
      duration: "DEC 2023 -  DEC 2024",
      description:
        "Where I found my groove on a real product team. I built out the frontend for Interacly and worked across the stack shipping features into production, learning how teams actually design, review, and ship software at scale.",
      isActive: false,
      links: [
        { id: 1, title: "Qbtrix", url: "https://qbtrix.com" },
        { id: 2, title: "Interacly", url: "https://interacly.com" },
      ],
    },
    {
      id: 3,
      title: "Freelance Developer",
      role: "Web Developer",
      company: "Freelance",
      duration: "2020 - 2023",
      description:
        "My first steps into the industry, building websites for local businesses with HTML, CSS, and JavaScript. Every project was equal parts terrifying and thrilling, and that's exactly how I caught the development bug that led here.",
      isActive: false,
    },
  ];

  // Function to set active experience
  function setActiveExperience(id) {
    experiences = experiences.map((exp) => ({
      ...exp,
      isActive: exp.id === id,
    }));
  }

  // Get the current active experience
  $: activeExperience =
    experiences.find((exp) => exp.isActive) || experiences[0];

  // Track previous active experience for animations
  let previousId = activeExperience?.id;
  $: {
    previousId = activeExperience?.id;
  }

  // Animation direction based on item position
  $: animateRight = activeExperience.id > previousId;
</script>

<div class="w-[95%] sm:w-[90%] mx-auto mt-6 sm:mt-8">
  <!-- Main container with better mobile structure -->
  <div
    class="flex flex-col md:grid md:grid-cols-10 border border-[var(--border-color)] overflow-hidden"
    in:slide={{ duration: 800, delay: 200, easing: cubicOut }}
  >
    <!-- Left column - experience togglers -->
    <div
      class="md:col-span-5 divide-y divide-[var(--border-color)] md:border-r md:border-[var(--border-color)]"
    >
      {#each experiences as experience, i}
        <button
          class="w-full text-left p-3 sm:p-5 md:p-8 md:py-9 {experience.isActive
            ? 'bg-[var(--accent-primary)] text-white'
            : ' bg-[var(--card-bg)]'}  {i === experiences.length - 1
            ? 'md:border-b-0 border-b border-[var(--border-color)]'
            : ''}"
          on:click={() => setActiveExperience(experience.id)}
        >
          <div
            class="transform {experience.isActive
              ? 'translate-x-1 sm:translate-x-2'
              : ''} transition-transform"
          >
            <h2 class="text-lg sm:text-xl md:text-3xl font-medium">
              {experience.title}
            </h2>
            <p
              class="text-xs sm:text-sm mt-1 sm:mt-2 {!experience.isActive
                ? 'text-[var(--text-secondary)]'
                : ''}"
            >
              {experience.role}
            </p>
          </div>
        </button>
      {/each}
    </div>

    <!-- Right column - active experience details with better mobile height -->
    <div
      class="md:col-span-5 bg-[var(--card-bg)] p-3 sm:p-5 md:p-8 relative min-h-[240px] sm:min-h-[260px] md:min-h-[280px]"
    >
      {#key activeExperience?.id}
        <div
          class="absolute inset-0 p-3 sm:p-5 md:p-8"
          in:fly={{
            x: animateRight ? 30 : -30,
            duration: 400,
            easing: cubicOut,
            opacity: 0,
          }}
          out:fade={{ duration: 150 }}
        >
          <div class="mb-2 sm:mb-4 mt-2 sm:mt-6 md:mt-6">
            <div
              class="inline-block bg-[var(--card-bg)] text-[var(--text-secondary)] px-2 sm:px-3 py-1 border border-[var(--border-color)] text-xs mb-2 sm:mb-3"
              in:fly={{ y: -10, duration: 300, delay: 150, easing: cubicOut }}
            >
              {activeExperience.duration}
            </div>
            <h3
              class="text-lg sm:text-xl md:text-3xl mb-1 mt-3 sm:mt-4 font-medium text-[var(--text-primary)]"
              in:fly={{ x: -10, duration: 300, delay: 200, easing: cubicOut }}
            >
              {activeExperience.title}
            </h3>
            <p
              class="text-xs sm:text-sm text-[var(--text-secondary)]"
              in:fly={{ x: -10, duration: 300, delay: 250, easing: cubicOut }}
            >
              {activeExperience.company}
            </p>
          </div>

          <p
            class="text-xs sm:text-sm text-[var(--text-secondary)] my-3 sm:my-6 line-clamp-4 sm:line-clamp-none"
            in:fly={{ y: 10, duration: 300, delay: 300, easing: cubicOut }}
          >
            {activeExperience.description}
          </p>
          {#if activeExperience.links}
            <div class="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-4">
              {#each activeExperience.links as link, i}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center text-[var(--accent-primary)] text-xs sm:text-sm"
                  in:fly={{
                    y: 10,
                    duration: 300,
                    delay: 350 + i * 50,
                    easing: cubicOut,
                  }}
                >
                  <span>{link.title}</span>
                </a>
                {#if i < activeExperience.links.length - 1}
                  <span
                    class="text-[var(--text-secondary)] text-xs sm:text-sm"
                    in:fly={{
                      y: 10,
                      duration: 300,
                      delay: 350 + (i + 1) * 50,
                      easing: cubicOut,
                    }}
                  >
                    /
                  </span>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/key}
    </div>
  </div>

  <!--
    SEO / LLM fallback. The interactive panel above only mounts the ACTIVE
    experience (via {#key}), so non-active roles never reach the server-rendered
    HTML. This visually-hidden list renders every role from the same
    `experiences` array (single source of truth), guaranteeing all work history
    is crawlable without JavaScript.
  -->
  <div class="sr-only">
    <h2>Work Experience</h2>
    <ul>
      {#each experiences as experience (experience.id)}
        <li>
          <h3>{experience.title} — {experience.company}</h3>
          <p>{experience.duration}</p>
          <p>{experience.description}</p>
          {#if experience.links}
            <ul>
              {#each experience.links as link (link.id)}
                <li><a href={link.url}>{link.title}</a></li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  /* Focus only on smooth transitions */
  @keyframes slideInExpand {
    0% {
      transform: translateY(-10px) scale(0.95);
      opacity: 0.7;
    }
    100% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
</style>
