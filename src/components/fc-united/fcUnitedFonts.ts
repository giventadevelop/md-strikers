import { Bebas_Neue, Manrope, Poppins, Roboto } from 'next/font/google';

export const fcBebas = Bebas_Neue({ weight: '400', subsets: ['latin'] });
export const fcPoppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
export const fcRoboto = Roboto({ weight: ['400', '500'], subsets: ['latin'] });
/** Editorial sans for the "pitch" design system (homepage, header, footer). */
export const fcManrope = Manrope({ weight: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
