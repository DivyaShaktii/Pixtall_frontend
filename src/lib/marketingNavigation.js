const PENDING_SECTION = "pixtall_landing_section";

export function scrollToMarketingSection(sectionId) {
  const target = sectionId === "top" ? document.body : document.getElementById(sectionId);
  if (!target) {
    sessionStorage.setItem(PENDING_SECTION, sectionId);
    window.location.assign("/");
    return;
  }
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (window.location.hash) {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }
  window.scrollTo({
    top: sectionId === "top" ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - 96),
    behavior: reducedMotion ? "instant" : "smooth",
  });
  if (sectionId !== "top") {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}

export function restoreMarketingSection() {
  const section = sessionStorage.getItem(PENDING_SECTION);
  sessionStorage.removeItem(PENDING_SECTION);
  if (section) scrollToMarketingSection(section);
}
