export const SEEKER_FEED_SWIPE_THRESHOLD = 0.14;
export const SEEKER_FEED_VELOCITY_THRESHOLD = 0.35;
export const SEEKER_FEED_EDGE_RESISTANCE = 0.28;

/** Spring stiffness — tuned to feel like TikTok paging */
export const SEEKER_FEED_SPRING_STIFFNESS = 320;
export const SEEKER_FEED_SPRING_DAMPING = 32;

export function clampSwipeOffset(
  offset: number,
  pageHeight: number,
  canSwipeUp: boolean,
  canSwipeDown: boolean
) {
  if (pageHeight <= 0) return 0;

  if (!canSwipeDown && offset > 0) {
    return offset * SEEKER_FEED_EDGE_RESISTANCE;
  }
  if (!canSwipeUp && offset < 0) {
    return offset * SEEKER_FEED_EDGE_RESISTANCE;
  }

  const maxPull = pageHeight * 0.92;
  if (offset > maxPull) {
    return maxPull + (offset - maxPull) * SEEKER_FEED_EDGE_RESISTANCE;
  }
  if (offset < -maxPull) {
    return -maxPull + (offset + maxPull) * SEEKER_FEED_EDGE_RESISTANCE;
  }

  return offset;
}

export function trackTranslateY(
  currentSlotIndex: number,
  pageHeight: number,
  dragOffset: number
) {
  return -currentSlotIndex * pageHeight + dragOffset;
}

export function dominantSlideIndex(
  currentSlotIndex: number,
  pageHeight: number,
  dragOffset: number
) {
  if (pageHeight <= 0) return currentSlotIndex;
  return Math.round(-trackTranslateY(currentSlotIndex, pageHeight, dragOffset) / pageHeight);
}

export function resolveSwipeIntent(
  dragOffset: number,
  velocityY: number,
  pageHeight: number
): "up" | "down" | "stay" {
  if (pageHeight <= 0) return "stay";

  const distanceThreshold = pageHeight * SEEKER_FEED_SWIPE_THRESHOLD;
  if (dragOffset <= -distanceThreshold || velocityY <= -SEEKER_FEED_VELOCITY_THRESHOLD) {
    return "up";
  }
  if (dragOffset >= distanceThreshold || velocityY >= SEEKER_FEED_VELOCITY_THRESHOLD) {
    return "down";
  }
  return "stay";
}

type SpringSnapOptions = {
  from: number;
  to: number;
  velocity: number;
  onUpdate: (value: number) => void;
  onComplete: () => void;
};

/** Damped spring — mimics TikTok/iOS paging deceleration */
export function springSnap({
  from,
  to,
  velocity,
  onUpdate,
  onComplete,
}: SpringSnapOptions) {
  let position = from;
  let vel = velocity * 1000;
  let frameId = 0;
  let lastTime = performance.now();

  const step = (now: number) => {
    const dt = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;

    const displacement = position - to;
    const springForce = -SEEKER_FEED_SPRING_STIFFNESS * displacement;
    const dampingForce = -SEEKER_FEED_SPRING_DAMPING * vel;
    const acceleration = springForce + dampingForce;

    vel += acceleration * dt;
    position += vel * dt;
    onUpdate(position);

    if (Math.abs(displacement) < 0.4 && Math.abs(vel) < 8) {
      onUpdate(to);
      onComplete();
      return;
    }

    frameId = requestAnimationFrame(step);
  };

  frameId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frameId);
}
