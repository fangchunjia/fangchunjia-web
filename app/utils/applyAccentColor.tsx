export default function applyAccentColor(c: string | null) {
  c
    ? document.documentElement.style.setProperty("--accent", "#000")
    : document.documentElement.style.removeProperty("--accent");
}
