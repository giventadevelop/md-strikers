'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicRosterPlayer, PublicSquadMembership, PublicSquadOption } from './ApiServerActions';
import { FcUnitedRosterBoard, type RosterPerson, type RosterTone } from './FcUnitedRosterBoard';
import { encodePublicPath } from './fcUnitedGalleryData';
import { PUBLIC_SPORTS } from './playerSportProfiles';

type Props = {
  players: PublicRosterPlayer[];
  squads: PublicSquadOption[];
  memberships: PublicSquadMembership[];
  initialSquadSlug?: string;
};

const TONES: Record<string, RosterTone> = {
  goalkeeper: 'goalkeeper',
  defender: 'defender',
  midfielder: 'midfielder',
  forward: 'forward',
};

function bucket(raw: string): { key: string; label: string; chip: string; tone: RosterTone } {
  const value = raw.trim();
  const lower = value.toLowerCase();
  if (!value) return { key: 'squad', label: 'Squad', chip: 'Player', tone: 'other' };
  if (/\b(gk|goalkeeper|goalie|keeper)\b/.test(lower) || lower.includes('goalkeeper')) {
    return { key: 'goalkeeper', label: 'Goalkeepers', chip: 'Goalkeeper', tone: 'goalkeeper' };
  }
  if (lower.includes('defen') || lower.includes('back') || /\b(cb|lb|rb|lwb|rwb)\b/.test(lower)) {
    return { key: 'defender', label: 'Defenders', chip: 'Defender', tone: 'defender' };
  }
  if (lower.includes('mid')) return { key: 'midfielder', label: 'Midfielders', chip: 'Midfielder', tone: 'midfielder' };
  if (lower.includes('forward') || lower.includes('strik') || lower.includes('wing') || lower.includes('attack')) {
    return { key: 'forward', label: 'Forwards', chip: 'Forward', tone: 'forward' };
  }
  return { key: slug(value), label: value, chip: value, tone: TONES[lower] || toneFor(slug(value)) };
}

const POSITION_ORDER: Record<string, string[]> = {
  football: ['goalkeeper', 'center-back', 'left-back', 'right-back', 'defensive-midfielder', 'central-midfielder', 'attacking-midfielder', 'left-winger', 'right-winger', 'striker'],
  cricket: ['opening-batter', 'middle-order-batter', 'wicket-keeper', 'fast-bowler', 'spinner'],
  basketball: ['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center'],
  volleyball: ['setter', 'outside-hitter', 'opposite', 'middle-blocker', 'libero'],
  badminton: ['singles', 'doubles', 'mixed-doubles'],
  'tennis-squash': ['tennis-singles', 'tennis-doubles', 'squash-singles', 'squash-doubles'],
  'table-tennis': ['singles', 'doubles', 'mixed-doubles'],
  golf: ['low-handicap', 'mid-handicap', 'junior'],
};

const TONE_CYCLE: RosterTone[] = ['goalkeeper', 'defender', 'midfielder', 'forward'];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'player';
}

function toneFor(key: string): RosterTone {
  let total = 0;
  for (let index = 0; index < key.length; index += 1) total += key.charCodeAt(index);
  return TONE_CYCLE[total % TONE_CYCLE.length];
}

function rolesFor(player: PublicRosterPlayer) {
  const roles = player.sportRoles?.length
    ? player.sportRoles
    : [{ id: 'football', label: 'Football (Soccer)', position: player.position || 'Player', jersey: player.jersey }];
  return roles.map((role) =>
    role.id === 'football'
      ? { ...role, position: player.position || role.position || 'Player', jersey: player.jersey || role.jersey }
      : role,
  );
}

function activeMemberships(playerId: number, memberships: PublicSquadMembership[]) {
  return memberships.filter((row) => row.teamMemberId === playerId && row.isActive !== false);
}

function playerInSquad(player: PublicRosterPlayer, squadId: number, memberships: PublicSquadMembership[]) {
  const rows = activeMemberships(player.id, memberships);
  if (rows.length > 0) return rows.some((row) => row.teamGroupId === squadId);
  return player.primaryGroupId === squadId;
}

function withSquadDetails(player: PublicRosterPlayer, squadId: number, memberships: PublicSquadMembership[]) {
  const row = activeMemberships(player.id, memberships).find((item) => item.teamGroupId === squadId);
  if (!row) return player;
  return {
    ...player,
    jersey: row.jerseyNumber != null && Number.isFinite(row.jerseyNumber) ? String(row.jerseyNumber) : player.jersey,
    position: row.position?.trim() || player.position,
  };
}

