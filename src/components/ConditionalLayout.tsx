'use client';

import React from 'react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function ConditionalLayout({ children, header, footer }: ConditionalLayoutProps) {
  return (
    <>
      {header}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {footer}
    </>
  );
}
