export default function applyAccentColor(c: string | null) {
  return;
  c
    ? document.documentElement.style.setProperty("--accent", c)
    : document.documentElement.style.removeProperty("--accent");
}
