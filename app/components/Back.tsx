import { Link } from "react-router";
import recordTransitionScroll from "~/utils/recordTransitionScroll";

export default function Back({ color }: { color?: string }) {
  return (
    <Link
      // TODO
      to={"/projects"}
      relative="path"
      viewTransition
      onClick={recordTransitionScroll}
      className="cursor-pointer transition text-sm font-medium py-1 px-2"
      style={{ color: color }}
    >
      (Back)
    </Link>
  );
}
