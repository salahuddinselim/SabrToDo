'use client';

import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ size = 'md', className, ...props }: LogoProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${sizes[size]} ${className || ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-blue)" />
          <stop offset="100%" stopColor="var(--accent-purple)" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer elegant squircle boundary */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="28"
        fill="url(#logo-gradient)"
        className="opacity-[0.08]"
      />
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="28"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        className="opacity-25"
      />

      {/* Lotus Mindfulness Petals + Infinity flow */}
      {/* Left Petal */}
      <path
        d="M36 60C32 50 36 38 46 36C40 45 40 55 46 60C40 60 36 60 36 60Z"
        fill="url(#logo-gradient)"
        className="opacity-70"
      />
      
      {/* Right Petal */}
      <path
        d="M64 60C68 50 64 38 54 36C60 45 60 55 54 60C60 60 64 60 64 60Z"
        fill="url(#logo-gradient)"
        className="opacity-70"
      />

      {/* Main Center Petal / Droplet */}
      <path
        d="M50 25C50 25 35 48 35 60C35 68.28 41.72 75 50 75C58.28 75 65 68.28 65 60C65 48 50 25 50 25Z"
        fill="url(#logo-gradient)"
        filter="url(#logo-glow)"
      />

      {/* Modern Checkmark for SabrFlow Completion */}
      <path
        d="M43 58L48 63L58 51"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
