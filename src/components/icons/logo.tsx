import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 6h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7" />
      <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
      <path d="M12 18V6" />
      <path d="M21 12H3" />
    </svg>
  );
}
