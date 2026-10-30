import { Barlow_Condensed, Bebas_Neue, Inter, Poppins, Roboto } from 'next/font/google';

export const fcBebas = Bebas_Neue({ weight: '400', subsets: ['latin'] });
export const fcPoppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
export const fcRoboto = Roboto({ weight: ['400', '500'], subsets: ['latin'] });

const fcInter = Inter({ subsets: ['latin'], variable: '--font-md-body' });
const fcBarlowCondensed = Barlow_Condensed({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-md-display',
});

/**
 * MD Strikers brand typography: Inter for body text, Barlow Condensed for headings
 * (headings pick it up through the `.md-brand` rules in globals.css).
 */
export const fcBrand = {
  className: `${fcInter.className} ${fcInter.variable} ${fcBarlowCondensed.variable} md-brand`,
};
