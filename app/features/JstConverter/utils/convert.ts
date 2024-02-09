import { format } from "date-fns";
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
