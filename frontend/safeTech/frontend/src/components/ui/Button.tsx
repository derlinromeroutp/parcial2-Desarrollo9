import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}) => {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '7px 16px', fontSize: '0.75rem' },
    md: { padding: '11px 24px', fontSize: '0.8rem' },
    lg: { padding: '14px 32px', fontSize: '0.875rem' },
  };

  return (
    <button
      className={`btn-${variant}`}
      style={{ ...sizeStyles[size], ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
