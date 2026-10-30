import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fcBrand } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import { FcUnitedInnerHero } from './FcUnitedInnerHero';

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8', className)}>{children}</div>
  );
}

export default function FcUnitedVolunteerPage() {
  return (
    <div className={cn(fcBrand.className, 'min-h-screen bg-pitch-chalk text-pitch-charcoal/70 antialiased')}>
      <FcUnitedHeader />
      <FcUnitedInnerHero title="Volunteer With MD Strikers" />

      <section className="bg-white py-20 md:py-28">
        <Shell>
          <div className="mx-auto max-w-4xl rounded-xl border border-pitch-charcoal/10 bg-pitch-chalk p-6 md:p-10">
            <h2 className={cn('font-extrabold tracking-[-0.02em] text-2xl text-pitch-charcoal md:text-3xl')}>
              Building Community Through Sports
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-pitch-charcoal/70 md:text-base">
              We MD Strikers Sports Club trying to foster community engagement through sports by organizing soccer events.
              We want to help train young players and adults in soccer, volleyball and other sports.
            </p>

            <h3 className={cn('font-extrabold tracking-[-0.02em] mt-8 text-xl text-pitch-charcoal md:text-2xl')}>
              What Volunteers Do
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-pitch-charcoal/70 md:text-base">
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
