import Branding from "./Branding";
import Nav from "./Nav";

export default function Header({
  onClickBranding,
}: {
  onClickBranding: Function;
}) {
  return (
    <div className="fixed z-300 flex inset-x-0 h-28">
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
