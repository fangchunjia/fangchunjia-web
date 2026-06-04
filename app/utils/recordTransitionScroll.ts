// Records the current window scroll position into a CSS custom property so the
// outgoing route's view-transition snapshot can be offset back to where the page
// was scrolled. Call this at the click that starts the navigation — before the
// scroll resets — so the value is frozen for the duration of the transition.
export default function recordTransitionScroll() {
  document.documentElement.style.setProperty(
    "--vt-scroll-y",
    `${window.scrollY}px`,
  );
}
