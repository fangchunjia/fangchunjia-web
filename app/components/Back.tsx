import { Link } from "react-router";

export default function Back({ color }: { color?: string }) {
  return (
    <Link
      // TODO
      to={"/projects"}
      relative="path"
      className="cursor-pointer transition text-sm font-medium py-1 px-2"
      style={{ color: color }}
    >
      (Back)
    </Link>
  );
}
