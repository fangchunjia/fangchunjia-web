import { useRef, useState } from "react";
import { Outlet } from "react-router";
import ReactLenis from "lenis/react";
import Header from "~/components/Header";
import Purikura from "~/components/Purikura";
import Quote from "~/components/Quote";
import ProgressBar from "~/components/ProgressBar";
import { useLenisAutoResize } from "~/utils/useLenisAutoResize";

export default function Layout() {
  const [isPurikuraVisible, setIsPurikuraVisible] = useState<boolean>(false);
  const mainRef = useRef<HTMLElement>(null);
  useLenisAutoResize(mainRef);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, syncTouch: true }}>
      <Header
        onClickBranding={() => setIsPurikuraVisible(!isPurikuraVisible)}
      />
      {isPurikuraVisible && <Purikura />}
      <Quote />

      <main ref={mainRef} className="w-full min-h-dvh flex flex-col">
        <Outlet />
      </main>
      <ProgressBar />
    </ReactLenis>
  );
}
