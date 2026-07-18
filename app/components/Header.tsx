import Branding from "./Branding";
import Nav from "./Nav";

export default function Header({
  onClickBranding,
}: {
  onClickBranding: Function;
}) {
  return (
    <header className="fixed z-chrome flex inset-x-0 h-14">
      <button
        type="button"
        aria-label="Toggle portrait photo"
        className="h-fit"
        onClick={() => {
          onClickBranding();
        }}
      >
        <Branding />
      </button>
      <Nav />
    </header>
  );
}
