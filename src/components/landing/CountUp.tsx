import { useEffect, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  started?: boolean;
}

export function CountUp({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  started = true,
}: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) {
      setValue(0);
      return;
    }

    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, started]);

  const display = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();

  return (
    <span>
      {prefix}{display}{suffix}
    </span>
  );
}
