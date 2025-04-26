import React, { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { cn } from "../../lib/utils";
import { type ComponentPropsWithoutRef } from "react";

interface MarqueeCarouselProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Speed of the auto-scroll
   * @default 1
   */
  speed?: number;
}

export function MarqueeCarousel({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  speed = 1,
  ...props
}: MarqueeCarouselProps) {
  // Initialize Embla Carousel with AutoScroll plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: "start",
    },
    [
      AutoScroll({
        speed: 2, // Increased speed for visibility
        direction: "forward",
      }),
    ]
  );

  // Log when the component mounts to verify it's working
  useEffect(() => {
    if (emblaApi) {
      console.log('MarqueeCarousel mounted with AutoScroll plugin');
    }
  }, [emblaApi]);

  return (
    <div
      {...props}
      className={cn("overflow-hidden", className)}
      ref={emblaRef}
    >
      <div className="flex items-center">{children}</div>
    </div>
  );
}

interface TestimonialCarouselProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Content to be displayed in the carousel
   */
  children: React.ReactNode;
  /**
   * Whether to auto-play the testimonials
   * @default true
   */
  autoplay?: boolean;
  /**
   * Delay between slides in milliseconds
   * @default 5000
   */
  delay?: number;
}

export function TestimonialCarousel({
  className,
  children,
  autoplay = true,
  delay = 5000,
  ...props
}: TestimonialCarouselProps) {
  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
    },
    autoplay
      ? [AutoScroll({ speed: 0, startDelay: delay, stopOnInteraction: true })]
      : []
  );

  return (
    <div {...props} className={cn("overflow-hidden", className)} ref={emblaRef}>
      <div className="flex">{children}</div>
    </div>
  );
}
