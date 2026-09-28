export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 4,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
}) {
  return <div className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} />;
}
