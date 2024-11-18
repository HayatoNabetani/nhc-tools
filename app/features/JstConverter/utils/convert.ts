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
