/** TikTok-style bottom sheet motion presets */
export const seekerSheetBackdropMotion = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const },
  },
};

export const seekerSheetPanelMotion = {
  initial: { y: "100%" },
  animate: {
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 400,
      mass: 0.82,
    },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const },
  },
};
