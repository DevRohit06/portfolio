<script lang="ts">
  import { fade, fly, slide } from "svelte/transition";
  import { cubicOut, elasticOut } from "svelte/easing";

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
      title: "Fullstack Dev - Intern",
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
      console.error("Invalid URL for favicon:", url);
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

<div class="w-[90%] sm:w-[85%] md:w-[80%] lg:w-[65%] mx-auto mt-8">
  <div
    class="grid grid-cols-1 md:grid-cols-10 border border-[#7B7B7B] overflow-hidden"
    in:slide={{ duration: 800, delay: 200, easing: cubicOut }}
  >
    <!-- Left column - experience togglers -->
    <div
      class="md:col-span-4 divide-y divide-[#7B7B7B] md:border-r md:border-[#7B7B7B]"
    >
      {#each experiences as experience}
        <button
          class="w-full text-left p-4 sm:p-6 md:p-8 {experience.isActive
            ? 'bg-[#0000CC] text-white'
            : 'hover:bg-[#C9CDD1]/30'} transition-colors duration-300"
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
              class=" text-sm sm:text-base {!experience.isActive
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
      class="md:col-span-6 p-4 sm:p-6 md:p-8 relative min-h-[250px] md:min-h-[300px]"
    >
      {#key activeExperience?.id}
        <div
          class="absolute inset-0 p-4 sm:p-6 md:p-8"
          in:fly={{
            x: animateRight ? 30 : -30,
            duration: 400,
            easing: cubicOut,
            opacity: 0,
          }}
          out:fade={{ duration: 150 }}
        >
          <div class="mb-4">
            <div
              class="inline-block bg-[#C9CDD1] text-[#7B7B7B] px-4 py-1 border border-[#7B7B7B] text-xs sm:text-sm mb-3"
              in:fly={{ y: -10, duration: 300, delay: 150, easing: cubicOut }}
            >
              {activeExperience.duration}
            </div>
            <h3
              class="text-xl sm:text-2xl md:text-3xl mb-1"
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
            class="text-sm sm:text-base text-[#7B7B7B] mb-4"
            in:fly={{ y: 10, duration: 300, delay: 300, easing: cubicOut }}
          >
            {activeExperience.description}
          </p>
          {#if activeExperience.links}
            <div class="flex flex-wrap gap-4 mb-6">
              {#each activeExperience.links as link, i}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center text-[#0000CC] text-sm sm:text-base hover:underline transition-all duration-300 group"
                  in:fly={{
                    y: 10,
                    duration: 300,
                    delay: 350 + i * 50,
                    easing: cubicOut,
                  }}
                >
                  <img
                    src={getFaviconUrl(link.url)}
                    alt={link.title}
                    class="w-4 h-4 mr-2"
                  />
                  <span>{link.title}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-0 ml-0 transition-all duration-300 group-hover:w-4 group-hover:ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/key}
    </div>
  </div>
</div>

<style>
  /* Add a subtle pulse animation to the active experience */
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 0, 204, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 0, 204, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 0, 204, 0);
    }
  }

  /* Hover animation for the "Know more" link */
  a:hover svg {
    transform: translateX(4px);
  }

  .togglers-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .toggler {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #7b7b7b;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .toggler:hover {
    border-color: #0000cc;
    color: #0000cc;
  }

  .toggler.active {
    color: white;
    background-color: #0000cc;
    border-color: #0000cc;
    position: relative;
    animation: slideInExpand 0.4s ease-out forwards;
  }

  @keyframes slideInExpand {
    0% {
      transform: translateY(-10px) scale(0.95);
      opacity: 0.7;
    }
    40% {
      transform: translateY(0) scale(1.05);
    }
    100% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  /* Highlight the active toggler with a subtle glow */
  .toggler.active::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0) 70%
    );
    opacity: 0;
    mix-blend-mode: overlay;
    animation: pulseGlow 1s ease-out forwards;
  }

  @keyframes pulseGlow {
    0% {
      opacity: 0.7;
      transform: scale(0.3);
    }
    100% {
      opacity: 0;
      transform: scale(2);
    }
  }

  .experience-container {
    overflow: hidden;
  }
</style>
