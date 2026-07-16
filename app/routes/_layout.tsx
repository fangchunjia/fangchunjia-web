import { useRef, useState } from "react";
import { Outlet } from "react-router";
import ReactLenis from "lenis/react";
import Header from "~/components/Header";
import Purikura from "~/components/Purikura";
import Quote from "~/components/Quote";
import ProgressBar from "~/components/ProgressBar";
import { useLenisAutoResize } from "~/utils/useLenisAutoResize";
import Flirt from "~/components/Flirt";

export default function Layout() {
  const [isPurikuraVisible, setIsPurikuraVisible] = useState<boolean>(false);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}>
      <Header
        onClickBranding={() => setIsPurikuraVisible(!isPurikuraVisible)}
      />
      {isPurikuraVisible && <Purikura />}
      <Quote />
      <Flirt />
      <Main />
      <ProgressBar />
    </ReactLenis>
  );
}

// Rendered INSIDE <ReactLenis> so useLenisAutoResize resolves the provider — the
// root Layout component that renders the provider can't read it.
function Main() {
  const mainRef = useRef<HTMLElement>(null);
  useLenisAutoResize(mainRef);

  return (
    <main ref={mainRef} className="w-full min-h-dvh flex flex-col">
      <div className="w-full flex flex-col flex-1">
        <Outlet />
      </div>
    </main>
  );
}
