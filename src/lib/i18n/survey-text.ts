// Respondent-facing survey texts in eight languages.
//
// Languages cover 97.9 % of 55–79-year-olds in Finland and 99.2 % in Lapland by
// registered mother tongue (StatFin 11rl, end of 2025; see docs/DATA_NOTES.md).
// DRAFT TRANSLATIONS made by the team with AI help. A native speaker with health-care
// background must review each language before real use. The Northern Sámi version is
// partial: missing texts fall back to Finnish.
//
// Only labels change. Stored answer values (symptom keys, visit reasons, "kyllä"/"ei")
// stay the same in every language, so Delun's rules work unchanged.

import type { Placement } from "../types";

export type SurveyLang = "fi" | "sv" | "se" | "ru" | "et" | "uk" | "en" | "ar";

export const SURVEY_LANGS: { code: SurveyLang; name: string; dir: "ltr" | "rtl"; draft?: boolean }[] = [
  { code: "fi", name: "Suomi", dir: "ltr" },
  { code: "sv", name: "Svenska", dir: "ltr" },
  { code: "se", name: "Davvisámegiella", dir: "ltr", draft: true },
  { code: "ru", name: "Русский", dir: "ltr" },
  { code: "et", name: "Eesti", dir: "ltr" },
  { code: "uk", name: "Українська", dir: "ltr" },
  { code: "en", name: "English", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
];

export type SymptomKey = "blood_in_sputum" | "breathlessness" | "chest_pain" | "weight_loss";
/** Visit reason values are Finnish words that Delun's rules match. Never translate the values. */
export type VisitValue = "" | "yskä" | "flunssa" | "keuhkokuume" | "astma";

export interface SurveyText {
  steps: [string, string, string, string];
  next: string;
  back: string;
  stepOf: (i: number, n: number) => string;
  decrease: string;
  increase: string;
  fillRequired: string;
  chooseLanguage: string;
  language: string;
  draftNote: string;
  title: string;
  intro: string;
  emergency: string;
  age: string;
  smokingQuestion: string;
  smokingCurrent: string;
  smokingFormer: string;
  smokingNever: string;
  cigsPerDay: string;
  yearsSmoked: string;
  packYears: (n: number) => string;
  yearsSinceQuit: string;
  plcoTitle: string;
  plcoNote: string;
  raceLabel: string;
  raceNone: string;
  educationLabel: string;
  education: [string, string, string, string, string, string];
  choose: string;
  weight: string;
  height: string;
  copd: string;
  personalCancer: string;
  familyLungCancer: string;
  no: string;
  yes: string;
  plcoFooter: string;
  coughWeeks: string;
  symptomsLegend: string;
  symptoms: Record<SymptomKey, string>;
  bloodEmergency: string;
  pneumonias: string;
  visitQuestion: string;
  visit: Record<VisitValue, string>;
  monthsAgo: string;
  freeText: string;
  send: string;
  sending: string;
  symptomReview: string;
  placement: Record<Placement, string>;
  riskTitle: (pct: string) => string;
  riskMore: string;
  riskNote: string;
  riskAge: string;
  imputedNote: string;
  followUpTitle: string;
  followUpHint: string;
  followUpSend: string;
  thanks: string;
  loading: string;
  newAnswer: string;
  answerYes: string;
  answerNo: string;
  /** Follow-up questions by question-bank id (analysis.ts). Missing ids show the Finnish text. */
  followUps: Partial<Record<string, string>>;
}

const fi: SurveyText = {
  steps: ["Sinusta","Tupakointi","Oireet","Lopuksi"],
  next: "Seuraava",
  back: "Takaisin",
  stepOf: (i, n) => `Vaihe ${i}/${n}`,
  decrease: "Vähennä",
  increase: "Lisää",
  fillRequired: "Täytä kaikki kohdat jatkaaksesi.",
  chooseLanguage: "Valitse kieli",
  language: "Kieli",
  draftNote: "",
  title: "Keuhkojen terveyskysely",
  intro: "Kaksi minuuttia. Käytä kuvitteellisia tietoja.",
  emergency: "Tämä kysely ei ole kiireellinen palvelu. Jos sinulla on äkillisiä tai vakavia oireita, soita 112 tai Päivystysapuun 116117.",
  age: "Ikä",
  smokingQuestion: "Tupakoitko tai oletko tupakoinut?",
  smokingCurrent: "Tupakoin",
  smokingFormer: "Olen lopettanut",
  smokingNever: "En koskaan",
  cigsPerDay: "Savukkeita päivässä",
  yearsSmoked: "Tupakointivuosia yhteensä",
  packYears: (n) => `Yhteensä ${n} askivuotta`,
  yearsSinceQuit: "Kuinka monta vuotta sitten lopetit tupakoinnin?",
  plcoTitle: "PLCOm2012-seulontariskin lisätiedot",
  plcoNote:
    "Tämä on yhdysvaltalainen malli, jota ei ole validoitu Suomen väestölle. Demo näyttää mallin laskeman arvion vain tutkimusesimerkkinä; se ei muuta oireohjausta.",
  raceLabel: "Alkuperäisen mallin väestöluokka (vapaaehtoinen)",
  raceNone: "Ei vastausta (vertailuluokka)",
  educationLabel: "Koulutus (mallin 6 luokkaa)",
  education: [
    "1 · Ei toisen asteen tutkintoa",
    "2 · Toisen asteen tutkinto",
    "3 · Toisen asteen jälkeistä koulutusta",
    "4 · Jonkin verran korkeakouluopintoja",
    "5 · Korkeakoulututkinto",
    "6 · Jatko- tai ammatillinen tutkinto",
  ],
  choose: "Valitse",
  weight: "Paino (kg)",
  height: "Pituus (cm)",
  copd: "Keuhkoahtaumatauti (COPD)",
  personalCancer: "Aiempi syöpä",
  familyLungCancer: "Keuhkosyöpä lähisuvussa",
  no: "Ei",
  yes: "Kyllä",
  plcoFooter: "Tupakoinnin määrä, kesto ja lopettamisesta kulunut aika täytetään yllä. Puuttuvat tiedot täydennetään mallin keskiarvoilla.",
  coughWeeks: "Kuinka monta viikkoa sinulla on ollut yskää? (0 = ei yskää)",
  symptomsLegend: "Onko sinulla ollut viimeisen kuukauden aikana:",
  symptoms: {
    blood_in_sputum: "Verta yskösissä",
    breathlessness: "Hengenahdistusta, joka on uutta tai pahentunut",
    chest_pain: "Rintakipua",
    weight_loss: "Laihtumista, vaikka et ole yrittänyt laihtua",
  },
  bloodEmergency: "Jos yskit verta runsaasti tai jatkuvasti, tai sinulla on samalla vaikea hengenahdistus tai rintakipu, soita heti 112.",
  pneumonias: "Kuinka monta kertaa sinulla on ollut keuhkokuume viimeisen vuoden aikana?",
  visitQuestion: "Olitko lääkärissä hengitysoireiden takia?",
  visit: { "": "En", yskä: "Kyllä, yskä", flunssa: "Kyllä, flunssa", keuhkokuume: "Kyllä, keuhkokuume", astma: "Kyllä, astma" },
  monthsAgo: "Kuinka monta kuukautta sitten?",
  freeText: "Kerro halutessasi omin sanoin, millä tahansa kielellä",
  send: "Lähetä",
  sending: "Lähetetään…",
  symptomReview: "Kiitos! Ammattilainen arvioi ilmoittamasi oireet. Tämä ei ole diagnoosi.",
  placement: {
    direct_ct: "Kiitos! Lääkäri arvioi, tarvitaanko TT-tutkimusta. Sovellus ei tee lähetettä automaattisesti.",
    physician_fast: "Kiitos! Vastauksesi perusteella sinulle varataan lääkäriaika lähipäivinä. Saat tekstiviestin.",
    normal_route: "Kiitos! Vastauksesi perusteella kiireellistä tarvetta ei nyt ole. Jos oireita tulee, ota yhteyttä terveysasemalle.",
    not_eligible: "Kiitos vastauksestasi! Kysely on tarkoitettu tupakoineille 55–80-vuotiaille.",
  },
  riskTitle: (pct) => `PLCOm2012-mallin kuuden vuoden arvio: ${pct} %`,
  riskMore: "Mitä luku tarkoittaa",
  riskNote:
    "Yhdysvaltalaisella aineistolla kehitetty tutkimusmalli; sitä ei ole kalibroitu Suomen väestöön eikä tulos yksin ratkaise seulontaa tai hoitoa.",
  riskAge: " Ikä on alkuperäisen tutkimusjoukon 55–74 vuoden ulkopuolella.",
  imputedNote: "Puuttuvat tiedot täydennettiin mallin keskiarvoilla, ja lääkärinäkymä näyttää, mitkä.",
  followUpTitle: "Vielä muutama tarkentava kysymys",
  followUpHint: "Vastaa halutessasi, se auttaa lääkäriä",
  followUpSend: "Lähetä vastaukset",
  thanks: "Kiitos!",
  loading: "Analysoidaan vastausta…",
  newAnswer: "Uusi vastaus",
  answerYes: "kyllä",
  answerNo: "ei",
  followUps: {},
};

const sv: SurveyText = {
  steps: ["Om dig","Rökning","Symtom","Till sist"],
  next: "Nästa",
  back: "Tillbaka",
  stepOf: (i, n) => `Steg ${i} av ${n}`,
  decrease: "Minska",
  increase: "Öka",
  fillRequired: "Fyll i alla fält för att fortsätta.",
  chooseLanguage: "Välj språk",
  language: "Språk",
  draftNote: "Utkast till översättning, ska granskas.",
  title: "Enkät om lunghälsa",
  intro: "Tar två minuter. Använd påhittade uppgifter.",
  emergency: "Den här enkäten är inte en akut tjänst. Om du har plötsliga eller allvarliga symtom, ring 112 eller Jourhjälpen 116117.",
  age: "Ålder",
  smokingQuestion: "Röker du eller har du rökt?",
  smokingCurrent: "Jag röker",
  smokingFormer: "Jag har slutat",
  smokingNever: "Aldrig",
  cigsPerDay: "Cigaretter per dag",
  yearsSmoked: "Rökår sammanlagt",
  packYears: (n) => `Totalt ${n} paketår`,
  yearsSinceQuit: "Hur många år sedan slutade du röka?",
  plcoTitle: "Tilläggsuppgifter för screeningrisken enligt PLCOm2012",
  plcoNote:
    "Detta är en amerikansk modell som inte har validerats för Finlands befolkning. Demon visar modellens uppskattning endast som ett forskningsexempel; den ändrar inte hur symtomen hanteras.",
  raceLabel: "Befolkningsgrupp i den ursprungliga modellen (frivillig)",
  raceNone: "Inget svar (referensgrupp)",
  educationLabel: "Utbildning (modellens 6 nivåer)",
  education: [
    "1 · Ingen examen på andra stadiet",
    "2 · Examen på andra stadiet",
    "3 · Utbildning efter andra stadiet",
    "4 · Vissa högskolestudier",
    "5 · Högskoleexamen",
    "6 · Forskarexamen eller högre yrkesexamen",
  ],
  choose: "Välj",
  weight: "Vikt (kg)",
  height: "Längd (cm)",
  copd: "Kroniskt obstruktiv lungsjukdom (KOL)",
  personalCancer: "Tidigare cancer",
  familyLungCancer: "Lungcancer hos en nära släkting",
  no: "Nej",
  yes: "Ja",
  plcoFooter: "Rökningens mängd, längd och tiden sedan du slutade fylls i ovan. Saknade uppgifter ersätts med modellens medelvärden.",
  coughWeeks: "Hur många veckor har du haft hosta? (0 = ingen hosta)",
  symptomsLegend: "Har du under den senaste månaden haft:",
  symptoms: {
    blood_in_sputum: "Blod i upphostningarna",
    breathlessness: "Andnöd som är ny eller har förvärrats",
    chest_pain: "Bröstsmärta",
    weight_loss: "Viktminskning fast du inte har försökt gå ner i vikt",
  },
  bloodEmergency: "Om du hostar upp mycket blod eller hostar blod hela tiden, eller samtidigt har svår andnöd eller bröstsmärta, ring 112 genast.",
  pneumonias: "Hur många gånger har du haft lunginflammation under det senaste året?",
  visitQuestion: "Var du hos läkare på grund av andningssymtom?",
  visit: { "": "Nej", yskä: "Ja, hosta", flunssa: "Ja, förkylning", keuhkokuume: "Ja, lunginflammation", astma: "Ja, astma" },
  monthsAgo: "Hur många månader sedan?",
  freeText: "Berätta gärna med egna ord, på vilket språk som helst",
  send: "Skicka",
  sending: "Skickar…",
  symptomReview: "Tack! En yrkesperson bedömer de symtom du har uppgett. Detta är ingen diagnos.",
  placement: {
    direct_ct: "Tack! En läkare bedömer om datortomografi behövs. Appen gör ingen remiss automatiskt.",
    physician_fast: "Tack! Utifrån dina svar får du en läkartid inom de närmaste dagarna. Du får ett textmeddelande.",
    normal_route: "Tack! Utifrån dina svar finns det inget brådskande behov just nu. Om du får symtom, kontakta hälsostationen.",
    not_eligible: "Tack för ditt svar! Enkäten är avsedd för personer i åldern 55–80 år som har rökt.",
  },
  riskTitle: (pct) => `PLCOm2012-modellens sexårsuppskattning: ${pct} %`,
  riskMore: "Vad siffran betyder",
  riskNote:
    "En forskningsmodell utvecklad med amerikanska data. Den har inte kalibrerats för Finlands befolkning, och resultatet avgör inte ensamt screening eller behandling.",
  riskAge: " Åldern ligger utanför den ursprungliga studiegruppens 55–74 år.",
  imputedNote: "Saknade uppgifter ersattes med modellens medelvärden, och läkarvyn visar vilka.",
  followUpTitle: "Några frågor till",
  followUpHint: "Svara gärna, det hjälper läkaren",
  followUpSend: "Skicka svaren",
  thanks: "Tack!",
  loading: "Svaret analyseras…",
  newAnswer: "Nytt svar",
  answerYes: "ja",
  answerNo: "nej",
  followUps: {
    cough_change: "Har hostan förändrats under de senaste veckorna?",
    hemoptysis_count: "Hur många gånger har du märkt blod i upphostningarna?",
    weight_amount: "Hur många kilo har du gått ner under det senaste halvåret?",
    breath_worse: "Har andnöden förvärrats under den senaste månaden?",
    chest_pain_breathing: "Blir bröstsmärtan värre när du andas eller hostar?",
    hoarseness: "Har din röst varit hes i mer än tre veckor?",
    fatigue: "Har du känt dig ovanligt trött under de senaste veckorna?",
    asbestos: "Har du i arbetet exponerats för asbest eller annat damm?",
    previous_ct: "Har du gjort en datortomografi av lungorna under de senaste två åren?",
  },
};

const en: SurveyText = {
  steps: ["About you","Smoking","Symptoms","Finally"],
  next: "Next",
  back: "Back",
  stepOf: (i, n) => `Step ${i} of ${n}`,
  decrease: "Decrease",
  increase: "Increase",
  fillRequired: "Fill in all fields to continue.",
  chooseLanguage: "Choose your language",
  language: "Language",
  draftNote: "Draft translation, to be reviewed.",
  title: "Lung health survey",
  intro: "Takes two minutes. Use made-up details.",
  emergency: "This survey is not an urgent service. If you have sudden or severe symptoms, call 112 or the medical helpline 116117.",
  age: "Age",
  smokingQuestion: "Do you smoke or have you ever smoked?",
  smokingCurrent: "I smoke",
  smokingFormer: "I have quit",
  smokingNever: "Never",
  cigsPerDay: "Cigarettes per day",
  yearsSmoked: "Years smoked in total",
  packYears: (n) => `Total: ${n} pack-years`,
  yearsSinceQuit: "How many years ago did you quit smoking?",
  plcoTitle: "Additional details for the PLCOm2012 screening risk",
  plcoNote:
    "This is a US model that has not been validated for the Finnish population. The demo shows its estimate only as a research example; it does not change how symptoms are handled.",
  raceLabel: "Population group in the original model (optional)",
  raceNone: "No answer (reference group)",
  educationLabel: "Education (the model's 6 levels)",
  education: [
    "1 · No upper secondary qualification",
    "2 · Upper secondary qualification",
    "3 · Post-secondary training",
    "4 · Some university studies",
    "5 · University degree",
    "6 · Postgraduate or professional degree",
  ],
  choose: "Select",
  weight: "Weight (kg)",
  height: "Height (cm)",
  copd: "Chronic obstructive pulmonary disease (COPD)",
  personalCancer: "Previous cancer",
  familyLungCancer: "Lung cancer in a close relative",
  no: "No",
  yes: "Yes",
  plcoFooter: "Smoking amount, duration and years since quitting are filled in above. Missing details are filled with the model's average values.",
  coughWeeks: "For how many weeks have you had a cough? (0 = no cough)",
  symptomsLegend: "During the past month, have you had:",
  symptoms: {
    blood_in_sputum: "Blood in your phlegm",
    breathlessness: "Shortness of breath that is new or has got worse",
    chest_pain: "Chest pain",
    weight_loss: "Weight loss without trying to lose weight",
  },
  bloodEmergency: "If you cough up a lot of blood or keep coughing up blood, or also have severe shortness of breath or chest pain, call 112 now.",
  pneumonias: "How many times have you had pneumonia in the past year?",
  visitQuestion: "Did you see a doctor for breathing symptoms?",
  visit: { "": "No", yskä: "Yes, cough", flunssa: "Yes, cold or flu", keuhkokuume: "Yes, pneumonia", astma: "Yes, asthma" },
  monthsAgo: "How many months ago?",
  freeText: "If you like, tell us in your own words, in any language",
  send: "Send",
  sending: "Sending…",
  symptomReview: "Thank you! A healthcare professional will assess the symptoms you reported. This is not a diagnosis.",
  placement: {
    direct_ct: "Thank you! A doctor will assess whether a CT scan is needed. The app does not make a referral automatically.",
    physician_fast: "Thank you! Based on your answers, you will get a doctor's appointment in the next few days. You will receive a text message.",
    normal_route: "Thank you! Based on your answers, there is no urgent need right now. If you get symptoms, contact your health centre.",
    not_eligible: "Thank you for your answer! The survey is meant for people aged 55–80 who have smoked.",
  },
  riskTitle: (pct) => `Six-year estimate from the PLCOm2012 model: ${pct} %`,
  riskMore: "What the number means",
  riskNote:
    "A research model developed with US data. It has not been calibrated to the Finnish population, and the result alone does not decide screening or treatment.",
  riskAge: " The age is outside the 55–74 range of the original study group.",
  imputedNote: "Missing details were filled with the model’s average values, and the doctor’s view shows which.",
  followUpTitle: "A few more questions",
  followUpHint: "Answer if you like. It helps the doctor",
  followUpSend: "Send answers",
  thanks: "Thank you!",
  loading: "Analysing your answer…",
  newAnswer: "New answer",
  answerYes: "yes",
  answerNo: "no",
  followUps: {
    cough_change: "Has your cough changed in recent weeks?",
    hemoptysis_count: "How many times have you noticed blood in your phlegm?",
    weight_amount: "How many kilograms have you lost in the past six months?",
    breath_worse: "Has your shortness of breath got worse in the past month?",
    chest_pain_breathing: "Does the chest pain get worse when you breathe or cough?",
    hoarseness: "Has your voice been hoarse for more than three weeks?",
    fatigue: "Have you felt unusually tired in recent weeks?",
    asbestos: "Have you been exposed to asbestos or other dust at work?",
    previous_ct: "Have you had a CT scan of your lungs in the past two years?",
  },
};

const ru: SurveyText = {
  steps: ["О вас","Курение","Симптомы","В завершение"],
  next: "Далее",
  back: "Назад",
  stepOf: (i, n) => `Шаг ${i} из ${n}`,
  decrease: "Уменьшить",
  increase: "Увеличить",
  fillRequired: "Заполните все поля, чтобы продолжить.",
  chooseLanguage: "Выберите язык",
  language: "Язык",
  draftNote: "Черновой перевод, требует проверки.",
  title: "Опрос о здоровье лёгких",
  intro: "Займёт две минуты. Используйте вымышленные данные.",
  emergency: "Этот опрос не является службой неотложной помощи. При внезапных или тяжёлых симптомах звоните 112 или в службу Päivystysapu 116117.",
  age: "Возраст",
  smokingQuestion: "Вы курите или курили раньше?",
  smokingCurrent: "Курю",
  smokingFormer: "Бросил(а)",
  smokingNever: "Никогда",
  cigsPerDay: "Сигарет в день",
  yearsSmoked: "Сколько лет вы курили",
  packYears: (n) => `Итого: ${n} пачко-лет`,
  yearsSinceQuit: "Сколько лет назад вы бросили курить?",
  plcoTitle: "Дополнительные данные для оценки риска по модели PLCOm2012",
  plcoNote:
    "Это американская модель, которая не проверена на населении Финляндии. Демо показывает её оценку только как исследовательский пример; она не меняет порядок оценки симптомов.",
  raceLabel: "Группа населения в исходной модели (по желанию)",
  raceNone: "Нет ответа (группа сравнения)",
  educationLabel: "Образование (6 уровней модели)",
  education: [
    "1 · Без полного среднего образования",
    "2 · Полное среднее образование",
    "3 · Профессиональное образование после средней школы",
    "4 · Неоконченное высшее",
    "5 · Высшее образование",
    "6 · Учёная степень или профессиональная квалификация",
  ],
  choose: "Выберите",
  weight: "Вес (кг)",
  height: "Рост (см)",
  copd: "Хроническая обструктивная болезнь лёгких (ХОБЛ)",
  personalCancer: "Рак в прошлом",
  familyLungCancer: "Рак лёгких у близкого родственника",
  no: "Нет",
  yes: "Да",
  plcoFooter: "Количество и длительность курения и время после отказа заполняются выше. Недостающие данные заменяются средними значениями модели.",
  coughWeeks: "Сколько недель у вас кашель? (0 = кашля нет)",
  symptomsLegend: "Было ли у вас за последний месяц:",
  symptoms: {
    blood_in_sputum: "Кровь в мокроте",
    breathlessness: "Одышка, которая появилась недавно или усилилась",
    chest_pain: "Боль в груди",
    weight_loss: "Потеря веса, хотя вы не пытались похудеть",
  },
  bloodEmergency: "Если вы откашливаете много крови или кровь появляется постоянно, или одновременно у вас сильная одышка или боль в груди, сразу звоните 112.",
  pneumonias: "Сколько раз у вас была пневмония за последний год?",
  visitQuestion: "Обращались ли вы к врачу из-за симптомов со стороны дыхания?",
  visit: { "": "Нет", yskä: "Да, кашель", flunssa: "Да, простуда", keuhkokuume: "Да, пневмония", astma: "Да, астма" },
  monthsAgo: "Сколько месяцев назад?",
  freeText: "Если хотите, опишите своими словами на любом языке",
  send: "Отправить",
  sending: "Отправка…",
  symptomReview: "Спасибо! Медицинский специалист оценит указанные вами симптомы. Это не диагноз.",
  placement: {
    direct_ct: "Спасибо! Врач оценит, нужна ли компьютерная томография. Приложение не оформляет направление автоматически.",
    physician_fast: "Спасибо! По вашим ответам вам назначат приём у врача в ближайшие дни. Вы получите SMS.",
    normal_route: "Спасибо! По вашим ответам срочной необходимости сейчас нет. Если появятся симптомы, обратитесь в поликлинику (terveysasema).",
    not_eligible: "Спасибо за ответ! Опрос предназначен для людей в возрасте 55–80 лет, которые курят или курили.",
  },
  riskTitle: (pct) => `Шестилетняя оценка по модели PLCOm2012: ${pct} %`,
  riskMore: "Что означает это число",
  riskNote:
    "Исследовательская модель, разработанная на данных США. Она не откалибрована для населения Финляндии, и результат сам по себе не определяет скрининг или лечение.",
  riskAge: " Возраст вне диапазона 55–74 лет исходной исследуемой группы.",
  imputedNote: "Недостающие данные заменены средними значениями модели; в окне врача видно, какие именно.",
  followUpTitle: "Ещё несколько уточняющих вопросов",
  followUpHint: "Ответьте, если хотите, — это поможет врачу",
  followUpSend: "Отправить ответы",
  thanks: "Спасибо!",
  loading: "Ответ анализируется…",
  newAnswer: "Новый ответ",
  answerYes: "да",
  answerNo: "нет",
  followUps: {
    cough_change: "Изменился ли характер кашля за последние недели?",
    hemoptysis_count: "Сколько раз вы замечали кровь в мокроте?",
    weight_amount: "На сколько килограммов вы похудели за последние полгода?",
    breath_worse: "Усилилась ли одышка за последний месяц?",
    chest_pain_breathing: "Усиливается ли боль в груди при дыхании или кашле?",
    hoarseness: "Был ли у вас хриплый голос дольше трёх недель?",
    fatigue: "Чувствовали ли вы необычную усталость в последние недели?",
    asbestos: "Подвергались ли вы на работе воздействию асбеста или другой пыли?",
    previous_ct: "Делали ли вам КТ лёгких за последние два года?",
  },
};

const et: SurveyText = {
  steps: ["Teist","Suitsetamine","Sümptomid","Lõpetuseks"],
  next: "Edasi",
  back: "Tagasi",
  stepOf: (i, n) => `Samm ${i}/${n}`,
  decrease: "Vähenda",
  increase: "Suurenda",
  fillRequired: "Jätkamiseks täitke kõik väljad.",
  chooseLanguage: "Valige keel",
  language: "Keel",
  draftNote: "Tõlke mustand, vajab ülevaatamist.",
  title: "Kopsutervise küsimustik",
  intro: "Võtab kaks minutit. Kasutage väljamõeldud andmeid.",
  emergency: "See küsimustik ei ole kiirabiteenus. Kui Teil on äkilised või rasked sümptomid, helistage 112 või nõuandetelefonile Päivystysapu 116117.",
  age: "Vanus",
  smokingQuestion: "Kas Te suitsetate või olete suitsetanud?",
  smokingCurrent: "Suitsetan",
  smokingFormer: "Olen loobunud",
  smokingNever: "Mitte kunagi",
  cigsPerDay: "Sigarette päevas",
  yearsSmoked: "Suitsetamisaastaid kokku",
  packYears: (n) => `Kokku ${n} pakiaastat`,
  yearsSinceQuit: "Mitu aastat tagasi Te suitsetamisest loobusite?",
  plcoTitle: "PLCOm2012 sõeluuringuriski lisaandmed",
  plcoNote:
    "See on USA mudel, mida ei ole Soome rahvastikul valideeritud. Demo näitab mudeli hinnangut ainult uurimisnäitena; see ei muuda sümptomite käsitlemist.",
  raceLabel: "Algse mudeli rahvastikurühm (vabatahtlik)",
  raceNone: "Vastus puudub (võrdlusrühm)",
  educationLabel: "Haridus (mudeli 6 taset)",
  education: [
    "1 · Keskhariduseta",
    "2 · Keskharidus",
    "3 · Keskharidusjärgne kutseõpe",
    "4 · Osaliselt läbitud kõrgharidusõpe",
    "5 · Kõrgharidus",
    "6 · Teaduskraad või kutsekraad",
  ],
  choose: "Valige",
  weight: "Kaal (kg)",
  height: "Pikkus (cm)",
  copd: "Krooniline obstruktiivne kopsuhaigus (KOK)",
  personalCancer: "Varasem vähk",
  familyLungCancer: "Kopsuvähk lähisugulasel",
  no: "Ei",
  yes: "Jah",
  plcoFooter: "Suitsetamise kogus, kestus ja loobumisest möödunud aeg täidetakse ülal. Puuduvad andmed asendatakse mudeli keskmistega.",
  coughWeeks: "Mitu nädalat on Teil köha olnud? (0 = köha ei ole)",
  symptomsLegend: "Kas Teil on viimase kuu jooksul olnud:",
  symptoms: {
    blood_in_sputum: "Verd rögas",
    breathlessness: "Õhupuudus, mis on uus või süvenenud",
    chest_pain: "Valu rinnus",
    weight_loss: "Kaalulangus, kuigi Te ei ole püüdnud kaalu langetada",
  },
  bloodEmergency: "Kui köhite verd palju või pidevalt või Teil on samal ajal raske õhupuudus või valu rinnus, helistage kohe 112.",
  pneumonias: "Mitu korda on Teil viimase aasta jooksul olnud kopsupõletik?",
  visitQuestion: "Kas käisite arsti juures hingamisteede sümptomite tõttu?",
  visit: { "": "Ei", yskä: "Jah, köha", flunssa: "Jah, külmetus", keuhkokuume: "Jah, kopsupõletik", astma: "Jah, astma" },
  monthsAgo: "Mitu kuud tagasi?",
  freeText: "Soovi korral kirjeldage oma sõnadega, mis tahes keeles",
  send: "Saada",
  sending: "Saadan…",
  symptomReview: "Aitäh! Tervishoiutöötaja hindab Teie märgitud sümptomeid. See ei ole diagnoos.",
  placement: {
    direct_ct: "Aitäh! Arst hindab, kas kompuutertomograafia on vajalik. Rakendus ei tee saatekirja automaatselt.",
    physician_fast: "Aitäh! Teie vastuste põhjal broneeritakse Teile lähipäevil arstiaeg. Saate tekstisõnumi.",
    normal_route: "Aitäh! Teie vastuste põhjal ei ole praegu kiiret vajadust. Kui tekivad sümptomid, võtke ühendust tervisekeskusega.",
    not_eligible: "Aitäh vastamast! Küsimustik on mõeldud 55–80-aastastele, kes on suitsetanud.",
  },
  riskTitle: (pct) => `PLCOm2012 mudeli kuue aasta hinnang: ${pct} %`,
  riskMore: "Mida see number tähendab",
  riskNote:
    "USA andmetel välja töötatud uurimismudel. Seda ei ole Soome rahvastikule kalibreeritud ja tulemus üksi ei otsusta sõeluuringut ega ravi.",
  riskAge: " Vanus on väljaspool algse uuringurühma 55–74 aastat.",
  imputedNote: "Puuduvad andmed asendati mudeli keskmistega ja arsti vaade näitab, millised.",
  followUpTitle: "Veel mõned täpsustavad küsimused",
  followUpHint: "Vastake soovi korral, see aitab arsti",
  followUpSend: "Saada vastused",
  thanks: "Aitäh!",
  loading: "Vastust analüüsitakse…",
  newAnswer: "Uus vastus",
  answerYes: "jah",
  answerNo: "ei",
  followUps: {
    cough_change: "Kas köha iseloom on viimastel nädalatel muutunud?",
    hemoptysis_count: "Mitu korda olete märganud rögas verd?",
    weight_amount: "Mitu kilo olete viimase poole aasta jooksul kaalust kaotanud?",
    breath_worse: "Kas õhupuudus on viimase kuu jooksul süvenenud?",
    chest_pain_breathing: "Kas valu rinnus süveneb hingamisel või köhimisel?",
    hoarseness: "Kas Teie hääl on olnud kähe üle kolme nädala?",
    fatigue: "Kas olete viimastel nädalatel tundnud ebatavalist väsimust?",
    asbestos: "Kas olete töö juures kokku puutunud asbesti või muu tolmuga?",
    previous_ct: "Kas Teie kopsudest on viimase kahe aasta jooksul tehtud kompuutertomograafia?",
  },
};

const uk: SurveyText = {
  steps: ["Про вас","Куріння","Симптоми","Насамкінець"],
  next: "Далі",
  back: "Назад",
  stepOf: (i, n) => `Крок ${i} з ${n}`,
  decrease: "Зменшити",
  increase: "Збільшити",
  fillRequired: "Заповніть усі поля, щоб продовжити.",
  chooseLanguage: "Оберіть мову",
  language: "Мова",
  draftNote: "Чернетка перекладу, потребує перевірки.",
  title: "Опитування про здоров'я легень",
  intro: "Займе дві хвилини. Використовуйте вигадані дані.",
  emergency: "Це опитування не є службою невідкладної допомоги. Якщо у вас раптові або тяжкі симптоми, телефонуйте 112 або до служби Päivystysapu 116117.",
  age: "Вік",
  smokingQuestion: "Ви курите або курили раніше?",
  smokingCurrent: "Курю",
  smokingFormer: "Кинув(-ла)",
  smokingNever: "Ніколи",
  cigsPerDay: "Сигарет на день",
  yearsSmoked: "Скільки років ви курили",
  packYears: (n) => `Разом: ${n} пачко-років`,
  yearsSinceQuit: "Скільки років тому ви кинули курити?",
  plcoTitle: "Додаткові дані для оцінки ризику за моделлю PLCOm2012",
  plcoNote:
    "Це американська модель, яку не перевіряли на населенні Фінляндії. Демо показує її оцінку лише як дослідницький приклад; вона не змінює порядок оцінки симптомів.",
  raceLabel: "Група населення у вихідній моделі (за бажанням)",
  raceNone: "Немає відповіді (група порівняння)",
  educationLabel: "Освіта (6 рівнів моделі)",
  education: [
    "1 · Без повної середньої освіти",
    "2 · Повна середня освіта",
    "3 · Професійна освіта після середньої",
    "4 · Незакінчена вища",
    "5 · Вища освіта",
    "6 · Науковий ступінь або професійна кваліфікація",
  ],
  choose: "Оберіть",
  weight: "Вага (кг)",
  height: "Зріст (см)",
  copd: "Хронічне обструктивне захворювання легень (ХОЗЛ)",
  personalCancer: "Рак у минулому",
  familyLungCancer: "Рак легень у близького родича",
  no: "Ні",
  yes: "Так",
  plcoFooter: "Кількість і тривалість куріння та час після відмови заповнюються вище. Відсутні дані замінюються середніми значеннями моделі.",
  coughWeeks: "Скільки тижнів у вас кашель? (0 = кашлю немає)",
  symptomsLegend: "Чи було у вас протягом останнього місяця:",
  symptoms: {
    blood_in_sputum: "Кров у мокротинні",
    breathlessness: "Задишка, яка з'явилася нещодавно або посилилася",
    chest_pain: "Біль у грудях",
    weight_loss: "Втрата ваги, хоча ви не намагалися схуднути",
  },
  bloodEmergency: "Якщо ви відкашлюєте багато крові або кров з'являється постійно, або водночас маєте сильну задишку чи біль у грудях, негайно телефонуйте 112.",
  pneumonias: "Скільки разів у вас була пневмонія за останній рік?",
  visitQuestion: "Чи зверталися ви до лікаря через симптоми з боку дихання?",
  visit: { "": "Ні", yskä: "Так, кашель", flunssa: "Так, застуда", keuhkokuume: "Так, пневмонія", astma: "Так, астма" },
  monthsAgo: "Скільки місяців тому?",
  freeText: "За бажанням опишіть своїми словами будь-якою мовою",
  send: "Надіслати",
  sending: "Надсилання…",
  symptomReview: "Дякуємо! Медичний фахівець оцінить симптоми, про які ви повідомили. Це не діагноз.",
  placement: {
    direct_ct: "Дякуємо! Лікар оцінить, чи потрібна комп'ютерна томографія. Застосунок не оформлює направлення автоматично.",
    physician_fast: "Дякуємо! За вашими відповідями вам призначать прийом у лікаря найближчими днями. Ви отримаєте SMS.",
    normal_route: "Дякуємо! За вашими відповідями нагальної потреби зараз немає. Якщо з'являться симптоми, зверніться до медичного центру (terveysasema).",
    not_eligible: "Дякуємо за відповідь! Опитування призначене для людей віком 55–80 років, які курять або курили.",
  },
  riskTitle: (pct) => `Шестирічна оцінка за моделлю PLCOm2012: ${pct} %`,
  riskMore: "Що означає це число",
  riskNote:
    "Дослідницька модель, розроблена на даних США. Її не калібрували для населення Фінляндії, і результат сам по собі не визначає скринінг чи лікування.",
  riskAge: " Вік поза діапазоном 55–74 років вихідної досліджуваної групи.",
  imputedNote: "Відсутні дані замінено середніми значеннями моделі; у вікні лікаря видно, які саме.",
  followUpTitle: "Ще кілька уточнювальних запитань",
  followUpHint: "Відповідайте за бажанням — це допоможе лікарю",
  followUpSend: "Надіслати відповіді",
  thanks: "Дякуємо!",
  loading: "Аналізуємо відповідь…",
  newAnswer: "Нова відповідь",
  answerYes: "так",
  answerNo: "ні",
  followUps: {
    cough_change: "Чи змінився характер кашлю за останні тижні?",
    hemoptysis_count: "Скільки разів ви помічали кров у мокротинні?",
    weight_amount: "На скільки кілограмів ви схудли за останні пів року?",
    breath_worse: "Чи посилилася задишка за останній місяць?",
    chest_pain_breathing: "Чи посилюється біль у грудях під час дихання або кашлю?",
    hoarseness: "Чи був у вас хрипкий голос довше ніж три тижні?",
    fatigue: "Чи відчували ви незвичну втому останніми тижнями?",
    asbestos: "Чи контактували ви на роботі з азбестом або іншим пилом?",
    previous_ct: "Чи робили вам КТ легень за останні два роки?",
  },
};

const ar: SurveyText = {
  steps: ["عنك","التدخين","الأعراض","أخيرًا"],
  next: "التالي",
  back: "السابق",
  stepOf: (i, n) => `الخطوة ${i} من ${n}`,
  decrease: "إنقاص",
  increase: "زيادة",
  fillRequired: "املأ جميع الحقول للمتابعة.",
  chooseLanguage: "اختر لغتك",
  language: "اللغة",
  draftNote: "مسودة ترجمة، تحتاج إلى مراجعة.",
  title: "استبيان صحة الرئة",
  intro: "يستغرق دقيقتين. استخدم بيانات خيالية.",
  emergency: "هذا الاستبيان ليس خدمة طوارئ. إذا كانت لديك أعراض مفاجئة أو شديدة، فاتصل بالرقم 112 أو بخط المشورة الطبية على الرقم 116117.",
  age: "العمر",
  smokingQuestion: "هل تدخن أو سبق لك التدخين؟",
  smokingCurrent: "أدخن",
  smokingFormer: "أقلعت عن التدخين",
  smokingNever: "لم أدخن أبدًا",
  cigsPerDay: "عدد السجائر يوميًا",
  yearsSmoked: "مجموع سنوات التدخين",
  packYears: (n) => `المجموع: ${n} علبة-سنة`,
  yearsSinceQuit: "منذ كم سنة أقلعت عن التدخين؟",
  plcoTitle: "معلومات إضافية لتقدير خطر الفحص وفق نموذج PLCOm2012",
  plcoNote:
    "هذا نموذج أمريكي لم يُتحقق من صحته على سكان فنلندا. يعرض العرض التجريبي تقديره كمثال بحثي فقط، ولا يغيّر طريقة التعامل مع الأعراض.",
  raceLabel: "الفئة السكانية في النموذج الأصلي (اختياري)",
  raceNone: "لا إجابة (الفئة المرجعية)",
  educationLabel: "التعليم (المستويات الستة في النموذج)",
  education: [
    "1 · دون شهادة ثانوية",
    "2 · شهادة ثانوية",
    "3 · تدريب بعد الثانوية",
    "4 · بعض الدراسة الجامعية",
    "5 · شهادة جامعية",
    "6 · دراسات عليا أو شهادة مهنية",
  ],
  choose: "اختر",
  weight: "الوزن (كغ)",
  height: "الطول (سم)",
  copd: "مرض الانسداد الرئوي المزمن (COPD)",
  personalCancer: "إصابة سابقة بالسرطان",
  familyLungCancer: "سرطان الرئة لدى قريب من الدرجة الأولى",
  no: "لا",
  yes: "نعم",
  plcoFooter: "تُملأ كمية التدخين ومدته والوقت منذ الإقلاع أعلاه. تُستكمل المعلومات الناقصة بمتوسطات النموذج.",
  coughWeeks: "منذ كم أسبوعًا لديك سعال؟ (0 = لا يوجد سعال)",
  symptomsLegend: "هل عانيت خلال الشهر الماضي من:",
  symptoms: {
    blood_in_sputum: "دم في البلغم",
    breathlessness: "ضيق تنفس جديد أو ازداد سوءًا",
    chest_pain: "ألم في الصدر",
    weight_loss: "فقدان الوزن دون أن تحاول إنقاصه",
  },
  bloodEmergency: "إذا كنت تسعل دمًا بكثرة أو باستمرار، أو كان لديك في الوقت نفسه ضيق تنفس شديد أو ألم في الصدر، فاتصل فورًا بالرقم 112.",
  pneumonias: "كم مرة أصبت بالتهاب رئوي خلال العام الماضي؟",
  visitQuestion: "هل زرت طبيبًا بسبب أعراض في التنفس؟",
  visit: { "": "لا", yskä: "نعم، سعال", flunssa: "نعم، زكام", keuhkokuume: "نعم، التهاب رئوي", astma: "نعم، ربو" },
  monthsAgo: "منذ كم شهرًا؟",
  freeText: "إن أردت، صِف حالتك بكلماتك وبأي لغة",
  send: "إرسال",
  sending: "جارٍ الإرسال…",
  symptomReview: "شكرًا! سيقيّم مختص في الرعاية الصحية الأعراض التي أبلغت عنها. هذا ليس تشخيصًا.",
  placement: {
    direct_ct: "شكرًا! سيقيّم الطبيب ما إذا كان التصوير المقطعي ضروريًا. لا يصدر التطبيق إحالة تلقائيًا.",
    physician_fast: "شكرًا! بناءً على إجاباتك سيُحجز لك موعد مع الطبيب خلال الأيام القادمة. ستصلك رسالة نصية.",
    normal_route: "شكرًا! بناءً على إجاباتك لا توجد حاجة عاجلة الآن. إذا ظهرت أعراض، فتواصل مع المركز الصحي.",
    not_eligible: "شكرًا على إجابتك! هذا الاستبيان مخصص للأشخاص الذين تتراوح أعمارهم بين 55 و80 عامًا وسبق لهم التدخين.",
  },
  riskTitle: (pct) => `تقدير نموذج PLCOm2012 لست سنوات: ${pct} %`,
  riskMore: "ماذا يعني هذا الرقم",
  riskNote: "نموذج بحثي طُوّر ببيانات أمريكية. لم يُعايَر على سكان فنلندا، ولا تحدد النتيجة وحدها الفحص أو العلاج.",
  riskAge: " العمر خارج نطاق 55–74 عامًا لمجموعة الدراسة الأصلية.",
  imputedNote: "استُكملت المعلومات الناقصة بمتوسطات النموذج، وتُظهر شاشة الطبيب ما الذي استُكمل.",
  followUpTitle: "بعض الأسئلة الإضافية",
  followUpHint: "أجب إن أردت، فهذا يساعد الطبيب",
  followUpSend: "إرسال الإجابات",
  thanks: "شكرًا!",
  loading: "جارٍ تحليل إجابتك…",
  newAnswer: "إجابة جديدة",
  answerYes: "نعم",
  answerNo: "لا",
  followUps: {
    cough_change: "هل تغيّرت طبيعة السعال في الأسابيع الأخيرة؟",
    hemoptysis_count: "كم مرة لاحظت دمًا في البلغم؟",
    weight_amount: "كم كيلوغرامًا فقدت من وزنك خلال الأشهر الستة الماضية؟",
    breath_worse: "هل ازداد ضيق التنفس سوءًا خلال الشهر الماضي؟",
    chest_pain_breathing: "هل يزداد ألم الصدر عند التنفس أو السعال؟",
    hoarseness: "هل كان صوتك مبحوحًا لأكثر من ثلاثة أسابيع؟",
    fatigue: "هل شعرت بتعب غير معتاد في الأسابيع الأخيرة؟",
    asbestos: "هل تعرضت في عملك للأسبستوس أو غبار آخر؟",
    previous_ct: "هل أُجري لك تصوير مقطعي للرئتين خلال العامين الماضيين؟",
  },
};

// Northern Sámi: partial draft. The PLCOm2012 research section stays in Finnish.
const se: Partial<SurveyText> = {
  steps: ["Dus","Borgguheapmi","Dávdamearkkat","Loahpas"],
  next: "Viidáseappot",
  back: "Maŋás",
  stepOf: (i, n) => `Lávki ${i}/${n}`,
  chooseLanguage: "Vállje giela",
  language: "Giella",
  draftNote: "Jorgalusa álgu, galgá dárkkistuvvot. Muhtun osiid leat suomagillii.",
  intro: "Váldá guokte minuhta. Geavat ráhkaduvvon dieđuid.",
  title: "Geahpesdearvvašvuođa jearahallan",
  emergency: "Dát jearahallan ii leat hoahppobálvalus. Jus dus leat fáhkkatlaš dahje garra dávdamearkkat, riŋge 112 dahje Päivystysapu-nummirii 116117.",
  age: "Ahki",
  smokingQuestion: "Borgguhat go dahje leat go borgguhan?",
  smokingCurrent: "Borgguhan",
  smokingFormer: "Lean heaitán",
  smokingNever: "In goassige",
  cigsPerDay: "Sigárehtat beaivvis",
  yearsSmoked: "Borgguhanjagit oktiibuot",
  yearsSinceQuit: "Man galle jagi áigi heaitit borgguheames?",
  no: "Ii",
  yes: "Juo",
  coughWeeks: "Man galle vahku leat gossan? (0 = in leat gossan)",
  symptomsLegend: "Leat go dus maŋimuš mánu áigge leamaš:",
  symptoms: {
    blood_in_sputum: "Varra čolgadagas",
    breathlessness: "Vuoiŋŋahanváttisvuohta mii lea ođđa dahje lea fuoránan",
    chest_pain: "Rattebávččas",
    weight_loss: "Deaddu lea njiedjan almmá geahččaleames",
  },
  bloodEmergency: "Jus gossat ollu vara dahje oktilaččat, dahje dus lea seammás garra vuoiŋŋahanváttisvuohta dahje rattebávččas, riŋge dakkaviđe 112.",
  pneumonias: "Man galle geardde leat dus leamaš geahpesbuolladus maŋimuš jagi áigge?",
  visitQuestion: "Leat go leamaš doaktára luhtte vuoiŋŋahandávdamearkkaid dihte?",
  visit: { "": "In", yskä: "Juo, gosahat", flunssa: "Juo, nuorvu", keuhkokuume: "Juo, geahpesbuolladus", astma: "Juo, astma" },
  monthsAgo: "Man galle mánu áigi?",
  freeText: "Muital háliidettiinat iežat sániiguin, vaikko man gillii",
  send: "Sádde",
  sending: "Sáddemin…",
  symptomReview: "Giitu! Dearvvašvuođabargi árvvoštallá dávdamearkkaid maid muitalit. Dát ii leat diagnosa.",
  placement: {
    direct_ct: "Giitu! Doavttir árvvoštallá, dárbbašuvvo go TT-govven.",
    physician_fast: "Giitu! Vástádusaid vuođul dutnje várrejuvvo doavttiráigi boahtte beivviid. Oaččut teakstadieđu.",
    normal_route: "Giitu! Vástádusaid vuođul ii leat dál hoahppu. Jus dus bohtet dávdamearkkat, váldde oktavuođa dearvvašvuođaguovddážii.",
    not_eligible: "Giitu vástádusas! Jearahallan lea oaivvilduvvon 55–80-jahkásaččaide geat leat borgguhan.",
  },
  riskMore: "Maid lohku mearkkaša",
  followUpTitle: "Vel moadde gažaldaga",
  followUpHint: "Vástit jus háliidat, dat veahkeha doaktára",
  followUpSend: "Sádde vástádusaid",
  thanks: "Giitu!",
  newAnswer: "Ođđa vástádus",
  answerYes: "juo",
  answerNo: "ii",
};

const TEXTS: Record<Exclude<SurveyLang, "se">, SurveyText> = { fi, sv, en, ru, et, uk, ar };

export function surveyText(lang: SurveyLang): SurveyText {
  if (lang === "se") return { ...fi, ...se, symptoms: { ...fi.symptoms, ...se.symptoms }, placement: { ...fi.placement, ...se.placement }, followUps: {} };
  return TEXTS[lang];
}

export function isSurveyLang(x: unknown): x is SurveyLang {
  return typeof x === "string" && SURVEY_LANGS.some((l) => l.code === x);
}
