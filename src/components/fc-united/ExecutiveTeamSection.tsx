import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';
import { fcBebas } from './fcUnitedFonts';

/** Expertise is stored as a JSON array string, or as a comma-separated list. */
function parseExpertise(expertise?: string): string[] {
  if (!expertise) return [];
  try {
    const parsed = JSON.parse(expertise);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    // not JSON
  }
  return expertise.split(',').map((item) => item.trim()).filter(Boolean);
}

export function ExecutiveTeamSection({ members }: { members: ExecutiveCommitteeTeamMemberDTO[] }) {
  if (members.length === 0) return null;

  return (
    <section className="bg-white py-14 md:py-20" aria-labelledby="executive-team-heading">
      <div className="mx-auto w-full max-w-[1308px] px-4 md:px-7 lg:px-12">
        <div className="mb-10 text-center md:mb-12 md:text-left">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#797e87]">
            leadership
          </span>
          <h2
            id="executive-team-heading"
            className={cn(fcBebas.className, 'text-4xl tracking-[0.03em] text-[#262f3e] md:text-5xl')}
          >
            Executive Team
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#797e87] md:text-[15px]">
            The volunteers who run Maryland Strikers Sports Club — tournaments, training, and community programs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const name = [m.firstName, m.lastName].filter(Boolean).join(' ').trim() || m.title;
            const role = m.designation?.trim() || m.title?.trim() || '';
            const expertise = parseExpertise(m.expertise);
            const blurb =
              expertise.length > 0 ? expertise.join(' · ') : (m.bio || '').replace(/<[^>]+>/g, '').trim();
            return (
              <article
                key={m.id ?? name}
                className="overflow-hidden rounded-[3px] border border-[#e3e3e3] bg-white transition-colors duration-300 ease-in-out hover:border-[#c8c8c8]"
              >
                <div className="relative aspect-[4/5] w-full border-b border-[#e3e3e3] bg-[#f4f4f4]">
                  {m.profileImageUrl ? (
                    <Image
                      src={m.profileImageUrl}
                      alt={name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className={cn(fcBebas.className, 'flex h-full items-center justify-center text-6xl text-[#c8c8c8]')}
                      aria-hidden
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="px-5 py-5 md:px-6 md:py-6">
                  {role && (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff0000]">{role}</p>
                  )}
                  <h3 className={cn(fcBebas.className, 'mt-1.5 text-3xl tracking-[0.02em] text-[#262f3e]')}>
                    {name}
                  </h3>
                  {blurb && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#797e87]">{blurb}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
