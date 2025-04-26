import type {
  TransitionAnimation,
  TransitionAnimationPair,
  TransitionDirectionalAnimations
} from 'astro'

const duration = 0.45

const getDuration = (duration: number) => `${duration.toString()}s`

const enterAnimation: TransitionAnimation = {
  name: 'fade-in-bottom',
  easing: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
  duration: getDuration(duration)
}

const exitAnimation: TransitionAnimation = {
  name: 'text-blur-out',
  easing: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
  duration: getDuration(duration)
}

const getAnimationPair = (delay?: number): TransitionAnimationPair => {
  return {
    new: { ...enterAnimation, delay: getDuration(duration + (delay ?? 0)) },
    old: { ...exitAnimation, delay: getDuration(delay ?? 0) }
  }
}

export const getCustomTransition = (
  delay?: number
): TransitionDirectionalAnimations => {
  return {
    backwards: getAnimationPair(delay),
    forwards: getAnimationPair(delay)
  }
}
