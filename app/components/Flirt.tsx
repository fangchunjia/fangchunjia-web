import FlirtGraphic from "~/assets/graphics/flirt.svg?react";

export default function Flirt() {
  return (
    <div className="fixed inset-0 pointer-events-none z-9999 flex *:m-auto *:max-h-[80%]">
      <FlirtGraphic />
    </div>
  );
}
