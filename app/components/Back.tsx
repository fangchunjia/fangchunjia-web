import { Link } from "react-router";

export default function Back() {
  return (
    <Link
      // TODO
      to={"/projects"}
      relative="path"
      className="cursor-pointer transition text-sm font-medium py-1 px-2 text-accent"
    >
      Back
    </Link>
  );
}
