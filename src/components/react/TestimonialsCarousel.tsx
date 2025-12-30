import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { cn } from "../../lib/utils";

interface Testimonial {
  content: string;
  name: string;
  position: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  delayMs?: number;
  className?: string;
}

export function TestimonialsCarousel({
  testimonials,
  autoPlay = true,
  delayMs = 8000,
  className,
}: TestimonialsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  // Initialize Embla Carousel with AutoScroll plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
    },
    autoPlay
      ? [
          AutoScroll({
            speed: 0,
            startDelay: delayMs,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            playOnInit: true,
          }),
        ]
      : []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        // Reset auto-scroll timer when manually navigating
        if (autoPlay && emblaApi.plugins().autoScroll) {
          emblaApi.plugins().autoScroll.reset();
        }
      }
    },
    [emblaApi, autoPlay]
  );

  return (
    <div
      className={cn(
        "w-full h-full border border-[var(--border-color)] p-4 flex flex-col max-w-full overflow-hidden",
        className
      )}
    >
      <div className="w-full">
        <div className="overflow-hidden w-full" ref={emblaRef}>
          <div className="flex w-full">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-fit p-2 box-border">
                <div className="w-full">
                  <p className="text-base leading-relaxed text-[var(--text-secondary)] mb-6 font-mono">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-[36px] h-[36px] rounded-full mr-3 flex items-center justify-center text-base font-bold bg-transparent border border-[var(--border-color)]">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base font-medium m-0 text-[var(--text-primary)]">
                        {testimonial.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] m-0">
                        {testimonial.position}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full border border-[var(--border-color)] p-0 cursor-pointer  ",
              index === selectedIndex
                ? "bg-[var(--accent-primary)]"
                : "bg-transparent"
            )}
            onClick={() => scrollTo(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
