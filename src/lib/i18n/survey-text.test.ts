import { describe, expect, it } from "vitest";
import { QUESTION_BANK } from "../analysis";
import { SURVEY_LANGS, surveyText } from "./survey-text";

describe("survey texts", () => {
  it("has every text in every language, with Finnish filling gaps in the Sámi draft", () => {
    const fi = surveyText("fi");
    for (const { code } of SURVEY_LANGS) {
      const t = surveyText(code);
      for (const key of Object.keys(fi) as (keyof typeof fi)[]) {
        if (key === "draftNote" || key === "followUps") continue;
        expect(t[key], `${code}.${key}`).toBeTruthy();
      }
      expect(Object.keys(t.placement)).toEqual(Object.keys(fi.placement));
      expect(t.education).toHaveLength(6);
      expect(t.packYears(30)).toContain("30");
    }
  });

  it("translates every follow-up question in the fully translated languages", () => {
    for (const code of ["sv", "ru", "et", "uk", "en", "ar"] as const) {
      for (const q of QUESTION_BANK) expect(surveyText(code).followUps[q.id], `${code}.${q.id}`).toBeTruthy();
    }
  });

  it("keeps the emergency number 112 in every language", () => {
    for (const { code } of SURVEY_LANGS) {
      expect(surveyText(code).emergency).toContain("112");
      expect(surveyText(code).bloodEmergency).toContain("112");
    }
  });

  it("marks only Arabic as right-to-left", () => {
    expect(SURVEY_LANGS.filter((l) => l.dir === "rtl").map((l) => l.code)).toEqual(["ar"]);
  });
});
