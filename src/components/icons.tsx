export const MapIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const BuildingIcon: React.FC<IconProps> = ({ size = 24, className, style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM6 12h4m8 0h-4M6 16h4m8 0h-4M10 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);