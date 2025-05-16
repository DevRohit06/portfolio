// animations.js - Enhanced GSAP animation utilities for award-winning animations

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Cleanup all GSAP animations and ScrollTriggers
 * Call this function during page navigation to prevent animations from getting stuck
 */
export function cleanupGSAPAnimations() {
  // Kill all GSAP animations
  gsap.killTweensOf("*");

  // Kill and clear all ScrollTrigger instances
  ScrollTrigger.getAll().forEach((st) => st.kill());
  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.killAll();
  // Clear any queued callbacks
  gsap.globalTimeline.clear();

  console.log("GSAP animations cleaned up");
}

// Make cleanup function available globally for navigation events
if (typeof window !== "undefined") {
  window.cleanupGSAPAnimations = cleanupGSAPAnimations;
}

/**
 * Standard fade-in animation from bottom with enhanced ScrollTrigger
 */
export function fadeInUp(elements, options = {}) {
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: elements,
      start: "top 85%",
      end: "top 50%",
      toggleActions: "play none none reset",
      markers: false,
    },
  };

  const settings = { ...defaults, ...options };

  // Set initial state
  gsap.set(elements, {
    y: settings.y,
    opacity: 0,
  });

  return gsap.to(elements, {
    y: 0,
    opacity: 1,
    duration: settings.duration,
    stagger: settings.stagger,
    ease: settings.ease,
    scrollTrigger: settings.scrollTrigger,
  });
}

/**
 * Fade in animation from left with enhanced ScrollTrigger
 */
export function fadeInLeft(elements, options = {}) {
  const defaults = {
    x: -50,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: elements,
      start: "top 85%",
      end: "top 50%",
      toggleActions: "play none none reset",
      markers: false,
    },
  };

  const settings = { ...defaults, ...options };

  // Set initial state
  gsap.set(elements, {
    x: settings.x,
    opacity: 0,
  });

  return gsap.to(elements, {
    x: 0,
    opacity: 1,
    duration: settings.duration,
    stagger: settings.stagger,
    ease: settings.ease,
    scrollTrigger: settings.scrollTrigger,
  });
}

/**
 * Fade in animation from right with enhanced ScrollTrigger
 */
export function fadeInRight(elements, options = {}) {
  const defaults = {
    x: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: elements,
      start: "top 85%",
      end: "top 50%",
      toggleActions: "play none none reset",
      markers: false,
    },
  };

  const settings = { ...defaults, ...options };

  // Set initial state
  gsap.set(elements, {
    x: settings.x,
    opacity: 0,
  });

  return gsap.to(elements, {
    x: 0,
    opacity: 1,
    duration: settings.duration,
    stagger: settings.stagger,
    ease: settings.ease,
    scrollTrigger: settings.scrollTrigger,
  });
}

/**
 * Scale in animation with enhanced ScrollTrigger
 */
export function scaleIn(elements, options = {}) {
  const defaults = {
    scale: 0.8,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: elements,
      start: "top 85%",
      end: "top 50%",
      toggleActions: "play none none reset",
      markers: false,
    },
  };

  const settings = { ...defaults, ...options };

  // Set initial state
  gsap.set(elements, {
    scale: settings.scale,
    opacity: 0,
  });

  return gsap.to(elements, {
    scale: 1,
    opacity: 1,
    duration: settings.duration,
    stagger: settings.stagger,
    ease: settings.ease,
    scrollTrigger: settings.scrollTrigger,
  });
}

/**
 * Create a parallax scrolling effect for an element
 * @param {String|Element} element Element to create parallax effect on
 * @param {Number} speed Parallax speed factor (positive = slower, negative = faster)
 */
export function createParallax(element, speed = 0.5, options = {}) {
  const defaults = {
    trigger: element,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    markers: false,
  };

  const settings = { ...defaults, ...options };

  return ScrollTrigger.create({
    trigger: settings.trigger,
    start: settings.start,
    end: settings.end,
    scrub: settings.scrub,
    markers: settings.markers,
    onUpdate: (self) => {
      const yPos = self.progress * -speed * 100;
      gsap.to(element, {
        y: yPos,
        ease: "none",
        overwrite: "auto",
      });
    },
  });
}

