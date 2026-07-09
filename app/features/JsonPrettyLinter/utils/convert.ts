const isIndex = (part: string): boolean => /^\d+$/.test(part);

/**
 * JavaScriptのパスへ変換する
 * @param path 特定のkeyやvalueまでのパス
 */
export const toJsPath = (path: string): string => {
  return path
    .split("/")
    .filter((p) => p !== "")
    .map((p) => (isIndex(p) ? `[${p}]` : `.${p}`))
    .join("");
};

/**
 * Pythonのパスへ変換する
 * @param path 特定のkeyやvalueまでのパス
 */
export const toPythonPath = (path: string): string => {
  return path
    .split("/")
    .filter((p) => p !== "")
    .map((p) => (isIndex(p) ? `[${p}]` : `["${p}"]`))
    .join("");
};
