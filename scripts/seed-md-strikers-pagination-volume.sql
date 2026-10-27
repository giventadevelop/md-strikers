-- Top public lists up to 120 visible rows for md_strikers_10.
-- Idempotent: titles/names that already exist are skipped.
SET ROLE event_site_admin;

DO $$
DECLARE
  i int;
  src event_details%ROWTYPE;
  media event_media%ROWTYPE;
  has_media boolean;
  new_title text;
BEGIN
  SELECT * INTO src FROM event_details WHERE id = 101;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'template event 101 missing';
  END IF;

  SELECT * INTO media FROM event_media WHERE id = 1428;
  has_media := FOUND;

  FOR i IN 1..99 LOOP
    new_title := 'Club Fixture ' || lpad(i::text, 3, '0');
    IF EXISTS (
      SELECT 1 FROM event_details
      WHERE tenant_id = 'md_strikers_10' AND title = new_title
    ) THEN
      CONTINUE;
    END IF;

    src.id := nextval('event_details_id_seq');
    src.title := new_title;
    src.caption := 'Maryland Strikers football fixture';
    src.description := 'Pagination test fixture at Othello Regional Park. Kickoff details are published with the match list.';
    src.start_date := DATE '2027-04-01' + i;
    src.end_date := src.start_date;
    src.promotion_start_date := DATE '2026-10-21';
    src.is_active := true;
    src.is_recurring := false;
    src.parent_event_id := NULL;
    src.recurrence_series_id := NULL;
    src.recurrence_pattern := NULL;
    src.event_recurrence_metadata := NULL;
    src.created_at := now();
    src.updated_at := now();
    src.tenant_id := 'md_strikers_10';
    INSERT INTO event_details VALUES (src.*);

    IF has_media THEN
      media.id := nextval('event_media_id_seq');
      media.event_id := src.id;
      media.tenant_id := 'md_strikers_10';
      media.title := new_title;
      media.is_featured_event_image := true;
      media.is_home_page_hero_image := false;
      media.is_live_event_image := false;
      media.is_agenda_flyer := false;
      media.created_at := now();
      media.updated_at := now();
      INSERT INTO event_media VALUES (media.*);
    END IF;
  END LOOP;
END $$;

INSERT INTO event_sponsors (
  tenant_id, name, type, company_name, tagline, description,
  is_active, priority_ranking, logo_url, created_at, updated_at
)
SELECT
  'md_strikers_10',
  'Club Sponsor ' || lpad(g::text, 3, '0'),
  'Community Sponsor',
  'Club Sponsor ' || lpad(g::text, 3, '0'),
  'Supporting Maryland Strikers',
  'Pagination test sponsor for the public sponsors list.',
  true,
  1000 + g,
  'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/media/tenantId/tenant_demo_002/executive-team-members/srk_1777912649217_bd65126b.png',
  now(),
  now()
FROM generate_series(1, 96) AS g
WHERE NOT EXISTS (
  SELECT 1 FROM event_sponsors s
  WHERE s.tenant_id = 'md_strikers_10'
    AND s.name = 'Club Sponsor ' || lpad(g::text, 3, '0')
);

INSERT INTO executive_committee_team_members (
  tenant_id, first_name, last_name, title, designation, bio,
  priority_order, profile_image_url, department, is_active, join_date
)
SELECT
  'md_strikers_10',
  'Member',
  lpad(g::text, 3, '0'),
  'Committee Member',
  'Club Operations',
  'Pagination test executive committee member.',
  5000 + g,
  'https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/dev/media/tenantId/tenant_demo_002/executive-team-members/srk_1777912649217_bd65126b.png',
  'Football',
  true,
  DATE '2024-01-01'
FROM generate_series(1, 104) AS g
WHERE NOT EXISTS (
  SELECT 1 FROM executive_committee_team_members m
  WHERE m.tenant_id = 'md_strikers_10'
    AND m.first_name = 'Member'
    AND m.last_name = lpad(g::text, 3, '0')
);

INSERT INTO last_matches (
  tenant_id, home_logo_url, away_logo_url, match_date_label,
  home_score, away_score, league_name, title, match_kind,
  priority_order, is_active
)
SELECT
  'md_strikers_10',
  '/images/md_strikers_media/team_logos/annapolis_fc.png',
  '/images/md_strikers_media/team_logos/capital_united.png',
  to_char(DATE '2027-05-01' + g, 'Mon DD, YYYY'),
  0,
  0,
  'Capital Cup',
  'Maryland Strikers vs Fixture ' || lpad(g::text, 3, '0'),
  'UPCOMING',
  2000 + g,
  true
FROM generate_series(1, 114) AS g
WHERE NOT EXISTS (
  SELECT 1 FROM last_matches m
  WHERE m.tenant_id = 'md_strikers_10'
    AND m.title = 'Maryland Strikers vs Fixture ' || lpad(g::text, 3, '0')
);

INSERT INTO last_matches (
  tenant_id, home_logo_url, away_logo_url, match_date_label,
  home_score, away_score, league_name, title, match_kind,
  priority_order, is_active
)
SELECT
  'md_strikers_10',
  '/images/md_strikers_media/team_logos/capital_united.png',
  '/images/md_strikers_media/team_logos/annapolis_fc.png',
  to_char(DATE '2026-03-01' + g, 'Mon DD, YYYY'),
  2,
  1,
  'Capital Cup',
  'Maryland Strikers vs Result ' || lpad(g::text, 3, '0'),
  'PAST',
  3000 + g,
  true
FROM generate_series(1, 114) AS g
WHERE NOT EXISTS (
  SELECT 1 FROM last_matches m
  WHERE m.tenant_id = 'md_strikers_10'
    AND m.title = 'Maryland Strikers vs Result ' || lpad(g::text, 3, '0')
);

RESET ROLE;
