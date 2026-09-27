import { writeFileSync } from "fs";
import { defaultHotels } from "../../src/data/hotels";

writeFileSync(
  new URL("./.tmp-hotels-export.json", import.meta.url),
  JSON.stringify(defaultHotels, null, 2)
);
console.log("exported", defaultHotels.length);
