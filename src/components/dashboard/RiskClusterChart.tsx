import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskCategory {
  name: string;
  value: number;
  color?: string;
}

interface RiskClusterChartProps {
  data: RiskCategory[];
  className?: string;
}

const COLORS = [
  'hsl(217, 91%, 60%)', // Blue
  'hsl(270, 95%, 60%)', // Purple
  'hsl(330, 85%, 60%)', // Pink
  'hsl(15, 90%, 60%)',  // Orange
  'hsl(160, 84%, 45%)', // Green
  'hsl(190, 90%, 50%)', // Cyan
];

export function RiskClusterChart({ data, className }: RiskClusterChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map(d => ({ ...d, value: 0 })));
  const [isVisible, setIsVisible] = useState(false);

  // Animate bars growing from zero
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1200, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedData(data.map(d => ({
        ...d,
        value: Math.round(eased * d.value),
      })));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, data]);

  const chartData = animatedData.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.value}% of risks</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full transition-transform duration-500"
              style={{
                backgroundColor: entry.color,
                transform: isVisible ? 'scale(1)' : 'scale(0)',
                transitionDelay: `${index * 100}ms`,
              }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}