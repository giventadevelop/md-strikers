import Image from 'next/image';
import Link from 'next/link';
import { fcPublicShell } from './fcUnitedFonts';
import { FcUnitedFooter } from './FcUnitedFooter';
import { FcUnitedHeader } from './FcUnitedHeader';
import type { PublicTournament } from '@/lib/tournaments/publicTournaments';
import { menuLabel } from '@/lib/tournaments/publicTournaments';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function filled(value?: string | null) {
  return Boolean(value && value.trim());
}

function fmt(iso?: string | null): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11 || !day) return '';
  return `${MONTHS[monthIndex]} ${Number(day)}, ${year}`;
}

function dateRange(tournament: PublicTournament): string {
  const start = fmt(tournament.startDate);
  const end = fmt(tournament.endDate);
  if (start && end && start !== end) return `${start} — ${end}`;
  return start || end;
}

export default function FcUnitedTournamentPage({
  tournament,
  previous,
}: {
  tournament: PublicTournament;
  previous: PublicTournament[];
}) {
  const label = tournament.title;
  const names = [tournament.winnerName, tournament.runnerUpName, tournament.thirdPlaceName].filter(filled);
  const completedWithPodium = tournament.status === 'COMPLETED' && names.length > 0;
  const inProgress = tournament.status === 'IN_PROGRESS';
  const past = tournament.status === 'COMPLETED';
  const status = inProgress ? 'In progress' : past ? 'Past tournament' : 'Upcoming tournament';
  const resultsUrl = tournament.externalResultsUrl?.trim() || '';
  const resultsLabel = tournament.externalResultsLabel?.trim() || 'Open schedule in new tab';
  const dates = dateRange(tournament);

  return (
    <div className={fcPublicShell}>
      <FcUnitedHeader active="tournaments" />
      <main className="md-tn">
        <div className="md-tn-hero" aria-label={label}>
          <div className="md-tn-wrap">
            <p className="md-tn-kicker"><span />Tournament</p>
            <h1>{label}</h1>
            <p>
              <span className={inProgress ? 'md-tn-chip is-live' : past ? 'md-tn-chip is-past' : 'md-tn-chip'}>
                {inProgress ? <b /> : null}
                {status}
              </span>
              {dates ? <span>{dates}</span> : null}
            </p>
          </div>
        </div>

        <div className="md-tn-detail">
          <div className="md-tn-wrap">
            {filled(tournament.heroImageUrl) && (
              <div className="md-tn-poster">
                <Image
                  src={tournament.heroImageUrl!}
                  alt={`${label} tournament poster`}
                  width={1920}
                  height={1080}
                  className="block h-auto w-full"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              </div>
            )}

            <article className="md-tn-sheet">
              {filled(tournament.welcomeText) && <p>{tournament.welcomeText}</p>}

              {filled(tournament.aboutText) && (
                <div>
                  <h2>About the Tournament</h2>
                  <p>{tournament.aboutText}</p>
                </div>
              )}

              {(filled(tournament.chiefGuestName) || filled(tournament.chiefGuestImageUrl)) && (
                <div>
                  <h2>Chief Guest{tournament.ageGroupLabel ? ` · ${tournament.ageGroupLabel}` : ''}</h2>
                  {filled(tournament.chiefGuestName) && <p>{tournament.chiefGuestName}</p>}
                  {filled(tournament.chiefGuestImageUrl) && (
                    <div className="md-tn-guest">
                      <Image
                        src={tournament.chiefGuestImageUrl!}
                        alt={tournament.chiefGuestName ? `Chief guest — ${tournament.chiefGuestName}` : 'Chief guest'}
                        width={1200}
                        height={900}
                        className="block h-auto w-full"
                        sizes="(max-width: 768px) 100vw, 576px"
                      />
                    </div>
                  )}
                </div>
              )}

              {filled(tournament.detailsText) && (
                <div>
                  <h2>Tournament Details</h2>
                  <p>{tournament.detailsText}</p>
                </div>
              )}

              {filled(tournament.registrationEmail) && (
                <div>
                  <h2>Registration</h2>
                  <p>
                    Teams interested in participating can reach out to us at{' '}
                    <a href={`mailto:${tournament.registrationEmail}`}>{tournament.registrationEmail}</a>{' '}
                    for registration details and tournament guidelines.
                  </p>
                </div>
              )}

              <div>
                <h2>Results</h2>
                {inProgress && <p className="md-tn-note">Tournament in progress</p>}
                {completedWithPodium && (
                  <ol>
                    {filled(tournament.winnerName) && <li>Winner: {tournament.winnerName}</li>}
                    {filled(tournament.runnerUpName) && <li>Runner-up: {tournament.runnerUpName}</li>}
                    {filled(tournament.thirdPlaceName) && <li>Third place: {tournament.thirdPlaceName}</li>}
                  </ol>
                )}
                {!completedWithPodium && (
                  <p>{inProgress ? 'Final places will be updated when the tournament is complete.' : 'Results will be updated soon.'}</p>
                )}
                {resultsUrl && (
                  <a className="md-tn-card__view" href={resultsUrl} target="_blank" rel="noopener noreferrer">
                    {resultsLabel}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                )}
              </div>
            </article>

            {filled(tournament.fixturesImageUrl) && (
              <div className="md-tn-poster">
                <Image
                  src={tournament.fixturesImageUrl!}
                  alt={`${label} match fixtures`}
                  width={1920}
                  height={1280}
                  unoptimized
                  className="block h-auto w-full"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              </div>
            )}

            {resultsUrl && (
              <div className="md-tn-schedule">
                <h2>Schedule &amp; results</h2>
                <iframe
                  title={`${label} — live schedule and results`}
                  src={resultsUrl}
                  className="w-full border-0"
                  style={{ height: '1980px' }}
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {previous.length > 0 && (
              <div className="md-tn-sheet">
                <h2>Previous tournaments</h2>
                <ul className="md-tn-previous">
                  {previous.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/tournaments/${item.slug}`}>{menuLabel(item)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
      <FcUnitedFooter />
    </div>
  );
}
