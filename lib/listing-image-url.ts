const cardTransform = "c_fill,w_640,h_360,q_auto,f_auto";

export function getListingCardImageUrl(source: string) {
  const marker = "/image/upload/";

  if (!source.includes("res.cloudinary.com") || !source.includes(marker)) {
    return source;
  }

  return source.replace(marker, `${marker}${cardTransform}/`);
}
