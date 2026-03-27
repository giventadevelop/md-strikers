import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fcBebas, fcPoppins } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export default function FcUnitedVolunteerPage() {
  return (
    <div className={cn(fcPoppins.className, 'min-h-screen bg-[#f4f4f4] text-[#797e87] antialiased')}>
      <FcUnitedHeader />
      <FcUnitedInnerHero title="Volunteer With MD Strikers" />

      <section className="bg-white py-12 md:py-16">
        <Shell>
          <div className="mx-auto max-w-4xl rounded-[3px] border border-[#e3e3e3] bg-[#f4f4f4] p-6 md:p-10">
            <h2 className={cn(fcBebas.className, 'text-3xl tracking-wide text-[#262f3e] md:text-4xl')}>
              Building Community Through Sports
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#797e87] md:text-base">
              We MD Strikers Sports Club trying to foster community engagement through sports by organizing soccer events.
              We want to help train young players and adults in soccer, volleyball and other sports.
            </p>

            <h3 className={cn(fcBebas.className, 'mt-8 text-2xl tracking-wide text-[#262f3e] md:text-3xl')}>
              What Volunteers Do
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#797e87] md:text-base">
              <li>Helping event organizers to run soccer tournaments and matches</li>
              <li>Managing score keeping and assisting during games</li>
              <li>Providing ground support including setup and breakdown of equipments</li>
              <li>Helping distributing game supplies and fluids to teams and players</li>
            </ul>
          </div>
        </Shell>
      </section>

      <FcUnitedFooter />
    </div>
  );
}
