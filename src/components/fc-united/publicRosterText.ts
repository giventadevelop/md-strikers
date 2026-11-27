/** Filename labels left on team_members.title after a photo import, e.g. "Player 4-01". */
export function isFilenamePlayerLabel(title: string): boolean {
  return /^player\s+\d+(?:-\d+)?$/i.test(title.trim());
}

export function publicPlayerName(member: {
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const joined = [member.firstName, member.lastName]
    .map((part) => part?.trim() || '')
    .filter(Boolean)
    .join(' ')
    .trim();
  const titled = member.title?.trim() || '';
  if (joined && (!titled || isFilenamePlayerLabel(titled))) return joined;
  return titled || joined || 'Player';
}

/** Keyboard-mash, "test bio", and pagination-test sentences are not public copy. */
export function isPlaceholderCopy(value?: string | null): boolean {
  const text = (value || '').trim();
  if (!text) return false;
  if (/pagination test/i.test(text) || /^test bio$/i.test(text)) return true;
  if (/\s/.test(text) || text.length < 6) return false;
  if (/^(.)\1+$/.test(text)) return true;
  return new Set(text.toLowerCase()).size <= 3;
}

export function publishableText(value?: string | null): string {
  const text = (value || '').trim();
  return text && !isPlaceholderCopy(text) ? text : '';
}

type ExecutiveIdentity = {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
};

/** Drop seed rows (Test person, John Doe, Member 001, ddddddd) from the public committee. */
export function isPublishableExecutive(member: ExecutiveIdentity): boolean {
  const first = (member.firstName || '').trim();
  const last = (member.lastName || '').trim();
  if (/^test$/i.test(first)) return false;
  if (/^member$/i.test(first) && /^\d+$/.test(last)) return false;
  if (/^(john|mary)$/i.test(first) && /^doe$/i.test(last)) return false;
  if (isPlaceholderCopy(first) || isPlaceholderCopy(last)) return false;
  if (/pagination test/i.test(member.bio || '')) return false;
  return true;
}
