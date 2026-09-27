import fs from "fs";

const p = "src/components/search/SearchWidget.tsx";
let s = fs.readFileSync(p, "utf8");

if (s.includes('case "cars":') && s.includes("dailyTourHint")) {
  console.log("cars UI already present");
  process.exit(0);
}

// Detect autocomplete component name
const autoName = s.includes("function CityAutocomplete")
  ? "CityAutocomplete"
  : s.includes("function CityAutocomplete")
    ? "CityAutocomplete"
    : "CityAutocomplete";

const labelName = s.includes("const inputLabel")
  ? "inputLabel"
  : s.includes("const fieldLabel")
    ? "fieldLabel"
    : "inputLabel";

const dailyVar = s.includes("const [dailyTour")
  ? "dailyTour"
  : s.includes("const [isDailyTour")
    ? "isDailyTour"
    : "dailyTour";
const setDailyVar =
  dailyVar === "dailyTour"
    ? "setDailyTour"
    : dailyVar === "isDailyTour"
      ? "setIsDailyTour"
      : "setDailyTour";

const block = `
      case "cars":
        return (
          <>
            <div className="md:col-span-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-[#1e3a5f]">{t.search.dailyTour}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.search.dailyTourHint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={${dailyVar}}
                onClick={() => ${setDailyVar}((v) => !v)}
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors",
                  ${dailyVar} ? "bg-emerald-500" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
                    ${dailyVar} ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {!${dailyVar} && (
              <>
                <div className="md:col-span-5">
                  <label className={${labelName}}>{t.search.from}</label>
                  <${autoName}
                    value={fromCity}
                    onChange={setFromCity}
                    placeholder={
                      locale === "ar"
                        ? "مطار / مدينة / منطقة المغادرة"
                        : "Airport / city / district"
                    }
                    icon={MapPin}
                  />
                </div>
                <div className="md:col-span-5">
                  <label className={${labelName}}>{t.search.to}</label>
                  <${autoName}
                    value={toCity}
                    onChange={setToCity}
                    placeholder={
                      locale === "ar"
                        ? "مطار / مدينة / منطقة الوصول"
                        : "Airport / city / district"
                    }
                    icon={Car}
                  />
                </div>
              </>
            )}

            {${dailyVar} && (
              <div className="md:col-span-6">
                <label className={${labelName}}>{t.search.destination}</label>
                <${autoName}
                  value={fromCity}
                  onChange={setFromCity}
                  placeholder={t.search.destinationPlaceholder}
                  icon={Car}
                />
              </div>
            )}

            <div className={${dailyVar} ? "md:col-span-3" : "md:col-span-6"}>
              <label className={${labelName}}>{t.search.date}</label>
              <div className="relative">
                <Calendar className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full ps-12 pe-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className={${dailyVar} ? "md:col-span-3" : "md:col-span-6"}>
              <label className={${labelName}}>{t.search.time}</label>
              <div className="relative">
                <Clock className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full ps-12 pe-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 font-medium"
                />
              </div>
            </div>
          </>
        );

`;

const patterns = [
  "      default: {\n        const _exhaustive: never = activeTab;",
  "      default: {\n        const _exhaustive: never = activeTab;",
  "      default: {\n        const neverCheck: never = activeTab;",
  "      default: {\n        const _exhaustiveCheck: never = activeTab;",
];

let replaced = false;
for (const needle of patterns) {
  if (s.includes(needle)) {
    s = s.replace(needle, block + needle);
    replaced = true;
    break;
  }
}

if (!replaced) {
  // fallback: insert before first "default: {" inside renderTabContent-ish area
  const idx = s.lastIndexOf("\n      default: {");
  if (idx < 0) {
    console.error("Could not find default case");
    process.exit(1);
  }
  s = s.slice(0, idx) + "\n" + block + s.slice(idx);
}

// Ensure locale is available from useLocale
if (!s.includes("const { t, locale }") && s.includes("const { t } = useLocale()")) {
  s = s.replace("const { t } = useLocale()", "const { t, locale } = useLocale()");
}

fs.writeFileSync(p, s);
console.log("Inserted cars UI case using", { autoName, labelName, dailyVar });
