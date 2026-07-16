import { Link } from "react-router";

export default function BackOverlay() {
  return (
    <Link
      className="backdrop absolute inset-0 bg-fangchunjia-gray"
      to={"/projects"}
    />
  );
}
