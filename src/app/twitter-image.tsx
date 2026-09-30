/**
 * The same card for X, which does not fall back to the Open Graph image on its
 * own — Next writes `twitter:card` and the title, but no `twitter:image`, until
 * this file exists. One image, two conventions.
 */
export { alt, contentType, default, size } from "./opengraph-image";
