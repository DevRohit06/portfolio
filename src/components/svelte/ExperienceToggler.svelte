<script lang="ts">
  import { fade, fly, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  // Define the type for experience data
  interface Links {
    id: number;
    title: string;
    url: string;
  }

  interface Experience {
    id: number;
    title: string;
    role: string;
    company: string;
    duration: string;
    description: string;
    isActive?: boolean;
    links?: Links[];
  }

  // Sample data - this can be replaced with props or imported data
  let experiences: Experience[] = [
    {
      id: 1,
      title: "Fullstack Dev",
      role: "Fullstack Developer",
      company: "Qbtrix",
      duration: "DEC 2024 -  PRESENT",
      description:
        "Continuing my journey with Qbtrix, working on various projects and enhancing my skills.",
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
        "Built a complete frontend of Interacly.com, also various other projects, experimented with various technologies, and learned a lot about the industry.",
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
        "Started my professional journey with frontend development focusing on HTML, CSS, and JavaScript.",
      isActive: false,
    },
  ];

  function getFaviconUrl(url: string | URL) {
    try {
      if (!url) return "";
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(urlObj.hostname)}`;
    } catch (e) {
      return "";
    }
  }

  // Function to set active experience
  function setActiveExperience(id: number) {
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

<div class="w-[95%] sm:w-[90%] mx-auto mt-8">
  <div
    class="grid grid-cols-1 md:grid-cols-10 border border-[#7B7B7B] overflow-hidden"
    in:slide={{ duration: 800, delay: 200, easing: cubicOut }}
  >
    <!-- Left column - experience togglers -->
    <div
      class="md:col-span-5 divide-y divide-[#7B7B7B] md:border-r md:border-[#7B7B7B]"
    >
      {#each experiences as experience}
        <button
          class="w-full text-left p-4 sm:p-5 md:p-8 md:py-9 {experience.isActive
            ? 'bg-[#0000CC] text-white'
            : ' bg-[#C9CDD1]'} transition-colors duration-300"
          on:click={() => setActiveExperience(experience.id)}
        >
          <div
            class="transform {experience.isActive
              ? 'translate-x-2'
              : ''} transition-transform duration-300"
          >
            <h2 class="text-xl sm:text-2xl md:text-3xl">
              {experience.title}
            </h2>
            <p
              class="text-sm mt-2 {!experience.isActive
                ? 'text-[#7B7B7B]'
                : ''}"
            >
              {experience.role}
            </p>
          </div>
        </button>
      {/each}
    </div>

    <!-- Right column - active experience details -->
    <div
      class="md:col-span-5 bg-[#C9CDD1] p-4 sm:p-5 md:p-8 relative min-h-[220px] md:min-h-[280px]"
    >
      {#key activeExperience?.id}
        <div
          class="absolute inset-0 p-4 sm:p-5 md:p-8"
          in:fly={{
            x: animateRight ? 30 : -30,
            duration: 400,
            easing: cubicOut,
            opacity: 0,
          }}
          out:fade={{ duration: 150 }}
        >
          <div class="mb-4 mt-8 md:mt-6">
            <div
              class="inline-block bg-[#C9CDD1] text-[#7B7B7B] px-3 py-1 border border-[#7B7B7B] text-xs mb-3"
              in:fly={{ y: -10, duration: 300, delay: 150, easing: cubicOut }}
            >
              {activeExperience.duration}
            </div>
            <h3
              class="text-xl sm:text-2xl md:text-3xl mb-1 mt-4"
              in:fly={{ x: -10, duration: 300, delay: 200, easing: cubicOut }}
            >
              {activeExperience.title}
            </h3>
            <p
              class="text-sm sm:text-base text-[#7B7B7B]"
              in:fly={{ x: -10, duration: 300, delay: 250, easing: cubicOut }}
            >
              {activeExperience.company}
            </p>
          </div>

          <p
            class="text-sm sm:text-base text-[#7B7B7B] my-6"
            in:fly={{ y: 10, duration: 300, delay: 300, easing: cubicOut }}
          >
            {activeExperience.description}
          </p>
          {#if activeExperience.links}
            <div class="flex flex-wrap gap-3 mb-4">
              {#each activeExperience.links as link, i}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center text-[#0000CC] text-sm sm:text-base transition-all duration-300"
                  in:fly={{
                    y: 10,
                    duration: 300,
                    delay: 350 + i * 50,
                    easing: cubicOut,
                  }}
                >
                  <span>{link.title}</span>
                  <!-- Removed hover effect svg -->
                </a>
                {#if i < activeExperience.links.length - 1}
                  <span
                    class="text-[#7B7B7B] text-sm sm:text-base"
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
  /* Removed hover animations and pulse effects as requested */

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
