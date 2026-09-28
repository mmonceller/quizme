import type { ReactNode, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = (props: IconProps) => ReactNode;

/** Line icon drawn on a 24px grid; inherits color from `currentColor`. */
export function createIcon(name: string, body: ReactNode): IconComponent {
  function Icon({ className, strokeWidth = 1.6, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={className ?? 'h-5 w-5'}
        {...rest}
      >
        {body}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}
