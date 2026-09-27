import {
  parseCsvAudienceFile,
  validPeopleFromParse,
  type AudiencePerson,
} from "@/lib/email/parse-audience";

export type CsvRecipient = AudiencePerson;

export function parseCsvAudience(raw: string): CsvRecipient[] {
  return validPeopleFromParse(parseCsvAudienceFile(raw));
}
