/** Static mirror assets + copy from wget FC United theme */
export const FC_IMG = '/images/fc-united';

/** Cropped squad portraits from `public/images/md_strikers_media/squad/members/` (`npm run split-squad`) */
export const FC_SQUAD_MEMBERS = '/images/md_strikers_media/squad/members';

export const fcNewsItems = [
  { title: 'Soccer World Cup Finals', date: 'Monday, September 10, 2018' },
  { title: 'The Team that You Support!', date: 'Friday, September 14, 2018' },
  { title: 'Why Soccer is the Best Sport', date: 'Saturday, September 22, 2018' },
];

export const fcMatchBlocks = [
  {
    home: '/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png',
    away: `${FC_IMG}/go-3-copyright-400x400.png`,
    date: 'July 11, 2018',
    score: ['3', '1'],
    league: 'Premier League',
    title: 'First Match',
  },
  {
    home: '/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png',
    away: `${FC_IMG}/go-2-copyright-400x400.png`,
    date: 'July 18, 2018',
    score: ['1', '1'],
    league: 'Premier League',
    title: 'Second Match',
  },
  {
    home: '/images/md_strikers_media/md_media/md_strikers_logo-withoutBackground.png',
    away: `${FC_IMG}/go-1-copyright-400x400.png`,
    date: 'July 25, 2018',
    score: ['2', '3'],
    league: 'Premier League',
    title: 'Third Match',
  },
];

export const fcLeagueRows = [
  { pos: '1', club: 'FC United', p: '39', w: '29', d: '4', l: '2', f: '106', a: '29', gd: '76', pts: '50' },
  { pos: '2', club: 'FC Manchester', p: '38', w: '25', d: '4', l: '2', f: '106', a: '27', gd: '75', pts: '50' },
  { pos: '2', club: 'West Ham United', p: '31', w: '23', d: '4', l: '2', f: '106', a: '24', gd: '75', pts: '50' },
  { pos: '4', club: 'Blackburn', p: '29', w: '26', d: '4', l: '2', f: '106', a: '25', gd: '74', pts: '50' },
  { pos: '5', club: 'Tottenham', p: '28', w: '24', d: '4', l: '2', f: '106', a: '26', gd: '73', pts: '45' },
];

/** From wget `events-list` / The Events Calendar demo */
export const fcEventsListItems = [
  {
    day: '18',
    month: 'Feb',
    title: 'Super Junior League',
    time: 'February 18, 2019 – March 24, 2019',
    cost: '$29',
    blurb:
      'Suspendisse sit amet pretium orci. Aliquam erat volutpat. Quisque tortor ipsum, mattis scelerisque vitae, malesuada nulla.',
  },
  {
    day: '13',
    month: 'Mar',
    title: 'Meet the Idol – Famous Players Meet & Greet',
    time: 'March 13, 2019 10:00 – April 12, 2019 15:00',
    cost: 'free',
    blurb:
      'Suspendisse sit amet pretium orci. Aliquam erat volutpat. Quisque tortor ipsum, mattis scelerisque vitae, malesuada nulla.',
  },
  {
    day: '12',
    month: 'Apr',
    title: 'Training with a Famous Coach',
    time: 'April 12, 2019 – May 24, 2021',
    cost: 'free',
    blurb:
      'Suspendisse sit amet pretium orci. Aliquam erat volutpat. Quisque tortor ipsum, mattis scelerisque vitae, malesuada nulla.',
  },
  {
    day: '01',
    month: 'Jan',
    title: 'New Season Warmup Games',
    time: 'January 1, 2020 14:00 – January 24, 2022 17:00',
    cost: 'free',
    blurb:
      'Suspendisse sit amet pretium orci. Aliquam erat volutpat. Quisque tortor ipsum, mattis scelerisque vitae, malesuada nulla.',
  },
  {
    day: '18',
    month: 'Jan',
    title: 'Team Members Announcement',
    time: 'January 18, 2020 18:00 – February 10, 2022 19:00',
    cost: 'free',
    blurb:
      'Suspendisse sit amet pretium orci. Aliquam erat volutpat. Quisque tortor ipsum, mattis scelerisque vitae, malesuada nulla.',
  },
];

export const fcSponsors = ['artboard1', 'artboard2', 'artboard3', 'artboard4', 'artboard5', 'artboard6'].map(
  (n) => `${FC_IMG}/${n}-copyright.png`,
);
