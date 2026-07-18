import { useState } from "react";
import { Link } from "react-router";

export default function BackOverlay() {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <>
      <Link
        className="backdrop fixed inset-0 z-overlay bg-fangchunjia-gray"
        to={"/projects"}
        onMouseMove={(e) => {
          setHovered(true);
          setPosition({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => setHovered(false)}
      />
      {hovered && (
        <div
          className="pointer-events-none fixed z-overlay-content -translate-x-1/2 -translate-y-full text-sm font-medium text-accent"
          style={{ left: position.x, top: position.y }}
        >
          Back
        </div>
      )}
    </>
  );
}
