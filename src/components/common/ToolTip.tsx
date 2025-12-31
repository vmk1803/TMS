"use client";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip = ({ text, children }: TooltipProps) => (
  <div className="relative group inline-block">
    {children}

    {text && (
      <div
        className="
          absolute 
          left-1/2 
          -translate-x-1/2
          -top-2
          -translate-y-full
          hidden
          group-hover:flex
          bg-green-50
          text-green-800
          text-xs
          font-medium
          px-3 py-1.5
          rounded-xl
          shadow-md
          whitespace-nowrap
          z-[99999]
        "
      >
        {text}
      </div>
    )}
  </div>
);

export default Tooltip;
