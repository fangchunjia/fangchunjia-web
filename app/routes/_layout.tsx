import { useState } from "react";
import { Outlet } from "react-router";
import Header from "~/components/Header";
import Purikura from "~/components/Purikura";
import Quote from "~/components/Quote";
import ProgressBar from "~/components/ProgressBar";

export default function Layout() {
  const [isPurikuraVisible, setIsPurikuraVisible] = useState<boolean>(false);

  return (
    <>
      <Header
        onClickBranding={() => setIsPurikuraVisible(!isPurikuraVisible)}
      />
      {isPurikuraVisible && <Purikura />}
      <Quote />

      <main className="w-full h-full">
        <Outlet />
      </main>
      <ProgressBar />
    </>
  );
}
