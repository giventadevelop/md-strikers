import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FC_IMG } from './fcUnitedConstants';
import { fcBebas } from './fcUnitedFonts';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export function FcUnitedInnerHero({ title }: { title: string }) {
  return (
    <section className="relative overflow-hidden bg-[#081224]">
      <div className="absolute inset-0">
        <Image
          src={`${FC_IMG}/anim-bg-copyright.jpg`}
          alt=""
          fill
          className="object-cover object-center opacity-50"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#081224]/95 via-[#0f1f38]/85 to-[#262f3e]/95" aria-hidden />
      </div>
      <Shell className="relative z-10 py-20 md:py-24 lg:py-28">
        <nav className="mb-4 text-sm font-semibold" aria-label="Breadcrumb">
          <Link
            href="/"
            className="cursor-pointer rounded-sm text-[#f5b514] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5b514] focus-visible:ring-offset-2 focus-visible:ring-offset-[#081224]"
          >
            Home
          </Link>
          <span className="mx-2 font-normal text-[#f5b514]/45" aria-hidden>
            /
          </span>
          <span className="text-[#f5b514]">{title}</span>
        </nav>
        <h1 className={cn(fcBebas.className, 'text-4xl tracking-wide text-white md:text-5xl lg:text-6xl')}>{title}</h1>
      </Shell>
    </section>
  );
}
