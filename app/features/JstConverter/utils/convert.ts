import { isNumeric } from "@/lib/validate";
import { addHours, format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * iso → yyyy-MM-dd HH:mm:ss
 * @param isoFormatStr iso形式の日付文字列
 * @returns フォーマットされた日付文字
 */
export const convertIsoToDatetime = (isoFormatStr: string): string => {
  return format(new Date(isoFormatStr), "yyyy-MM-dd HH:mm:ss", { locale: ja });
};

/**
 * タイムスタンプ(1707362911) → yyyy-MM-dd HH:mm:ss
 * @param timestamp タイムスタンプ形式の日付文字列
 * @returns フォーマットされた日付文字
 */
export const convertTimestampToDatetime = (timestamp: number): string => {
  return format(new Date(timestamp * 1000), "yyyy-MM-dd HH:mm:ss", {
    locale: ja,
  });
};

/**
 * UTC → yyyy/MM/dd HH:mm:ss.SSS
 * @param utcStr UTCの文字列
 * @returns フォーマットされた日付文字
 */
export const convertUtcToJpDatetime = (utcStr: string): string => {
  // UTCの文字列
  const date = parseISO(utcStr);

  // UTCから日本時間へは+9時間
  const jpTime = addHours(date, 9);

  // フォーマット
  const formattedTime = format(jpTime, "yyyy/MM/dd HH:mm:ss.SSS", {
    locale: ja,
  });

  return formattedTime;
};

// 標準的な日付形式（YYYY/MM/DD or YYYY-MM-DD）をJSTに変換
const convertStandardDateToJST = (dateStr: string): string => {
  // スラッシュとハイフンの両方に対応
  const normalizedStr = dateStr.replace(/-/g, "/");
  // 時間部分がない場合は日本時間の0時0分0秒を追加
  const dateWithTime = `${normalizedStr} 00:00:00`;
  const date = new Date(dateWithTime);
  return formatJSTDate(date);
};

// 日本語形式の日付をJSTに変換
const convertJapaneseFormatToJST = (dateStr: string): string => {
  let year, month, day;

  // 元号対応
  if (dateStr.includes("令和")) {
    const match = dateStr.match(/令和(\d+)年(\d+)月(\d+)日/);
    if (match) {
      year = 2018 + parseInt(match[1], 10); // 令和元年は2019年
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }
  } else if (dateStr.includes("平成")) {
    const match = dateStr.match(/平成(\d+)年(\d+)月(\d+)日/);
    if (match) {
      year = 1988 + parseInt(match[1], 10); // 平成元年は1989年
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }
  } else {
    // 西暦表記
    const match = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }
  }

  if (year && month && day) {
    const date = new Date(year, month - 1, day);
    return formatJSTDate(date);
  }

  throw new Error("日本語日付形式の解析に失敗しました");
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

  if (dateStr === "昨日") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return formatJSTDate(yesterday);
  } else if (dateStr === "明日") {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return formatJSTDate(tomorrow);
  } else if (dateStr === "一昨日") {
    const dayBeforeYesterday = new Date(now);
    dayBeforeYesterday.setDate(now.getDate() - 2);
    return formatJSTDate(dayBeforeYesterday);
  } else if (dateStr === "明後日") {
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(now.getDate() + 2);
    return formatJSTDate(dayAfterTomorrow);
  }

  // N日前/後の処理
  const daysMatch = dateStr.match(/(\d+)日(前|後)/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    const direction = daysMatch[2] === "前" ? -1 : 1;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + days * direction);
    return formatJSTDate(targetDate);
  }

  // N時間前/後の処理
  const hoursMatch = dateStr.match(/(\d+)時間(前|後)/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    const direction = hoursMatch[2] === "前" ? -1 : 1;
    const targetDate = new Date(now);
    targetDate.setHours(now.getHours() + hours * direction);
    return formatJSTDate(targetDate);
  }

  throw new Error("相対日付形式の解析に失敗しました");
};

// 日付を日本時間のフォーマットに整形する共通関数
const formatJSTDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("ja-JP", options).format(date);
};

export const handleConvert = (value: string) => {
  if (!value) throw new Error("入力が空です。");

  // 前処理：トリムして余分な空白を削除
  const trimmedValue = value.trim();

  // === ISO形式 (yyyy-MM-ddTHH:mm:ss.sssZ) ===
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(
      trimmedValue
    )
  ) {
    return convertIsoToDatetime(trimmedValue);
  }

  // === タイムスタンプ (秒またはミリ秒) ===
  if (isNumeric(trimmedValue)) {
    const num = Number(trimmedValue);
    // Unix秒 (10桁) またはミリ秒 (13桁) を区別
    if (trimmedValue.length === 10 || trimmedValue.length === 13) {
      return convertTimestampToDatetime(num);
    }
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
  if (
    /^(令和|平成|昭和|大正|明治)?\d+年\d+月\d+日/.test(trimmedValue) ||
    /^\d+年\d+月\d+日/.test(trimmedValue)
  ) {
    return convertJapaneseFormatToJST(trimmedValue);
  }

  // === 英語形式 (Oct 1, 2023、1st October 2023など) ===
  const englishMonths = [
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
  const hasEnglishMonth = englishMonths.some((month) =>
    trimmedValue.toLowerCase().includes(month)
  );

  if (hasEnglishMonth) {
    return convertEnglishFormatToJST(trimmedValue);
  }

  // === 相対的な時間表現 (「昨日」「明日」「3日前」など) ===
  if (
    /昨日|一昨日|明日|明後日|\d+日(前|後)|\d+時間(前|後)|\d+分(前|後)/.test(
      trimmedValue
    )
  ) {
    return convertRelativeDateToJST(trimmedValue);
  }

  // 入力の日付形式が認識できない場合は、標準のDateコンストラクタで試行
  const date = new Date(trimmedValue);
  if (!isNaN(date.getTime())) {
    // 有効な日付に変換できた場合
    return formatJSTDate(date);
  }

  return "対応していない日付形式です。";
};
