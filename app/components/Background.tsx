export default function Background() {
  return (
    <img
      aria-hidden="true"
      src="/background.jpg"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: -10,
      }}
    />
  );
}
