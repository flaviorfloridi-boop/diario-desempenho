export function GrowthRing({ level, size = 34, cor = "#2b5cf0" }) {
  const rings = [1, 2, 3, 4, 5];
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Nível ${level} de 5`}>
      {rings.map((r) => {
        const radius = (r / 5) * (center - 2);
        const filled = r <= level;
        return (
          <circle
            key={r}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={filled ? cor : "#e1e5f0"}
            strokeWidth={filled ? 2.4 : 1}
            opacity={filled ? 1 - (5 - r) * 0.1 : 1}
          />
        );
      })}
      <circle cx={center} cy={center} r={1.6} fill={level > 0 ? cor : "#e1e5f0"} />
    </svg>
  );
}
