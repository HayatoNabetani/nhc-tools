import { isNumeric } from "@/lib/validate";

// 元号ごとの元年の前年（元号N年 = 前年 + N）
const ERA_BASE_YEARS: Record<string, number> = {
  令和: 2018,
  平成: 1988,
  昭和: 1925,
  大正: 1911,
  明治: 1867,
};

const ENGLISH_MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/**
 * Dateを日本時間の yyyy-MM-dd HH:mm:ss(.SSS) に整形する共通関数
 * 実行環境のタイムゾーンに依存せず Asia/Tokyo で整形する
 */
const formatJSTDate = (date: Date, withMillis = false): string => {
  if (isNaN(date.getTime())) {
    throw new Error("無効な日付です");
  }

  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const formatted = `${get("year")}-${get("month")}-${get("day")} ${get(
    "hour"
  )}:${get("minute")}:${get("second")}`;

  if (!withMillis) return formatted;
  return `${formatted}.${String(date.getMilliseconds()).padStart(3, "0")}`;
};

// 日本時間の0時0分0秒を表すDateを生成する（実行環境のタイムゾーンに依存しない）
const jstMidnight = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month - 1, day) - 9 * 60 * 60 * 1000);
};

/**
 * iso → yyyy-MM-dd HH:mm:ss
 * @param isoFormatStr iso形式の日付文字列
 * @returns フォーマットされた日付文字
 */
export const convertIsoToDatetime = (isoFormatStr: string): string => {
  return formatJSTDate(new Date(isoFormatStr));
};

/**
 * タイムスタンプ(秒: 1707362911 / ミリ秒: 1707362911000) → yyyy-MM-dd HH:mm:ss
 * @param timestamp タイムスタンプ
 * @returns フォーマットされた日付文字
 */
export const convertTimestampToDatetime = (timestamp: number): string => {
  // 12桁以下は秒とみなしてミリ秒へ変換する
  const millis = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  return formatJSTDate(new Date(millis));
};

/**
 * UTC/GMT明示の日付文字列 → yyyy-MM-dd HH:mm:ss.SSS (JST)
 * @param utcStr UTCの文字列
 * @returns フォーマットされた日付文字
 */
export const convertUtcToJpDatetime = (utcStr: string): string => {
  return formatJSTDate(new Date(utcStr), true);
};

// 標準的な日付形式（YYYY/MM/DD or YYYY-MM-DD）をJSTに変換
const convertStandardDateToJST = (dateStr: string): string => {
  const [year, month, day] = dateStr.split(/[/-]/).map(Number);
  return formatJSTDate(jstMidnight(year, month, day));
};

// 日本語形式（元号あり/なし）の日付をJSTに変換
const convertJapaneseFormatToJST = (dateStr: string): string => {
  const match = dateStr.match(/(令和|平成|昭和|大正|明治)?(\d+)年(\d+)月(\d+)日/);
  if (!match) {
    throw new Error("日本語日付形式の解析に失敗しました");
  }

  const [, era, yearStr, monthStr, dayStr] = match;
  const year = era
    ? ERA_BASE_YEARS[era] + parseInt(yearStr, 10)
    : parseInt(yearStr, 10);

  return formatJSTDate(jstMidnight(year, parseInt(monthStr, 10), parseInt(dayStr, 10)));
};

// 英語形式の日付をJSTに変換
const convertEnglishFormatToJST = (dateStr: string): string => {
  // Dateコンストラクタは英語形式の日付を比較的うまく解析する
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error("英語日付形式の解析に失敗しました");
  }
  return formatJSTDate(date);
};

// 相対的な時間表現をJSTに変換
const convertRelativeDateToJST = (dateStr: string): string => {
  const now = new Date();
  const target = new Date(now);

  const fixedDayOffsets: Record<string, number> = {
    一昨日: -2,
    昨日: -1,
    明日: 1,
    明後日: 2,
  };

  if (dateStr in fixedDayOffsets) {
    target.setDate(now.getDate() + fixedDayOffsets[dateStr]);
    return formatJSTDate(target);
  }

  // N日前/後、N時間前/後、N分前/後の処理
  const relativeMatch = dateStr.match(/(\d+)(日|時間|分)(前|後)/);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const direction = relativeMatch[3] === "前" ? -1 : 1;
    const offset = amount * direction;

    switch (relativeMatch[2]) {
      case "日":
        target.setDate(now.getDate() + offset);
        break;
      case "時間":
        target.setHours(now.getHours() + offset);
        break;
      case "分":
        target.setMinutes(now.getMinutes() + offset);
        break;
    }
    return formatJSTDate(target);
  }

  throw new Error("相対日付形式の解析に失敗しました");
};

export const handleConvert = (value: string) => {
  if (!value) throw new Error("入力が空です。");

  // 前処理：トリムして余分な空白を削除
  const trimmedValue = value.trim();

  // === ISO形式 (yyyy-MM-ddTHH:mm:ss.sssZ) ===
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(
      trimmedValue
    )
  ) {
    return convertIsoToDatetime(trimmedValue);
  }

  // === タイムスタンプ (秒: 10桁 / ミリ秒: 13桁) ===
  if (
    isNumeric(trimmedValue) &&
    (trimmedValue.length === 10 || trimmedValue.length === 13)
  ) {
    return convertTimestampToDatetime(Number(trimmedValue));
  }

  // === UTC/GMT明示形式 ===
  if (
    trimmedValue.includes("UTC") ||
    trimmedValue.includes("GMT") ||
    trimmedValue.includes("Z") ||
    /[+-]\d{2}:?\d{2}/.test(trimmedValue)
  ) {
    return convertUtcToJpDatetime(trimmedValue);
  }

  // === 一般的な日付形式 (yyyy/MM/dd または yyyy-MM-dd) ===
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(trimmedValue)) {
    return convertStandardDateToJST(trimmedValue);
  }

  // === 日本語形式 (令和5年10月1日、2023年10月1日など) ===
  if (/^(令和|平成|昭和|大正|明治)?\d+年\d+月\d+日/.test(trimmedValue)) {
    return convertJapaneseFormatToJST(trimmedValue);
  }

  // === 英語形式 (Oct 1, 2023、1st October 2023など) ===
  const lowerValue = trimmedValue.toLowerCase();
  if (ENGLISH_MONTHS.some((month) => lowerValue.includes(month))) {
    return convertEnglishFormatToJST(trimmedValue);
  }

  // === 相対的な時間表現 (「昨日」「明日」「3日前」など) ===
  if (/昨日|一昨日|明日|明後日|\d+(日|時間|分)(前|後)/.test(trimmedValue)) {
    return convertRelativeDateToJST(trimmedValue);
  }

  // 入力の日付形式が認識できない場合は、標準のDateコンストラクタで試行
  const date = new Date(trimmedValue);
  if (!isNaN(date.getTime())) {
    return formatJSTDate(date);
  }

  return "対応していない日付形式です。";
};
