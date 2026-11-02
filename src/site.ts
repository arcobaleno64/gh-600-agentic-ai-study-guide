import siteData from "@exam/data/site.json";
import metaData from "@exam/data/exam-meta.json";
import type { ExamCode, SiteConfig } from "./types";
import { progressKeyFor, sessionKeyFor } from "./storageKeys";

// Identity of the exam this build is for (EXAM picks exams/<code>/).
export const site = siteData as SiteConfig;
export const examCode = metaData.exam.code as ExamCode;
// Storage names derive from the code: GH-600 keeps its original keys.
export const progressKey = progressKeyFor(examCode);
export const sessionKey = sessionKeyFor(examCode);
