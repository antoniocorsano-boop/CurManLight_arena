import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type UiButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type UiButtonSize = 'small' | 'medium';

type UiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<UiButtonVariant, string> = {
  primary: 'bg-ui-action text-white hover:bg-ui-action-hover focus:ring-ui-focus',
  secondary: 'bg-transparent border border-ui-border text-ui-text hover:bg-ui-surface-subtle focus:ring-ui-focus',
  quiet: 'bg-transparent text-ui-text-secondary hover:bg-ui-surface-subtle focus:ring-ui-focus',
  danger: 'bg-ui-danger text-white hover:bg-red-700 focus:ring-ui-danger',
};

const sizeClasses: Record<UiButtonSize, string> = {
  small: 'h-ui-control-sm px-3 text-[13px]',
  medium: 'h-ui-control-md px-4 text-[14px]',
};

export const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(
  ({ variant = 'primary', size = 'medium', loading = false, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-ui-control
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

UiButton.displayName = 'UiButton';
