import { useMemo } from "react";

interface MessageChartProps {
  data: Array<{
    date: string;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
  }>;
  className?: string;
}

export function MessageChart({ data, className }: MessageChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => Math.max(d.sent, d.delivered, d.read, d.replied)));
  }, [data]);

  if (!data.length) {
    return (
      <div className={`h-64 bg-gray-50 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={`h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-end justify-around px-8 pb-8">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-1">
            {/* Bars */}
            <div className="flex space-x-1 items-end">
              <div 
                className="w-2 bg-blue-600 rounded-t"
                style={{ height: `${(item.sent / maxValue) * 100}%` }}
                title={`Sent: ${item.sent}`}
              />
              <div 
                className="w-2 bg-green-600 rounded-t"
                style={{ height: `${(item.delivered / maxValue) * 100}%` }}
                title={`Delivered: ${item.delivered}`}
              />
              <div 
                className="w-2 bg-orange-600 rounded-t"
                style={{ height: `${(item.read / maxValue) * 100}%` }}
                title={`Read: ${item.read}`}
              />
              <div 
                className="w-2 bg-purple-600 rounded-t"
                style={{ height: `${(item.replied / maxValue) * 100}%` }}
                title={`Replied: ${item.replied}`}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* X-axis labels */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-around text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
        ))}
      </div>
    </div>
  );
}
