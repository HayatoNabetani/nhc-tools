export type KeyValueInputs = Record<string, string[]>;

export const transformToObjectsWithCycle = (
  input: KeyValueInputs
): Record<string, string>[] => {
  const keys = Object.keys(input);
  if (keys.length === 0) return [];

  // 最初のキーの配列の長さを基準にする
  const baseLength = input[keys[0]].length;

  return Array.from({ length: baseLength }, (_, index) => {
    const obj: Record<string, string> = {};

    // 全てのキーに対して処理
    keys.forEach((key) => {
      const array = input[key];
      // 配列の長さで割った余りを使用することで、循環させる
      obj[key] = array[index % array.length];
    });

    return obj;
  });
};
