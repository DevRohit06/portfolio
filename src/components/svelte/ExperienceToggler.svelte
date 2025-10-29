<script lang="ts">
  import { fade, fly, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // Define the type for experience data

  // Sample data - this can be replaced with props or imported data
  let experiences = [
    {
      id: 1,
      title: "Fullstack Dev",
      role: "Fullstack Developer",
      company: "Qbtrix",
      duration: "DEC 2024 -  PRESENT",
      description:
        "I'm currently creating cool stuff at Qbtrix! Every day brings new challenges that push my skills to the next level. I love how each project teaches me something new about building intuitive digital experiences.",
      isActive: true,
      links: [
        { id: 1, title: "Qbtrix", url: "https://qbtrix.com" },
        { id: 2, title: "Interacly", url: "https://interacly.com" },
      ],
    },
    {
      id: 2,
      title: "Fullstack Dev",
      role: "Fullstack Developer Intern",
      company: "Qbtrix",
      duration: "DEC 2023 -  DEC 2024",
      description:
        "This was where I really found my groove! I built the entire frontend for Interacly.com (check it out!) and got to play with tons of exciting tech. Learned so much about how real teams ship amazing products together.",
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
        "My first steps into the coding world! Started with the basics - HTML, CSS, and JavaScript - building small websites for local businesses. Every project was both terrifying and thrilling, but that's how I caught the development bug!",
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
            : ' bg-[var(--card-bg)]'} transition-colors duration-300 {i ===
          experiences.length - 1
            ? 'md:border-b-0 border-b border-[var(--border-color)]'
            : ''}"
          on:click={() => setActiveExperience(experience.id)}
        >
          <div
            class="transform {experience.isActive
              ? 'translate-x-1 sm:translate-x-2'
              : ''} transition-transform duration-300"
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
                  class="flex items-center text-[var(--accent-primary)] text-xs sm:text-sm transition-all duration-300"
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
