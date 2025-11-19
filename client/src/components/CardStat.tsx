// components/dashboard/CardStat.tsx
import { Card, CardContent } from "@/components/ui/card";

interface CardStatProps {
  label: string;
  value: number | string;
  subLabel?: string;
  icon: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  subLabelClassName?: string;
}

export function CardStat({
  label,
  value,
  subLabel,
  icon,
  iconClassName = "bg-blue-50 text-blue-500",
  valueClassName = "text-gray-900",
  subLabelClassName = "text-gray-400",
}: CardStatProps) {
  return (
    <Card className="rounded-xl border shadow hover:shadow-md transition duration-150 bg-white">
      <CardContent className="flex flex-col justify-between h-full p-6">
        <div className="flex justify-between items-center mb-1 gap-2">
          <div>
            <div className="font-semibold text-gray-600">{label}</div>
            <div className={`text-2xl font-bold ${valueClassName}`}>
              {value}
            </div>
          </div>
          <div
            className={`rounded-xl p-2 flex items-center justify-center ${iconClassName}`}
          >
            {icon}
          </div>
        </div>
        {subLabel && (
          <div
            className={`mt-2 text-sm flex items-center ${subLabelClassName}`}
          >
            {subLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
