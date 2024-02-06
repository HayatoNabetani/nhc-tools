export const createArrayString = (targetArray: Array<any>) => {
  const formattedString = targetArray
    .map((element) => {
      // 要素が数値でない、かつ、ダブルクォートで囲まれていない場合にダブルクォートを追加
      if (typeof element === "number") {
        // 数値の場合はそのまま
        return element;
      } else if (!element.startsWith('"') && !element.endsWith('"')) {
        // ダブルクォートで囲む
        return `"${element}"`;
      }
      // 既に囲まれている場合はそのまま
      return element;
    })
    .join(", ");
  return `[${formattedString}]`;
};
