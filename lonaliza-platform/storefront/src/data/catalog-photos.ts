/** Public Unsplash photos of real Turkey landmarks, hotels, and landscapes. */

export const PHOTO = {
  hagiaSophia:
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=80",
  blueMosque:
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1600&q=80",
  istanbulSkyline:
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1600&q=80",
  bosphorus:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
  grandBazaar:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80",
  galata:
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1600&q=80",
  cappadociaValley:
    "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=1600&q=80",
  cappadociaBalloons:
    "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1600&q=80",
  balloonsSunrise:
    "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1600&q=80",
  antalyaCoast:
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1600&q=80",
  mediterraneanBeach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  aegeanCoast:
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1600&q=80",
  yachtHarbor:
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80",
  mountains:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  alpineLake:
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80",
  forest:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80",
  waterfall:
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1600&q=80",
  landscape:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80",
  whiteTerraces:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
  ancientRuins:
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600&q=80",
  mosqueInterior:
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80",
  luxuryHotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
  hotelPool:
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80",
  hotelLobby:
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80",
  hotelRoom:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80",
  caveHotel:
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80",
  breakfast:
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1600&q=80",
  food:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
  teaGarden:
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1600&q=80",
  mercedesSedan:
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&q=80",
  luxurySedan:
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80",
  carInterior:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80",
  mercedesVan:
    "/images/cars/mercedes-vito-vip.jpg",
  sprinter:
    "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1600&q=80",
  minibus:
    "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1600&q=80",
  suv:
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=80",
  bmw:
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=80",
  princesIslands:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
  belgradForest:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80",
  coastalTown:
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1600&q=80",
  nightCity:
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&q=80",
} as const;

export function photos(...urls: string[]) {
  return urls.map((url) => ({
    url,
    alt: "Turkey travel",
    width: 1600,
    height: 1067,
  }));
}
