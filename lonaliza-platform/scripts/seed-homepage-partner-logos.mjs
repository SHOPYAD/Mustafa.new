#!/usr/bin/env node
/**
 * Agent B: public homepage content
 * Persist curated airline + hotel logo records into `.data/`.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const KIWI = "https://images.kiwi.com/airlines/64";

const AIRLINE_IATAS = [
  "EK","EY","QR","GF","WY","SV","XY","F3","FZ","G9","3L","J9","KU","OV",
  "RJ","ME","MS","NP","SM","IA","IF","CY","LY","TK","PC","VF","XQ","FH","XC","TI",
  "AT","TU","AH","BJ","8U","LH","BA","AF","KL","IB","AZ","LX","OS","SN","SK","AY",
  "TP","EI","A3","W6","FR","U2","LS","EW","VY","DY","LO","OK","RO","JU","BT","HV",
  "DE","X3","V7","QS","AA","DL","UA","WN","B6","AS","NK","F9","HA","AC","WS","AM",
  "SQ","CX","NH","JL","KE","OZ","CI","BR","TG","MH","GA","PR","VN","QF","NZ","AI",
  "6E","UK","SG","CA","MU","CZ","HU","TR","AK","FD","5J","D7","ET","KQ","SA","WB",
  "HM","KC","HY","J2","A9","IR","W5",
];

const HOTELS = [
  ["fs-sultanahmet","Four Seasons Hotel Istanbul at Sultanahmet","فورسيزونز السلطان أحمد","Istanbul","إسطنبول",5,"fourseasons.com"],
  ["fs-bosphorus","Four Seasons Hotel Istanbul at the Bosphorus","فورسيزونز البوسفور","Istanbul","إسطنبول",5,"fourseasons.com"],
  ["ciragan-kempinski","Çırağan Palace Kempinski Istanbul","قصر تشراغان كمبينسكي","Istanbul","إسطنبول",5,"kempinski.com"],
  ["raffles-ist","Raffles Istanbul","رافلز إسطنبول","Istanbul","إسطنبول",5,"raffles.com"],
  ["cvk-park","CVK Park Bosphorus Hotel Istanbul","سي في كيه بارك البوسفور","Istanbul","إسطنبول",5,"cvkhotelsandresorts.com"],
  ["ritz-ist","The Ritz-Carlton, Istanbul","ريتز كارلتون إسطنبول","Istanbul","إسطنبول",5,"ritzcarlton.com"],
  ["mo-bosphorus","Mandarin Oriental Bosphorus, Istanbul","ماندارين أورينتال البوسفور","Istanbul","إسطنبول",5,"mandarinoriental.com"],
  ["shangri-la-ist","Shangri-La Bosphorus, Istanbul","شانغريلا البوسفور","Istanbul","إسطنبول",5,"shangri-la.com"],
  ["swissotel-ist","Swissôtel The Bosphorus Istanbul","سويسوتيل البوسفور","Istanbul","إسطنبول",5,"swissotel.com"],
  ["peninsula-ist","The Peninsula Istanbul","ذا بنينسولا إسطنبول","Istanbul","إسطنبول",5,"peninsula.com"],
  ["six-senses-ist","Six Senses Kocatas Mansions, Istanbul","سيكس سنسز قوجاتاش","Istanbul","إسطنبول",5,"sixsenses.com"],
  ["pera-palace","Pera Palace Hotel","بيرا بالاس","Istanbul","إسطنبول",5,"perapalace.com"],
  ["st-regis-ist","The St. Regis Istanbul","سانت ريجيس إسطنبول","Istanbul","إسطنبول",5,"marriott.com"],
  ["fairmont-ist","Fairmont Quasar Istanbul","فيرمونت كوازار","Istanbul","إسطنبول",5,"fairmont.com"],
  ["jw-bosphorus","JW Marriott Istanbul Bosphorus","جي دبليو ماريوت البوسفور","Istanbul","إسطنبول",5,"marriott.com"],
  ["conrad-ist","Conrad Istanbul Bosphorus","كونراد البوسفور","Istanbul","إسطنبول",5,"hilton.com"],
  ["hilton-bosphorus","Hilton Istanbul Bosphorus","هيلتون إسطنبول البوسفور","Istanbul","إسطنبول",5,"hilton.com"],
  ["intercont-ist","InterContinental Istanbul","إنتركونتيننتال إسطنبول","Istanbul","إسطنبول",5,"ihg.com"],
  ["rixos-belek","Rixos Premium Belek","ريكوس بريميوم بيليك","Antalya","أنطاليا",5,"rixos.com"],
  ["rixos-sungate","Rixos Sungate","ريكوس صن غيت","Antalya","أنطاليا",5,"rixos.com"],
  ["titanic-mardan","Titanic Mardan Palace","تيتانيك مردان بالاس","Antalya","أنطاليا",5,"titanic.com.tr"],
  ["titanic-lara","Titanic Deluxe Lara","تيتانيك ديلوكس لارا","Antalya","أنطاليا",5,"titanic.com.tr"],
  ["maxx-belek","Maxx Royal Belek Golf Resort","ماكس رويال بيليك","Antalya","أنطاليا",5,"maxxroyal.com"],
  ["maxx-kemer","Maxx Royal Kemer Resort","ماكس رويال كمر","Antalya","أنطاليا",5,"maxxroyal.com"],
  ["regnum-carya","Regnum Carya","ريغنوم كاريا","Antalya","أنطاليا",5,"regnumhotels.com"],
  ["calista","Calista Luxury Resort","كاليستا لاكشري","Antalya","أنطاليا",5,"calista.com.tr"],
  ["gloria-serenity","Gloria Serenity Resort","غلوريا سيرينيتي","Antalya","أنطاليا",5,"gloria.com.tr"],
  ["cornelia-diamond","Cornelia Diamond Golf Resort & Spa","كورنيليا دايموند","Antalya","أنطاليا",5,"corneliaresort.com"],
  ["akra","Akra Hotel","أكرا أنطاليا","Antalya","أنطاليا",5,"akrahotels.com"],
  ["susesi","Susesi Luxury Resort","سوسيسي لاكشري","Antalya","أنطاليا",5,"susesihotel.com"],
  ["ng-phaselis","NG Phaselis Bay","إن جي فاسيليس باي","Antalya","أنطاليا",5,"nghotels.com.tr"],
  ["limak-lara","Limak Lara Deluxe Hotel & Resort","ليماك لارا ديلوكس","Antalya","أنطاليا",5,"limakhotels.com"],
  ["ic-green","IC Hotels Green Palace","آي سي جرين بالاس","Antalya","أنطاليا",5,"ichotels.com.tr"],
  ["nirvana-cosmo","Nirvana Cosmopolitan","نيرفانا كوزموبوليتان","Antalya","أنطاليا",5,"nirvanahotels.com"],
  ["zorlu-grand","Zorlu Grand Hotel","زورلو جراند هوتيل","Trabzon","طرابزون",5,"zorlugrand.com"],
  ["novotel-tzx","Novotel Trabzon","نوفوتيل طرابزون","Trabzon","طرابزون",5,"accor.com"],
  ["hgi-tzx","Hilton Garden Inn Trabzon","هيلتون جاردن إن طرابزون","Trabzon","طرابزون",4,"hilton.com"],
  ["radisson-tzx","Radisson Blu Hotel Trabzon","راديسون بلو طرابزون","Trabzon","طرابزون",5,"radissonhotels.com"],
  ["dedeman-tzx","Park Dedeman Trabzon","بارك ديديمان طرابزون","Trabzon","طرابزون",4,"dedeman.com"],
  ["usta-park","Usta Park Hotel","أوستا بارك","Trabzon","طرابزون",4,"ustaparkhotel.com"],
  ["sera-lake","Sera Lake Resort Hotel","سيرا ليك ريزورت","Trabzon","طرابزون",5,"seralakehotel.com"],
  ["grand-vaves","Grand Vaves Hotel","جراند فافيس","Trabzon","طرابزون",4,"grandvaves.com"],
  ["horon","Horon Hotel","هورون هوتيل","Trabzon","طرابزون",4,"horonhotel.com"],
  ["royal-rezidans","Royal Rezidans Trabzon","رويال رزدانس طرابزون","Trabzon","طرابزون",4,"royalrezidans.com"],
];

async function main() {
  const unique = [...new Set(AIRLINE_IATAS)];
  const existing = JSON.parse(
    await fs.readFile(path.join(ROOT, ".data", "airlines", "airlines.json"), "utf8")
  );
  const byIata = new Map(existing.map((row) => [String(row.iata || "").toUpperCase(), row]));
  const showcase = unique.map((iata) => {
    const found = byIata.get(iata);
    return (
      found || {
        iata,
        icao: "",
        name: iata,
        country: "",
        logoUrl: `${KIWI}/${iata}.png`,
        aliases: [],
      }
    );
  });

  await fs.writeFile(
    path.join(ROOT, ".data", "airlines", "homepage-showcase.json"),
    JSON.stringify(showcase, null, 2)
  );

  const hotelsDir = path.join(ROOT, ".data", "partner-hotels");
  await fs.mkdir(hotelsDir, { recursive: true });
  const hotels = HOTELS.map(([id, name, nameAr, city, cityAr, stars, domain]) => ({
    id,
    name,
    nameAr,
    city,
    cityAr,
    stars,
    domain,
    logoUrl: `https://logo.clearbit.com/${domain}`,
  }));
  await fs.writeFile(path.join(hotelsDir, "hotels.json"), JSON.stringify(hotels, null, 2));
  await fs.writeFile(
    path.join(hotelsDir, "meta.json"),
    JSON.stringify(
      {
        source: "homepage-catalog",
        importedAt: new Date().toISOString(),
        hotelCount: hotels.length,
      },
      null,
      2
    )
  );

  console.log(`airlines showcase: ${showcase.length}`);
  console.log(`hotels stored: ${hotels.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
