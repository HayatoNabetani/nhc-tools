export const transformToObjectsWithCycle = (input: any) => {
  const keys = Object.keys(input);

  // 最初のキーの配列の長さを基準にする
  const firstKey = keys[0];
  const baseLength = input[firstKey].length;

  return Array.from({ length: baseLength }, (_, index) => {
    const obj: any = {};

    // 全てのキーに対して処理
    keys.forEach((key) => {
      const array = input[key];
      // 配列の長さで割った余りを使用することで、循環させる
      obj[key] = array[index % array.length];
    });

    return obj;
  });
};
