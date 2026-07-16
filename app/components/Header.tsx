import Branding from "./Branding";
import Nav from "./Nav";

export default function Header({
  onClickBranding,
}: {
  onClickBranding: Function;
}) {
  return (
    <div className="fixed z-9999 flex inset-x-0 h-14">
      <div
        className="h-fit"
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
