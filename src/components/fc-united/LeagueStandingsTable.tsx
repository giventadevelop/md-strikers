import type { LeagueStandingRowDTO } from '@/types';
import { cn } from '@/lib/utils';
import { ClubMark } from './ClubMark';

export function LeagueStandingsTable({
  rows,
  highlightChampion = false,
}: {
  rows: LeagueStandingRowDTO[];
  highlightChampion?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-pitch-stone">No clubs in this table yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-pitch-chalk/10">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-pitch-stone">
            <th scope="col" className="w-10 px-3 py-4 md:w-12 md:px-6">
              #
            </th>
            <th scope="col" className="px-2 py-4 sm:px-4">
              Club
            </th>
            {['P', 'W', 'D', 'L'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className={cn('px-2 py-4 text-center sm:px-3', heading !== 'P' && 'hidden sm:table-cell')}
              >
                {heading}
              </th>
            ))}
            <th scope="col" className="hidden px-2 py-4 text-center sm:table-cell sm:px-3">
              GD
            </th>
            <th scope="col" className="px-4 py-4 text-center md:px-6">
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.leagueClubId}
              className={cn(
                'border-t border-pitch-chalk/10 tabular-nums text-pitch-chalk transition-colors duration-200 hover:bg-pitch-chalk/[0.03]',
                highlightChampion && index === 0 && 'bg-pitch-lime/10',
              )}
            >
              <td className={cn('px-4 py-4 font-semibold md:px-6', index === 0 ? 'text-pitch-lime' : 'text-pitch-stone')}>
                {row.position ?? index + 1}
              </td>
              <td className="px-2 py-4 sm:px-4">
                <span className="flex items-center gap-3 font-semibold">
                  <ClubMark name={row.clubName} logoUrl={row.logoUrl} size="sm" />
                  <span className="max-w-[10rem] truncate sm:max-w-none">
                    {row.clubName}
                    {highlightChampion && index === 0 ? (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-pitch-lime">
                        Champions
                      </span>
                    ) : null}
                  </span>
                </span>
              </td>
              <td className="px-2 py-4 text-center text-pitch-stone sm:px-3">{row.played}</td>
              <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">{row.won}</td>
              <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">{row.drawn}</td>
              <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">{row.lost}</td>
              <td className="hidden px-2 py-4 text-center text-pitch-stone sm:table-cell sm:px-3">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="px-4 py-4 text-center font-extrabold md:px-6">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
