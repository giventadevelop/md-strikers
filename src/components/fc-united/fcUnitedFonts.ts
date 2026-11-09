import { Barlow, Barlow_Condensed, Bebas_Neue, Caprasimo, Figtree, Inter, Manrope, Poppins, Roboto } from 'next/font/google';

export const fcBebas = Bebas_Neue({ weight: '400', subsets: ['latin'] });
export const fcPoppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
export const fcRoboto = Roboto({ weight: ['400', '500'], subsets: ['latin'] });

const fcInter = Inter({ subsets: ['latin'], variable: '--font-md-body' });
const fcBarlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-md-display',
});

const fcCaprasimo = Caprasimo({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-organic-display',
});

const fcFigtree = Figtree({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-organic-body',
});

/**
 * MD Strikers brand typography: Inter for body text, Barlow Condensed for headings
 * (headings pick it up through the `.md-brand` rules in globals.css).
 */
export const fcBrand = {
  className: `${fcInter.className} ${fcInter.variable} ${fcBarlowCondensed.variable} md-brand`,
};

const fcManrope = Manrope({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-elite-display',
});

/** Barlow pairs with Barlow Condensed: the closest open stand-in for the club's proprietary faces. */
const fcBarlow = Barlow({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-md-club',
});

/** Homepage type. Headings use Barlow Condensed; body, nav, and footer use Barlow. */
export const fcOrganic = {
  className: `${fcCaprasimo.variable} ${fcFigtree.variable} ${fcManrope.variable} ${fcBarlow.variable}`,
};
