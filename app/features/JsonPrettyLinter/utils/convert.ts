/**
 * JavaScriptのパスへ変換する
 * @param path 特定のkeyやvalueまでののパス
 * @returns
 */
export const toJsPath = (path: string) => {
  return path
    .split("/")
    .filter((p) => p !== "")
    .map((p: any) => (isNaN(p) ? `.${p}` : `[${p}]`))
    .join("");
};

/**
 * Pythonのパスへ変換する
 * @param path 特定のkeyやvalueまでののパス
 * @returns
 */
export const toPythonPath = (path: string) => {
  return path
    .split("/")
    .filter((p) => p !== "")
    .map((p: any) => (isNaN(p) ? `["${p}"]` : `[${p}]`))
    .join("");
};
