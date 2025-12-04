interface StatItemProps {
  label: string;
  value: string | number;
}

export function StatItem({ label, value }: StatItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
