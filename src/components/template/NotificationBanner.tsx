'use client';

interface NotificationBannerProps {
  message: string;
  backgroundColor?: string;
  textColor?: string;
  speed?: number;
}

export function NotificationBanner({
  message,
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
  speed = 50,
}: NotificationBannerProps) {
  return (
    <div
      className="relative overflow-hidden py-4 z-10"
      style={{ backgroundColor }}
    >
      <div className="relative">
        <div
          className="whitespace-nowrap animate-scroll-right-to-left text-center font-medium text-sm md:text-base"
          style={{
            color: textColor,
            animationDuration: `${speed}s`,
          }}
        >
          {message}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right-to-left {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll-right-to-left {
          animation: scroll-right-to-left linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
