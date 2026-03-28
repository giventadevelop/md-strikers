/**
 * About copy for Maryland Strikers — aligned with the home page and NAMSL community context.
 * NAMSL: https://namsl.com/ (North American Malayalee Soccer League).
 */
export const fcUnitedAboutTitle = 'One of the top soccer clubs in the USA and North America';

export const fcUnitedAboutP1 =
  'Maryland Strikers Sports Club is a U.S.-based soccer organization rooted in Germantown, Maryland. We compete at a high level, develop players across age groups, and bring together families who want serious soccer with a strong sense of community.';

/** Text before the NAMSL link (About page renders the link; home teaser uses full paragraph list only). */
export const fcUnitedAboutP2BeforeNamslLink =
  'We are part of the broader North American Malayalee soccer ecosystem alongside leagues such as the North American Malayalee Soccer League (NAMSL), which promotes premier-level soccer and connection for communities across the USA and Canada. Learn more about that league at';

export const fcUnitedAboutNamslUrl = 'https://namsl.com/';

export const fcUnitedAboutP3 =
  'As you will see on our home page, we spotlight major events such as Capital Cup 2026—with chief guest I.M. Vijayan—and fixtures at venues including Othello Regional Park in Frederick, Maryland. Our first team, match results, and news sections reflect the same energy we bring to training and competition every week.';

/** Full text for paragraph 2 (e.g. contexts that cannot render JSX). */
const fcUnitedAboutP2Plain = `${fcUnitedAboutP2BeforeNamslLink} ${fcUnitedAboutNamslUrl}`;

export const fcUnitedAboutParagraphs = [fcUnitedAboutP1, fcUnitedAboutP2Plain, fcUnitedAboutP3] as const;
