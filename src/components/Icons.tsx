import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

function BaseIcon({ children, className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Home: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </BaseIcon>
);

export const PieChart: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </BaseIcon>
);

export const ReceiptText: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M14 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </BaseIcon>
);

export const ArrowUpRight: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </BaseIcon>
);

export const ArrowDownRight: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="m7 7 10 10" />
    <path d="M17 7v10H7" />
  </BaseIcon>
);

export const Plus: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </BaseIcon>
);

export const Trash2: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </BaseIcon>
);

export const ChevronRight: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="m9 18 6-6-6-6" />
  </BaseIcon>
);

export const ChevronDown: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="m6 9 6 6 6-6" />
  </BaseIcon>
);

export const ChevronUp: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="m18 15-6-6-6 6" />
  </BaseIcon>
);

export const BarChart3: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </BaseIcon>
);

export const Table2: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
  </BaseIcon>
);

export const Search: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </BaseIcon>
);

export const Download: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </BaseIcon>
);

export const RotateCcw: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </BaseIcon>
);

export const Sparkles: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </BaseIcon>
);

export const Volume2: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <path d="M16 9a5 5 0 0 1 0 6" />
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </BaseIcon>
);

export const X: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </BaseIcon>
);
