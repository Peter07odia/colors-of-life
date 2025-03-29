import React from 'react';
import { cn } from '../../lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const levelStyles = {
    1: 'text-4xl font-bold tracking-tight',
    2: 'text-3xl font-semibold tracking-tight',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };

  if (level === 1) {
    return <h1 className={cn('text-text-primary', levelStyles[1], className)} {...props} />;
  } else if (level === 2) {
    return <h2 className={cn('text-text-primary', levelStyles[2], className)} {...props} />;
  } else if (level === 3) {
    return <h3 className={cn('text-text-primary', levelStyles[3], className)} {...props} />;
  } else if (level === 4) {
    return <h4 className={cn('text-text-primary', levelStyles[4], className)} {...props} />;
  } else if (level === 5) {
    return <h5 className={cn('text-text-primary', levelStyles[5], className)} {...props} />;
  } else {
    return <h6 className={cn('text-text-primary', levelStyles[6], className)} {...props} />;
  }
};

Heading.displayName = 'Heading';

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'large' | 'small' | 'muted';
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', ...props }, ref) => {
    const variantStyles = {
      body: 'text-base text-text-primary',
      large: 'text-lg text-text-primary',
      small: 'text-sm text-text-primary',
      muted: 'text-sm text-text-secondary',
    };
    
    return (
      <p
        className={cn(variantStyles[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text'; 