function squadNames(player: PublicRosterPlayer, squads: PublicSquadOption[], memberships: PublicSquadMembership[]) {
  const rows = activeMemberships(player.id, memberships);
  const names = rows
    .map((row) => squads.find((squad) => squad.id === row.teamGroupId)?.name)
    .filter((name): name is string => Boolean(name));
  if (names.length) return [...new Set(names)].join(' · ');
  return squads.find((squad) => squad.id === player.primaryGroupId)?.name || player.role;
}

export default function FcUnitedTeamPage({ players, squads, memberships, initialSquadSlug = '' }: Props) {
  const router = useRouter();
  const initial = squads.find((squad) => squad.slug === initialSquadSlug);
  const [squadId, setSquadId] = useState(initial ? String(initial.id) : '');
  const [sportId, setSportId] = useState('');

  useEffect(() => {
    const match = squads.find((squad) => squad.slug === initialSquadSlug);
    setSquadId(match ? String(match.id) : '');
  }, [initialSquadSlug, squads]);

  const selected = squads.find((squad) => String(squad.id) === squadId) || null;

  function chooseSquad(value: string) {
    setSquadId(value);
    const squad = squads.find((item) => String(item.id) === value);
    router.replace(squad?.slug ? `/team?squad=${encodeURIComponent(squad.slug)}` : '/team', { scroll: false });
  }

  const squadPlayers = useMemo(() => {
    if (!selected) return players;
    return players
      .filter((player) => playerInSquad(player, selected.id, memberships))
      .map((player) => withSquadDetails(player, selected.id, memberships));
  }, [memberships, players, selected]);

  const sportChoices = useMemo(() => {
    const present = new Set<string>();
    for (const player of squadPlayers) {
      for (const role of rolesFor(player)) present.add(role.id);
    }
    return PUBLIC_SPORTS.filter((sport) => present.has(sport.id)).map((sport) => ({
      value: sport.id,
      label: sport.label,
    }));
  }, [squadPlayers]);

  useEffect(() => {
    if (sportId && !sportChoices.some((sport) => sport.value === sportId)) setSportId('');
  }, [sportChoices, sportId]);

  const selectedSport = sportChoices.find((sport) => sport.value === sportId) || null;

  const people = useMemo(() => {
    const rows: RosterPerson[] = [];
    for (const player of squadPlayers) {
      const roles = rolesFor(player).filter((role) => !sportId || role.id === sportId);
      const detail = selected?.name || squadNames(player, squads, memberships);
      for (const role of roles) {
        const position = role.position.trim() || 'Player';
        const key = sportId ? slug(position) : role.id;
        const grouped = sportId
          ? { key, label: position, tone: role.id === 'football' ? bucket(position).tone : toneFor(key) }
          : { key: role.id, label: role.label, tone: toneFor(role.id) };
        const jersey = Number(role.jersey);
        rows.push({
          id: sportId ? String(player.id) : `${player.id}:${role.id}`,
          href: `/team/${player.id}`,
          name: player.name,
          chip: position,
          tone: grouped.tone,
          groupKey: grouped.key,
          groupLabel: grouped.label,
          detail,
          number: role.jersey,
          imageUrl: player.imageUrl ? encodePublicPath(player.imageUrl) : '',
          searchText: [player.name, player.givenName, player.familyName, player.role, role.label, position, role.jersey, detail].join(' '),
          sortNumber: role.jersey && Number.isFinite(jersey) ? jersey : 10000,
        });
      }
    }
    return rows;
  }, [selected, sportId, squadPlayers, squads, memberships]);

  const groupOrder = useMemo(() => {
    if (!sportId) return PUBLIC_SPORTS.map((sport) => sport.id);
    return POSITION_ORDER[sportId] || [];
  }, [sportId]);

  return (
    <FcUnitedRosterBoard
      active="team"
      kicker="Squad"
      title={selected?.name || 'Sports Team'}
      subtitle={
        selectedSport
          ? `${selectedSport.label} players, grouped by the position they play.`
          : 'Every sport on the roster. Choose a sport to see its positions and players.'
      }
      people={people}
      noun="player"
      emptyQuiet="No squad players yet"
      searchLabel="Search players by name"
      searchPlaceholder="Search by name, number, sport, or position…"
      sorts={[
        { key: 'number', label: 'Number' },
        { key: 'name', label: 'Name' },
      ]}
      playerTabs
      groupFromPeople
      preferredGroupOrder={groupOrder}
      allTabLabel={selectedSport ? 'All positions' : 'All sports'}
      tabsLabel={selectedSport ? `Filter ${selectedSport.label} by position` : 'Filter by sport'}
      sports={sportChoices}
      sportValue={sportId}
      onSportChange={setSportId}
      squads={squads.map((squad) => ({
        value: String(squad.id),
        label: squad.categoryLabel ? `${squad.name} · ${squad.categoryLabel}` : squad.name,
      }))}
      squadValue={squadId}
      onSquadChange={chooseSquad}
      largeCards
    />
  );
}
