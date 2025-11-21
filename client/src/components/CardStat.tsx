// components/dashboard/CardStat.tsx
import { Card, CardContent } from "@/components/ui/card";

interface CardStatProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  borderColor?: string;
}

export function CardStat({
  label,
  value,
  icon,
  iconClassName = "bg-green-50 text-green-600",
  valueClassName = "text-gray-900",
  borderColor = "border-l-green-500",
}: CardStatProps) {
  return (
    <Card
      className={`rounded-lg border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-200 bg-white`}
    >
      <CardContent className="px-6 py-4">
        {/* Icon and Label Row */}
        <div className="flex items-center justify-start gap-4 mb-4">
          <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
          <h3 className="text-sm font-medium text-gray-600 mt-1">{label}</h3>
        </div>

        {/* Value */}
        <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
