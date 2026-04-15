const CartoesIcon = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="1" y="7" width="18" height="13" rx="2" />
    <rect x="5" y="4" width="18" height="13" rx="2" />
    <line x1="8" y1="11" x2="8" y2="11.01" />
    <line x1="12" y1="11" x2="20" y2="11" />
  </svg>
);

export default CartoesIcon;
