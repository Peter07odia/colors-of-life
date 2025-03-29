import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  initials?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', src, alt, initials, ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    return (
      <div
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-primary-light text-primary-main',
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'avatar'}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-medium">
            {initials || '?'}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar'; 