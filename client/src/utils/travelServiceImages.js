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

/* Shared deterministic HD image pools so every product ALWAYS displays the exact same photo
   across List page (/travel/*), Payment page (/travel-service-payment/:id), and My Services (/my-travel-services). */
export const SHARED_HOTEL_IMAGE_IDS = [
  "photo-1566073771259-6a8506099945",
  "photo-1582719508461-905c673771fd",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1571896349842-33c89424de2d",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1564501049412-61c2a3083791",
  "photo-1551882547-ff40c63fe5fa",
  "photo-1566665797739-1674de7a421a",
  "photo-1590490360182-c33d57733427",
  "photo-1578683010236-d716f9a3f461",
  "photo-1611892440504-42a792e24d32",
  "photo-1596394516093-501ba68a0ba6",
  "photo-1566195992011-5f6b21e539aa",
  "photo-1512918728675-ed5a9ecdebfd",
  "photo-1568084680786-a84f91d1153c",
  "photo-1564013799919-ab600027ffc6",
  "photo-1535827841776-24afc1e255ac",
  "photo-1445019980597-93fa8acb246c",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1510798831971-661eb04b3739",
  "photo-1470770841072-f978cf4d019e",
  "photo-1584132967334-10e028bd69f7",
  "photo-1590073242678-70ee3fc28e8e",
  "photo-1540541338287-41700207dee6",
  "photo-1563911302283-d2bc129e7570",
  "photo-1576675784201-0e142b423952",
  "photo-1587985064135-0366536eab42",
  "photo-1591088398332-8a7791972843",
  "photo-1618773928121-c32242e63f39",
  "photo-1595576508898-0ad5c879a061",
  "photo-1560448204-e02f11c3d0e2",
];

export const SHARED_EXPERIENCE_IMAGE_IDS = [
  "photo-1528127269322-539801943592",
  "photo-1555939594-58d7cb561ad1",
  "photo-1507525428034-b723cf961d3e",
  "photo-1583417319070-4a69db38a482",
  "photo-1500375592092-40eb2168fd21",
  "photo-1544551763-46a013bb70d5",
  "photo-1504674900247-0877df9cc836",
  "photo-1518005020951-eccb494ad742",
  "photo-1470770841072-f978cf4d019e",
  "photo-1441974231531-c6227db76b6e",
  "photo-1433086966358-54859d0ed716",
  "photo-1519608487953-e999c86e7455",
  "photo-1442512595331-e89e73853f31",
  "photo-1476514525535-07fb3b4ae5f1",
  "photo-1506744038136-46273834b3fb",
  "photo-1501785888041-af3ef285b470",
  "photo-1530789253388-582c481c54b0",
  "photo-1469854523086-cc02fe5d8800",
  "photo-1502082553048-f009c37129b9",
  "photo-1519046904884-53103b34b206",
  "photo-1510414842594-a61c69b5ae57",
  "photo-1540555700478-4be289fbecef",
  "photo-1512100356356-de1b84283e18",
  "photo-1537996194471-e657df975ab4",
  "photo-1552465011-b4e21bf6e79a",
  "photo-1516483638261-f4dbaf036963",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1504280390367-361c6d9f38f4",
  "photo-1513635269975-59663e0ac1ad",
  "photo-1493976040374-85c8e12f0c0e",
  "photo-1503899036084-c55cdd92da26",
];

export const SHARED_CAR_IMAGE_IDS = [
  "photo-1590362891991-f776e747a588",
  "photo-1563720223185-11003d516935",
  "photo-1606664515524-ed2f786a0bd6",
  "photo-1609521263047-f8f205293f24",
  "photo-1549317661-bd32c8ce0db2",
  "photo-1552519507-da3b142c6e3d",
  "photo-1503376780353-7e6692767b70",
  "photo-1541899481282-d53bffe3c35d",
  "photo-1494976388531-d1058494cdd8",
  "photo-1502877338535-766e1452684a",
  "photo-1519641471654-76ce0107ad1b",
  "photo-1503736334956-4c8f8e92946d",
  "photo-1542362567-b07e54358753",
  "photo-1551830820-330a71b99659",
  "photo-1617531653332-bd46c24f2068",
  "photo-1511919884226-fd3cad34687c",
  "photo-1492144534655-ae79c964c9d7",
  "photo-1493238792000-8113da705763",
  "photo-1504215680853-026ed2a45def",
  "photo-1580273916550-e323be2ae537",
  "photo-1605559424843-9e4c228bf1c2",
  "photo-1619767886558-efdc259cde1a",
  "photo-1553440569-bcc63803a83d",
  "photo-1544636331-e26879cd4d9b",
  "photo-1568605117036-5fe5e7bab0b7",
  "photo-1570733577524-3a047079e80d",
  "photo-1617788138017-80ad40651399",
  "photo-1618843479313-40f8afb4b4d8",
  "photo-1555215695-3004980ad54e",
  "photo-1507136566006-cfc505b114fc",
];

/**
 * Deterministic Single Source of Truth for Travel Product Images.
 * Given a product (with `id` and `type`), always returns the exact same HD Unsplash photo
 * across TravelServicesPage, TravelServicePayment, and MyTravelServices.
 */
export const getCanonicalTravelProductImage = (product, fallbackType = "hotel", width = 1000) => {
  const explicitUrl = product?.image_url || product?.details?.image_url;
  if (explicitUrl && typeof explicitUrl === "string" && explicitUrl.startsWith("http")) {
    return normalizeHotelImageUrl(explicitUrl);
  }

  const type = product?.type || fallbackType;
  const numericId = Math.abs(Number(product?.id) || 0);

  const pool =
    type === "car"
      ? SHARED_CAR_IMAGE_IDS
      : type === "experience"
        ? SHARED_EXPERIENCE_IMAGE_IDS
        : SHARED_HOTEL_IMAGE_IDS;

  const imageId = pool[numericId % pool.length];
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=${width}&q=85`;
};
