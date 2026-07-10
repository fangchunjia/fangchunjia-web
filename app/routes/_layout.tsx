import { useRef, useState } from "react";
import { useLocation } from "react-router";
import ReactLenis, { useLenis } from "lenis/react";
import { useStore } from "@nanostores/react";
import Header from "~/components/Header";
import Purikura from "~/components/Purikura";
import Quote from "~/components/Quote";
import ProgressBar from "~/components/ProgressBar";
import AnimatedOutlet from "~/components/AnimatedOutlet";
import { $coverPlayed } from "~/stores/ui";
import { useLenisAutoResize } from "~/utils/useLenisAutoResize";

export default function Layout() {
  const [isPurikuraVisible, setIsPurikuraVisible] = useState<boolean>(false);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}>
      <Header
        onClickBranding={() => setIsPurikuraVisible(!isPurikuraVisible)}
      />
      {isPurikuraVisible && <Purikura />}
      <Quote />

      <Main />
      <ProgressBar />
    </ReactLenis>
  );
}

// Rendered INSIDE <ReactLenis> so useLenis() (and useLenisAutoResize) resolve the
// provider — the root Layout component that renders the provider can't read it.
function Main() {
  const mainRef = useRef<HTMLElement>(null);
  useLenisAutoResize(mainRef);

  const { pathname } = useLocation();
  // Key the top-level transition on the first path segment so navigations WITHIN a
  // section (e.g. projects list↔detail, handled by the projects layout's own
  // AnimatedOutlet) don't also trigger a root-level transition.
  const topSegment = pathname.split("/")[1] || "home";
  const coverPlayed = useStore($coverPlayed);
  const lenis = useLenis();

  return (
    <main ref={mainRef} className="w-full min-h-dvh flex flex-col">
      <AnimatedOutlet
        routeKey={topSegment}
        gate={coverPlayed}
        className="w-full flex flex-col flex-1"
        onExitComplete={() => lenis?.scrollTo(0, { immediate: true })}
      />
    </main>
  );
}
