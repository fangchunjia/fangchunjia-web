import Branding from "./Branding";
import Nav from "./Nav";

export default function Header({
  onClickBranding,
}: {
  onClickBranding: Function;
}) {
  return (
    <div
      className="fixed z-300 flex"
      style={{ viewTransitionName: "site-header" }}
    >
      <div
        onClick={() => {
          onClickBranding();
        }}
      >
        <Branding />
      </div>
      <Nav />
    </div>
  );
}
