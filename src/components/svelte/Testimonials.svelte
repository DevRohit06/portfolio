<script>
  import { onMount, onDestroy } from "svelte";
  import { fade, fly } from "svelte/transition";

  // Array of testimonials
  const testimonials = [
    {
      content:
        "Your portfolio showcases not just skills, but a passion for clean, innovative solutions. The attention to detail is remarkable.",
      name: "Alex Chen",
      position: "Tech Lead",
    },
    {
      content:
        "Working with you was a game-changer for our project. Your technical knowledge and collaborative approach made all the difference.",
      name: "Priya Sharma",
      position: "Project Manager",
    },
    {
      content:
        "A Testimonial will be here with person name not one but 3 Testimonial ofc it will be big but you should definitely add it.",
      name: "Aasam Jain",
      position: "Whatever",
    },
  ];

  let currentIndex = 0;
  let interval;

  // Function to go to specific testimonial
  const goToTestimonial = (index) => {
    currentIndex = index;
    resetInterval();
  };

  // Function to go to next testimonial
  const nextTestimonial = () => {
    currentIndex = (currentIndex + 1) % testimonials.length;
  };

  // Function to reset interval timer
  const resetInterval = () => {
    clearInterval(interval);
    startInterval();
  };

  // Function to start interval timer
  const startInterval = () => {
    interval = setInterval(() => {
      nextTestimonial();
    }, 8000); // Change testimonial every 8 seconds
  };

  onMount(() => {
    startInterval();
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div
  class="w-full h-full relative border border-[#7B7B7B] p-4 flex flex-col bg-[#C9CDD1]/10"
>
  <div class=" flex-grow flex items-start justify-center">
    {#each testimonials as testimonial, i}
      {#if i === currentIndex}
        <div
          class="w-full"
          in:fly={{ y: 10, duration: 400, delay: 200 }}
          out:fade={{ duration: 200 }}
        >
          <p class="text-base leading-relaxed text-[#7B7B7B]/80 mb-6 font-mono">
            "{testimonial.content}"
          </p>
          <div class="flex items-center">
            <div
              class="w-[36px] h-[36px] rounded-full mr-3 flex items-center justify-center text-base font-bold bg-transparent border border-[#7B7B7B]"
            >
              {testimonial.name.charAt(0)}
            </div>
            <div class="text-left">
              <h3 class="text-base font-medium m-0 text-black">
                {testimonial.name}
              </h3>
              <p class="text-xs text-[#7B7B7B] m-0">{testimonial.position}</p>
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <div class="mt-4 flex justify-center gap-2">
    {#each testimonials as _, i}
      <button
        class="w-2 h-2 rounded-full border border-[#7B7B7B] p-0 cursor-pointer {i ===
        currentIndex
          ? 'bg-[#0000CC]'
          : 'bg-transparent'}"
        on:click={() => goToTestimonial(i)}
        aria-label={`Go to testimonial ${i + 1}`}
      ></button>
    {/each}
  </div>
</div>
