import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Shared types – consumed by clients of GET /api/liturgy
// ---------------------------------------------------------------------------

export interface LiturgyReading {
  liturgy_day_heading?: string;
  season_name?: string;
  liturgy_heading: string;
  content_place: string;
}

export interface LiturgyApiResponse {
  message: LiturgyReading[];
  /** Date of the liturgy day (YYYY-MM-DD), when from Strapi; use for badge instead of "today" */
  liturgyDate?: string;
}

// ---------------------------------------------------------------------------
// Strapi response types (internal – used only by the mapping layer)
// ---------------------------------------------------------------------------

interface StrapiLiturgyReading {
  id: number;
  liturgyHeadingEn: string;
  liturgyHeadingMalylm: string;
  contentPlaceEn: string;
  contentPlaceMalylm: string;
}

interface StrapiLiturgyDay {
  id: number;
  documentId: string;
  date: string;
  dayHeadingEn: string;
  dayHeadingMalylm: string;
  seasonNameEn: string;
  seasonNameMalylm: string;
  order: number;
  readings: StrapiLiturgyReading[];
}

interface StrapiResponse {
  data: StrapiLiturgyDay[];
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number };
  };
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const LITURGY_DATA_SOURCE = process.env.LITURGY_DATA_SOURCE || 'external';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '';
/** External SMCIM liturgy API – used when LITURGY_DATA_SOURCE !== 'strapi' */
const LITURGY_API_BASE = 'https://www.apiwebser.smcimprojects.com/api';

// ---------------------------------------------------------------------------
// GET /api/liturgy?lng=en|ml
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const lng = request.nextUrl.searchParams.get('lng') ?? 'en';
  if (lng !== 'en' && lng !== 'ml') {
    return NextResponse.json(
      { error: 'Invalid language. Use lng=en or lng=ml' },
      { status: 400 }
    );
  }

  if (LITURGY_DATA_SOURCE === 'strapi') {
    return fetchFromStrapi(lng);
  }
  return fetchFromExternalApi(lng);
}

// ---------------------------------------------------------------------------
// Strapi backend
// ---------------------------------------------------------------------------

