/**
 * Append-only upcoming football tournament events for /events pagination.
 * The catalog shows 20 per page. Ten new events plus the existing upcoming
 * list still fit on one page, so two extra dates open page 2.
 * Tenant comes from .env.local (md_strikers_10). Skips a title that already exists.
 *
 *   node scripts/seed-md-strikers-football-events.mjs
 */
import { apiFetch, TENANT_ID } from './mosc-in-migration/migration-api-lib.mjs';

const EVENT_TYPE_ID = 15;
const VENUE = 'Othello Regional Park, 1901A Jefferson Pike, Brunswick, MD';

const EVENTS = [
  ['Maryland Strikers Fall Cup', '2026-11-07', '2026-11-08'],
  ['Germantown Qualifier Cup', '2026-11-14', '2026-11-15'],
  ['DMV Youth Football Showcase', '2026-11-21', '2026-11-22'],
  ['Strikers Invitational Tournament', '2026-12-05', '2026-12-06'],
  ['Mid-Atlantic Club Championship', '2026-12-12', '2026-12-13'],
  ['Holiday Weekend Football Cup', '2026-12-19', '2026-12-20'],
  ['Winter Kickoff Tournament', '2027-01-09', '2027-01-10'],
  ['Maryland Strikers U15 Cup', '2027-01-16', '2027-01-17'],
  ['New Year Football Festival', '2027-01-23', '2027-01-24'],
  ['Spring Preview Tournament', '2027-02-06', '2027-02-07'],
  ['Maryland Strikers Presidents Cup', '2027-02-13', '2027-02-14'],
  ['Brunswick Football Finals', '2027-02-20', '2027-02-21'],
];

async function findByTitle(title, token) {
  const { res, json } = await apiFetch(
    `/api/event-details?title.equals=${encodeURIComponent(title)}&size=5`,
    { method: 'GET' },
    token
  );
  if (!res.ok) return [];
  return Array.isArray(json) ? json : json?.content || [];
}

async function createEvent(title, startDate, endDate, token) {
  const now = new Date().toISOString();
  const payload = {
    title,
    caption: `${title} — football tournament`,
    description: `${title} is a weekend football tournament hosted by Maryland Strikers. Teams play a group stage and a final at ${VENUE}.`,
    startDate,
    endDate,
    promotionStartDate: startDate,
    startTime: '09:00:00',
    endTime: '17:00:00',
    timezone: 'America/New_York',
    location: VENUE,
    directionsToVenue: '',
    admissionType: 'ticketed',
    isActive: true,
    allowGuests: false,
    requireGuestApproval: false,
    enableGuestPricing: false,
    isRegistrationRequired: true,
    isSportsEvent: true,
    isCompetitionEvent: true,
    isLive: false,
    isFeaturedEvent: false,
    featuredEventPriorityRanking: 0,
    liveEventPriorityRanking: 0,
    isRecurring: false,
    paymentFlowMode: 'STRIPE_ONLY',
    manualPaymentEnabled: false,
    tenantId: TENANT_ID,
    eventType: { id: EVENT_TYPE_ID },
    donationMetadata: JSON.stringify({ isFundraiserEvent: false, isCharityEvent: false }),
    fromEmail: 'mdstrikersinc@gmail.com',
    createdAt: now,
    updatedAt: now,
  };
  const { res, json, text } = await apiFetch(
    '/api/event-details',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    token
  );
  if (!res.ok) {
    throw new Error(`Create "${title}" failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return json;
}

const token = null;
const created = [];
const skipped = [];
for (const [title, startDate, endDate] of EVENTS) {
  const existing = await findByTitle(title, token);
  if (existing.length > 0) {
    skipped.push({ id: existing[0].id, title });
    console.log(`skip id=${existing[0].id} ${title}`);
    continue;
  }
  const row = await createEvent(title, startDate, endDate, token);
  created.push({ id: row?.id, title, startDate });
  console.log(`created id=${row?.id} ${title} ${startDate}`);
}

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const future = await apiFetch(
  `/api/event-details?isActive.equals=true&startDate.greaterThanOrEqual=${todayIso}&page=0&size=1`,
  { method: 'GET' },
  token
);
console.log(
  JSON.stringify(
    {
      tenant: TENANT_ID,
      created: created.length,
      skipped: skipped.length,
      futureCount: future.res.headers.get('x-total-count'),
    },
    null,
    2
  )
);
