export const createArrayString = (targetArray: unknown[]): string => {
  const formattedString = targetArray
    .map((element) => {
      // 数値の場合はそのまま
      if (typeof element === "number") {
        return String(element);
      }
      // 文字列の場合
      if (typeof element === "string") {
        // 既にダブルクォートで囲まれている場合はそのまま
        if (
          element.length >= 2 &&
          element.startsWith('"') &&
          element.endsWith('"')
        ) {
          return element;
        }
        // 内部のクォート等をエスケープしつつダブルクォートで囲む
        return JSON.stringify(element);
      }
      // その他の型（オブジェクトや配列など）は適切に文字列化
      return JSON.stringify(element);
    })
    .join(", ");
  return `[${formattedString}]`;
};