async function fetchFromStrapi(lng: string): Promise<NextResponse> {
  try {
    // Per documentation: every list request must filter by tenant. Never omit the tenant filter.
    if (!TENANT_ID || TENANT_ID.trim() === '') {
      console.error('[Liturgy API] NEXT_PUBLIC_TENANT_ID is required when using Strapi. Set it in .env.local.');
      return NextResponse.json(
        {
          error:
            'Liturgy (Strapi) requires NEXT_PUBLIC_TENANT_ID. Set NEXT_PUBLIC_TENANT_ID in .env.local and restart the server.',
        },
        { status: 503 }
      );
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Next available liturgy day: date >= today, sort by date asc, take single record.
    // Always include tenant filter per liturgy-calendar API docs (filters[tenant][tenantId][$eq]).
    const baseParams = new URLSearchParams({
      'filters[tenant][tenantId][$eq]': TENANT_ID,
      'filters[date][$gte]': today,
      'filters[publishedAt][$notNull]': 'true',
      'populate[0]': 'readings',
      'sort': 'date:asc',
      'pagination[pageSize]': '1',
      'pagination[page]': '1',
    });

    const reqHeaders: Record<string, string> = { Accept: 'application/json' };
    const strapiToken = process.env.STRAPI_API_TOKEN || process.env.AMPLIFY_STRAPI_API_TOKEN;
    if (strapiToken) {
      reqHeaders['Authorization'] = `Bearer ${strapiToken}`;
    }

    const url = `${STRAPI_URL}/api/liturgy-days?${baseParams.toString()}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Liturgy API] Strapi request (tenant in query):', url.replace(TENANT_ID, '***'));
    }

    const res = await fetch(url, { method: 'GET', headers: reqHeaders, next: { revalidate: 3600 } });

    if (!res.ok) {
      const errBody = await res.text();
      if (process.env.NODE_ENV === 'development') {
        console.log('[Liturgy API] Strapi returned', res.status, 'Body:', errBody.slice(0, 500));
      }
      return NextResponse.json(
        { error: 'Strapi liturgy-days request failed' },
        { status: 502 }
      );
    }

    const body: StrapiResponse = await res.json();
    if (process.env.NODE_ENV === 'development') {
      console.log('[Liturgy API] Strapi raw response (' + (body.data?.length ?? 0) + ' items)');
    }

    const json: StrapiResponse | null = body.data && body.data.length > 0 ? body : null;

    if (!json) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Liturgy API] Strapi: no liturgy day found for date >=', today, '-- returning empty message');
      }
      const emptyBody: { message: LiturgyReading[]; _debug?: { source: string; url: string } } = { message: [] };
      if (process.env.NODE_ENV === 'development') {
        emptyBody._debug = { source: 'Strapi', url: `${STRAPI_URL}/api/liturgy-days` };
      }
      return NextResponse.json(emptyBody, { status: 200 });
    }

    const strapiDay: StrapiLiturgyDay = json.data[0];
    const message = mapStrapiToLegacy(strapiDay, lng);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Liturgy API] Mapped', message.length, 'readings for', lng, 'date', strapiDay.date);
    }

    const responseBody: { message: LiturgyReading[]; liturgyDate: string; _debug?: { source: string; url: string } } = {
      message,
      liturgyDate: strapiDay.date,
    };
    if (process.env.NODE_ENV === 'development') {
      responseBody._debug = { source: 'Strapi', url: `${STRAPI_URL}/api/liturgy-days` };
    }
    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('[Liturgy API] Strapi fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch liturgy readings' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Strapi → LiturgyReading[] mapping
// ---------------------------------------------------------------------------

function mapStrapiToLegacy(day: StrapiLiturgyDay, lang: string): LiturgyReading[] {
  const isEn = lang === 'en';
  const dayHeading = isEn ? day.dayHeadingEn : day.dayHeadingMalylm;
  const seasonName = isEn ? day.seasonNameEn : day.seasonNameMalylm;

  const readings: LiturgyReading[] = (day.readings || []).map((r) => ({
    liturgy_day_heading: dayHeading || '',
    season_name: seasonName || '',
    liturgy_heading: (isEn ? r.liturgyHeadingEn : r.liturgyHeadingMalylm) || '',
    content_place: (isEn ? r.contentPlaceEn : r.contentPlaceMalylm) || '',
  }));

  if (readings.length === 0) {
    readings.push({
      liturgy_day_heading: dayHeading || '',
      season_name: seasonName || '',
      liturgy_heading: '',
      content_place: '',
    });
  }

  return readings;
}

// ---------------------------------------------------------------------------
// Legacy external SMCIM API backend
// ---------------------------------------------------------------------------

async function fetchFromExternalApi(lng: string): Promise<NextResponse> {
  try {
    const token =
      process.env.LITURGY_API_TOKEN ??
      process.env.AMPLIFY_LITURGY_API_TOKEN ??
      (process.env.NODE_ENV === 'development'
        ? 'dmdlMXBVWkNqcS95MkFDVmlEWExZQT09'
        : '');
    if (!token) {
      console.error('[Liturgy API] LITURGY_API_TOKEN (or AMPLIFY_LITURGY_API_TOKEN) is not set');
      return NextResponse.json(
        { error: 'Liturgy API is not configured' },
        { status: 503 }
      );
    }

    const params = new URLSearchParams({ __: token, lng });
    const url = `${LITURGY_API_BASE}/liturgy?${params.toString()}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Liturgy API] External request (token redacted):', `${LITURGY_API_BASE}/liturgy?__=***&lng=${lng}`);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.syromalabarchurch.in/',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Liturgy API] Upstream error:', res.status, body);
      const message =
        res.status === 404 && body.includes('Access Denied')
          ? 'Liturgy API returned Access Denied. Check that LITURGY_API_TOKEN in .env.local matches the token from documentation (or request a new token from SMCIM).'
          : 'Liturgy service unavailable';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data: LiturgyApiResponse = await res.json();
    const body = { ...data } as LiturgyApiResponse & { _debug?: { source: string; url: string } };
    if (process.env.NODE_ENV === 'development') {
      body._debug = { source: 'External SMCIM API', url: `${LITURGY_API_BASE}/liturgy` };
    }
    return NextResponse.json(body);
  } catch (err) {
    console.error('[Liturgy API] External fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch liturgy readings' },
      { status: 500 }
    );
  }
}
