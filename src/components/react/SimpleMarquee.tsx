import React, { useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface SimpleMarqueeProps {
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  reverse?: boolean;
  children: React.ReactNode;
}

export function SimpleMarquee({
  className,
  speed = 40,
  pauseOnHover = false,
  reverse = false,
  children
}: SimpleMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !innerRef.current || !cloneRef.current) return;
    
    // Clone the content for seamless looping
    cloneRef.current.innerHTML = innerRef.current.innerHTML;
    
    // Set up animation
    const animate = () => {
      if (!containerRef.current || !innerRef.current) return;
      
      const scrollSpeed = speed * 0.05; // Adjust speed factor
      const direction = reverse ? -1 : 1;
      
      // Get the width of the content
      const contentWidth = innerRef.current.offsetWidth;
      
      // Create animation
      let currentPos = 0;
      const scroll = () => {
        if (pausedRef.current) return;
        currentPos += scrollSpeed * direction;
        
        // Reset position for seamless loop
        if (Math.abs(currentPos) >= contentWidth) {
          currentPos = 0;
        }
        
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(${currentPos}px)`;
        }
        
        requestAnimationFrame(scroll);
      };
      
      // Start animation
      const animationId = requestAnimationFrame(scroll);
      
      return () => cancelAnimationFrame(animationId);
    };
    
    const animation = animate();
    return () => {
      if (animation) animation();
    };
  }, [speed, reverse]);
  
  // Handle pause on hover
  const pausedRef = useRef(false);
  
  const handleMouseEnter = () => {
    if (pauseOnHover) pausedRef.current = true;
  };
  
  const handleMouseLeave = () => {
    if (pauseOnHover) pausedRef.current = false;
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={containerRef}
        className="flex whitespace-nowrap"
      >
        <div ref={innerRef} className="flex">
          {children}
        </div>
        <div ref={cloneRef} className="flex"></div>
      </div>
    </div>
  );
}
