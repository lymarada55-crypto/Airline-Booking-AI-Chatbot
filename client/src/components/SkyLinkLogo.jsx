/**
 * Signature SkyLink Airlines Angkor Wat + Wing + Airplane Emblem
 * - variant="light": Blue gradient emblem for white/light backgrounds (Navbar)
 * - variant="dark": Luminous white-to-sky-cyan emblem for dark navy backgrounds (Footer)
 */
export default function SkyLinkLogo({ height = 44, variant = "light", className = "" }) {
  const src = variant === "dark" ? "/skylink-logo-white.png" : "/skylink-logo-blue.png";

  return (
    <img
      src={src}
      alt="SkyLink Airlines"
      className={`shrink-0 object-contain select-none ${className}`}
      style={{
        height,
        width: "auto",
        display: "block",
      }}
      draggable={false}
    />
  );
}
