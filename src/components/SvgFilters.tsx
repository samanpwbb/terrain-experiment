export function SvgFilters() {
  return (
    <svg display="none">
      <defs>
        <filter id="pixelate">
          <feFlood height="2" width="2" x="2" y="2" />
          <feComposite height="6" width="6" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="2" />
        </filter>
      </defs>
    </svg>
  );
}
