/** Encode each path segment so spaces and special chars work under `/public`. */
export function encodePublicPath(path: string): string {
  return path
    .split('/')
    .map((seg) => (seg ? encodeURIComponent(seg) : ''))
    .join('/');
}

const G = '/images/md_strikers_media/gallery';

/**
 * All media under `public/images/md_strikers_media/gallery`, MD Strikers-first order (featured flyer first).
 * Generic titles for ID-style or WhatsApp filenames; clearer titles where the file name is descriptive.
 */
export const mdStrikersLocalGalleryItems: {
  src: string;
  title: string;
  tag: string;
  kind: 'image' | 'video';
}[] = [
  {
    src: `${G}/capital_cup_2026_flyer.jpg`,
    title: 'Capital Cup 2026 Flyer',
    tag: 'League',
    kind: 'image',
  },
  { src: `${G}/540710111_806634078542604_6542700348383621762_n.jpg`, title: 'Photo 1', tag: 'Gallery', kind: 'image' },
  { src: `${G}/541052668_806846961854649_7779087015138011010_n.jpg`, title: 'Photo 2', tag: 'Gallery', kind: 'image' },
  { src: `${G}/541304738_806847011854644_4699455967375041486_n.jpg`, title: 'Photo 3', tag: 'Gallery', kind: 'image' },
  { src: `${G}/541383477_806847031854642_4397313207871964820_n.jpg`, title: 'Photo 4', tag: 'Gallery', kind: 'image' },
  { src: `${G}/541514177_806847081854637_1999285554025593235_n.jpg`, title: 'Photo 5', tag: 'Gallery', kind: 'image' },
  { src: `${G}/542119825_806847045187974_9040234045104242690_n.jpg`, title: 'Photo 6', tag: 'Gallery', kind: 'image' },
  { src: `${G}/542760242_806983045174374_669427754056647885_n.jpg`, title: 'Photo 7', tag: 'Gallery', kind: 'image' },
  { src: `${G}/543030861_806846955187983_2247439322602764927_n.jpg`, title: 'Photo 8', tag: 'Gallery', kind: 'image' },
  { src: `${G}/557711699_835491542323524_4213684225306293673_n.jpg`, title: 'Photo 9', tag: 'Gallery', kind: 'image' },
  { src: `${G}/558668612_841971301675548_700215800714885427_n.jpg`, title: 'Photo 10', tag: 'Gallery', kind: 'image' },
  { src: `${G}/559135755_842867244919287_3695873748149280128_n.jpg`, title: 'Photo 11', tag: 'Gallery', kind: 'image' },
  { src: `${G}/559961476_841971375008874_7095428434327322979_n.jpg`, title: 'Photo 12', tag: 'Gallery', kind: 'image' },
  { src: `${G}/560128775_841971385008873_8494190996753689898_n.jpg`, title: 'Photo 13', tag: 'Gallery', kind: 'image' },
  { src: `${G}/560332253_841971398342205_2634267871760409639_n.jpg`, title: 'Photo 14', tag: 'Gallery', kind: 'image' },
  { src: `${G}/560439030_841971358342209_1563382045942887463_n.jpg`, title: 'Photo 15', tag: 'Gallery', kind: 'image' },
  { src: `${G}/561345467_841971308342214_2312958033194469852_n.jpg`, title: 'Photo 16', tag: 'Gallery', kind: 'image' },
  { src: `${G}/564037338_17863115400483348_7676624527203712578_n.webp`, title: 'Photo 17', tag: 'Gallery', kind: 'image' },
  { src: `${G}/564852626_17863115427483348_789349214786533531_n.webp`, title: 'Photo 18', tag: 'Gallery', kind: 'image' },
  { src: `${G}/565011119_17863013796483348_2081891674633042317_n.webp`, title: 'Photo 19', tag: 'Gallery', kind: 'image' },
  { src: `${G}/565106197_17863115418483348_7160127010355423186_n.webp`, title: 'Photo 20', tag: 'Gallery', kind: 'image' },
  { src: `${G}/565136546_17863115409483348_574382761878722706_n.webp`, title: 'Photo 21', tag: 'Gallery', kind: 'image' },
  { src: `${G}/565205173_17863119078483348_2676205496732368629_n.webp`, title: 'Photo 22', tag: 'Gallery', kind: 'image' },
  { src: `${G}/565435224_17863013805483348_725749959752643477_n.webp`, title: 'Photo 23', tag: 'Gallery', kind: 'image' },
  { src: `${G}/608045651_906972915175386_994647378795377232_n.jpg`, title: 'Photo 24', tag: 'Gallery', kind: 'image' },
  { src: `${G}/641138304_946191441253533_92882215621024786_n.jpg`, title: 'Photo 25', tag: 'Gallery', kind: 'image' },
  { src: `${G}/646407715_953177520554925_6879138285398044263_n.jpg`, title: 'Photo 26', tag: 'Gallery', kind: 'image' },
  { src: `${G}/654698544_965227579349919_624228953345333564_n.jpg`, title: 'Photo 27', tag: 'Gallery', kind: 'image' },
  { src: `${G}/Capital-Cup-image.jpg`, title: 'Capital Cup', tag: 'articles', kind: 'image' },
  { src: `${G}/IM-Vijayan-Image.jpg`, title: 'IM Vijayan', tag: 'Soccer', kind: 'image' },
  { src: `${G}/IM-Vijayan-Image_news.jpg`, title: 'IM Vijayan — News', tag: 'articles', kind: 'image' },
  { src: `${G}/md_strikers_logo.jpeg`, title: 'Club logo', tag: 'articles', kind: 'image' },
  { src: `${G}/md_strikers_logo-withoutBackground.png`, title: 'Club logo (transparent)', tag: 'articles', kind: 'image' },
  { src: `${G}/Md-Strikers-image.jpg`, title: 'MD Strikers', tag: 'League', kind: 'image' },
  { src: `${G}/soccer-group.jpg`, title: 'Team photo', tag: 'Soccer', kind: 'image' },
  { src: `${G}/soccer-group-1.jpg`, title: 'Team photo 2', tag: 'Soccer', kind: 'image' },
  {
    src: `${G}/WhatsApp Image 2026-03-24 at 10.56.39 AM.jpeg`,
    title: 'Image 1',
    tag: 'Gallery',
    kind: 'image',
  },
  {
    src: `${G}/WhatsApp Image 2026-03-24 at 10.57.14 AM.jpeg`,
    title: 'Image 2',
    tag: 'Gallery',
    kind: 'image',
  },
  {
    src: `${G}/WhatsApp Image 2026-03-24 at 10.57.43 AM.jpeg`,
    title: 'Image 3',
    tag: 'Gallery',
    kind: 'image',
  },
  {
    src: `${G}/WhatsApp Video 2026-03-24 at 10.56.17 AM.mp4`,
    title: 'Video 1',
    tag: 'Gallery',
    kind: 'video',
  },
];

export const MD_STRIKERS_GALLERY_FILE_COUNT = 40;
