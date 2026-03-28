import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  fcUnitedAboutNamslUrl,
  fcUnitedAboutP1,
  fcUnitedAboutP2BeforeNamslLink,
  fcUnitedAboutP3,
  fcUnitedAboutTitle,
} from './fcUnitedAboutContent';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default function FcUnitedAboutPage() {
  return (
    <div
      className={cn(
        fcPoppins.className,
        'flex min-h-screen flex-col bg-[#f4f4f4] text-[#797e87] antialiased',
      )}
    >
      <FcUnitedHeader active="about" />
      <main className="flex min-w-0 flex-1 flex-col">
        <FcUnitedInnerHero title="About" />

        <section className="bg-white py-12 md:py-16">
          <Shell>
            <div className="mx-auto max-w-4xl rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4] p-6 md:p-10">
              <h2 className={cn(fcBebas.className, 'text-3xl tracking-wide text-[#262f3e] md:text-4xl')}>
                {fcUnitedAboutTitle}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#797e87] md:text-base">
                <p>{fcUnitedAboutP1}</p>
                <p>
                  {fcUnitedAboutP2BeforeNamslLink}{' '}
                  <a
                    href={fcUnitedAboutNamslUrl}
                    className="font-medium text-[#ff0000] underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    namsl.com
                  </a>
                  .
                </p>
                <p>{fcUnitedAboutP3}</p>
              </div>
            </div>
          </Shell>
        </section>
      </main>

      <FcUnitedFooter />
    </div>
  );
}
