export const createArrayString = (targetArray: Array<any>) => {
  const formattedString = targetArray
    .map((element) => {
      // 数値の場合
      if (typeof element === "number") {
        return element;
      }
      // 文字列の場合
      else if (typeof element === "string") {
        // 既にダブルクォートで囲まれているかチェック
        if (!element.startsWith('"') && !element.endsWith('"')) {
          return `"${element}"`;
        }
        return element;
      }
      // その他の型の場合（オブジェクトや配列など）
      else {
        // JSON.stringifyを使用して適切に文字列化
        return JSON.stringify(element);
      }
    })
    .join(", ");
  return `[${formattedString}]`;
};