/**
 * Create a horizontal scroll section with scroll-driven animations
 * @param {String|Element} container The container element
 * @param {String|NodeList} panels The panels to animate horizontally
 */
export function createHorizontalScroll(container, panels) {
  let scrollTween = gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      end: () => "+=" + container.offsetWidth,
      invalidateOnRefresh: true,
    },
  });

  return scrollTween;
}

/**
 * Creates a scroll-linked text reveal effect
 * @param {String|Element} element The text element to reveal
 */
export function scrollTextReveal(element, options = {}) {
  const defaults = {
    start: "top 80%",
    end: "top 30%",
    scrub: true,
    markers: false,
  };

  const settings = { ...defaults, ...options };

  // Split text into characters and wrap in spans
  if (typeof element === "string") element = document.querySelector(element);
  if (!element) return;

  let text = element.textContent;
  element.textContent = "";

  let chars = text.split("");
  chars.forEach((char) => {
    let span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.opacity = "0";
    span.style.transform = "translateY(20px)";
    span.textContent = char === " " ? "\u00A0" : char; // Use non-breaking space for spaces
    element.appendChild(span);
  });

  // Create scroll-linked animation
  gsap.to(element.children, {
    opacity: 1,
    y: 0,
    stagger: 0.02,
    scrollTrigger: {
      trigger: element,
      start: settings.start,
      end: settings.end,
      scrub: settings.scrub,
      markers: settings.markers,
    },
  });
}

/**
 * Create a scroll-triggered scene with multiple synchronized animations
 * @param {String|Element} trigger The element that triggers the scene
 * @param {Array} animations Array of animation objects with element and props
 */
export function createScene(trigger, animations, options = {}) {
  const defaults = {
    start: "top 80%",
    end: "top 20%",
    scrub: true,
    markers: false,
  };

  const settings = { ...defaults, ...options };

  // Create the main timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: settings.start,
      end: settings.end,
      scrub: settings.scrub,
      markers: settings.markers,
    },
  });

  // Add animations to the timeline
  animations.forEach((anim, index) => {
    if (anim.element && anim.props) {
      tl.to(
        anim.element,
        {
          ...anim.props,
          ease: anim.ease || "power2.inOut",
        },
        anim.position || index * 0.1
      );
    }
  });

  return tl;
}

/**
 * Create a magnetic hover effect for interactive elements
 * @param {String|Element} elements Elements to apply magnetic effect to
 */
export function createMagneticEffect(elements, strength = 0.5) {
  const items =
    typeof elements === "string"
      ? document.querySelectorAll(elements)
      : elements;

  items.forEach((item) => {
    item.addEventListener("mousemove", (e) => {
      const bounds = item.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      const moveX = (e.clientX - centerX) * strength;
      const moveY = (e.clientY - centerY) * strength;

      gsap.to(item, {
        x: moveX,
        y: moveY,
        duration: 0.3,
        ease: "power3.out",
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(item, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });
}

/**
 * Create a smooth section transition effect
 * @param {String|Element} section The section element
 */
export function createSectionTransition(section, options = {}) {
  const defaults = {
    clipPath: true,
    parallax: true,
  };

  const settings = { ...defaults, ...options };

  if (settings.clipPath) {
    gsap.set(section, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    });

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      end: "top 20%",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const clipPathValue = `polygon(0% ${100 - progress * 100}%, 100% ${
          100 - progress * 100
        }%, 100% 100%, 0% 100%)`;
        gsap.to(section, {
          clipPath: clipPathValue,
          ease: "none",
          overwrite: "auto",
        });
      },
    });
  }

  if (settings.parallax) {
    const elements = section.querySelectorAll("[data-parallax]");
    elements.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      createParallax(el, speed);
    });
  }
}

/**
 * Floating animation (subtle up and down)
 */
export function floatingAnimation(elements, options = {}) {
  const defaults = {
    y: 15,
    duration: 2,
    repeatDelay: 0.5,
    ease: "sine.inOut",
  };

  const settings = { ...defaults, ...options };

  return gsap.to(elements, {
    y: settings.y,
    duration: settings.duration,
    repeat: -1,
    yoyo: true,
    ease: settings.ease,
    repeatDelay: settings.repeatDelay,
  });
}

