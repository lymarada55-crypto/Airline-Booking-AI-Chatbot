const hotelImageReplacements = {
  "photo-1571003123894-1cbf6d2d8f6f": "photo-1512918728675-ed5a9ecdebfd",
  "photo-1511895426328-dc8714191300": "photo-1535827841776-24afc1e255ac",
  "photo-1518732714860-b62714ce0c59": "photo-1505693416388-ac5ce068fe85",
  "photo-1500530855697-b586d89ba3ee": "photo-1564013799919-ab600027ffc6",
  "photo-1530789253388-582c481c54b0": "photo-1564013799919-ab600027ffc6",
  "photo-1517248135467-4c7edcad34c4": "photo-1590490360182-c33d57733427",
  "photo-1602002418082-aabf4d0c3f6c": "photo-1445019980597-93fa8acb246c",
};

export const normalizeHotelImageUrl = (imageUrl) => {
  if (!imageUrl) return imageUrl;

  return Object.entries(hotelImageReplacements).reduce(
    (url, [oldImageId, replacementImageId]) => url.replace(oldImageId, replacementImageId),
    imageUrl
  );
};
