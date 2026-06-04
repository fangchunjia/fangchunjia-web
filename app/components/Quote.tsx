export default function Quote() {
  return (
    <div
      className="fixed z-9999 bottom-0 left-40 px-8 py-1 embossed-wrapper"
      style={{ viewTransitionName: "site-quote" }}
    >
      <div className="embossed text-sm font-medium select-none">
        The hands want to see, the eyes want to caress.
      </div>
    </div>
  );
}