/**
 * Create a smooth scroll animation between sections
 */
export function initSmoothScrolling() {
  // Find all links that navigate to a section
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: targetElement,
          offsetY: 50,
        },
        ease: "power3.inOut",
      });
    });
  });
}

/**
 * Animate text transition between two states (e.g., Menu ↔ Close)
 * Perfect for toggle buttons in navigation
 * @param {Element} element - The button element containing the text
 * @param {string} startText - Initial text state (e.g., "Menu")
 * @param {string} endText - Target text state (e.g., "Close")
 * @param {boolean} isReversing - Whether to animate from endText to startText
 * @param {Object} options - Animation options
 * @returns {Object} - GSAP timeline for the animation
 */
export function animateMenuText(
  element,
  startText,
  endText,
  isReversing = false,
  options = {}
) {
  // Default animation options
  const defaults = {
    duration: 0.4,
    staggerTime: 0.03,
    ease: "power2.inOut",
    yOffset: 10,
    fade: true,
  };

  const settings = { ...defaults, ...options };
  const currentText = isReversing ? endText : startText;
  const targetText = isReversing ? startText : endText;

  // Find text node within the element
  let textNode = Array.from(element.childNodes).find(
    (node) =>
      node.nodeType === Node.TEXT_NODE ||
      (node.nodeType === Node.ELEMENT_NODE &&
        node.tagName.toLowerCase() === "span")
  );

  // If found a span, use that, otherwise use the element itself
  const textContainer =
    textNode && textNode.nodeType === Node.ELEMENT_NODE ? textNode : element;

  // Create timeline for the animation
  const tl = gsap.timeline();

  // Store the original content to restore it after animation
  const originalContent = textContainer.innerHTML || textContainer.textContent;

  // First part: animate current text out
  if (settings.fade) {
    tl.to(textContainer, {
      opacity: 0,
      y: isReversing ? settings.yOffset * -1 : settings.yOffset,
      duration: settings.duration / 2,
      ease: settings.ease,
      onComplete: () => {
        // Change the text content
        if (textContainer.tagName) {
          textContainer.textContent = targetText;
        } else {
          element.textContent = targetText;
        }
      },
    });
  } else {
    // Create letter-by-letter animation for current text
    const chars = currentText.split("");

    // Replace content with spans for each character
    textContainer.innerHTML = "";
    chars.forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      textContainer.appendChild(span);
    });

    // Animate each character out
    tl.to([...textContainer.children].reverse(), {
      opacity: 0,
      y: isReversing ? settings.yOffset * -1 : settings.yOffset,
      duration: settings.duration / 2,
      stagger: settings.staggerTime,
      ease: settings.ease,
      onComplete: () => {
        // Change the text content
        textContainer.innerHTML = "";

        // Create spans for each character of the new text
        const newChars = targetText.split("");
        newChars.forEach((char) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.display = "inline-block";
          span.style.opacity = 0;
          span.style.transform = `translateY(${isReversing ? settings.yOffset : settings.yOffset * -1}px)`;
          textContainer.appendChild(span);
        });
      },
    });

    // Animate new text in
    tl.to(textContainer.children, {
      opacity: 1,
      y: 0,
      duration: settings.duration / 2,
      stagger: settings.staggerTime,
      ease: settings.ease,
      onComplete: () => {
        // Restore original HTML structure but with new text
        if (textContainer.tagName) {
          textContainer.textContent = targetText;
        } else {
          element.textContent = targetText;
        }
      },
    });

    return tl;
  }

  // Second part: animate new text in
  tl.to(textContainer, {
    opacity: 1,
    y: 0,
    duration: settings.duration / 2,
    ease: settings.ease,
  });

  return tl;
}

/**
 * Initialize animations for a component
 * This should be called in the component's script
 * @param {string} componentSelector - CSS selector for the component container
 */
export function initComponentAnimations(componentSelector) {
  // This function will be called in each component to initiate animations
  document.addEventListener("DOMContentLoaded", () => {
    // After the loader animation completes, we'll initialize component animations
    const component = document.querySelector(componentSelector);
    if (!component) return;

    // Add animation classes to track initialized components
    component.classList.add("gsap-initialized");
  });
}
