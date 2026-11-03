"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";
import { convertMongoQuery, MONGO_QUERY_EXAMPLE } from "./utils/convert";
import styles from "./MongoQueryConverter.module.css";

export default function MongoQueryConverter() {
  const [input, setInput] = useState("");
  const [timezone, setTimezone] = useState<"UTC" | "Asia/Tokyo">("UTC");
  const [format, setFormat] = useState<"pretty" | "compact">("pretty");
  const [copyStatus, setCopyStatus] = useState<{
    output: string;
    success: boolean;
  } | null>(null);

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", warnings: [], error: "" };
    try {
      return { ...convertMongoQuery(input, { timezone, format }), error: "" };
    } catch (error) {
      return {
        output: "",
        warnings: [],
        error:
          error instanceof Error
            ? error.message
            : "変換できませんでした。入力を確認してください。",
      };
    }
  }, [input, timezone, format]);

  const currentCopyStatus =
    copyStatus?.output === result.output ? copyStatus : null;

  const copyOutput = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopyStatus({ output: result.output, success: true });
    } catch {
      setCopyStatus({ output: result.output, success: false });
    }
  };

  const updateInput = (value: string) => {
    setInput(value);
    setCopyStatus(null);
  };

  return (
    <div className={styles.converter}>
      <div className={styles.toolbar}>
        <p>Pythonの辞書を貼り付けると、自動で変換します。</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={() => updateInput(MONGO_QUERY_EXAMPLE)}
          >
            <FlaskConical size={15} aria-hidden="true" />
            サンプルを入力
          </button>
          <button
            type="button"
            className={styles.button}
            disabled={!input}
            onClick={() => updateInput("")}
          >
            <RotateCcw size={14} aria-hidden="true" />
            クリア
          </button>
        </div>
      </div>

      <div className={styles.settings}>
        <label htmlFor="mongo-timezone">
          入力日時のタイムゾーン
          <select
            id="mongo-timezone"
            value={timezone}
            onChange={(event) => {
              setTimezone(event.target.value as "UTC" | "Asia/Tokyo");
              setCopyStatus(null);
            }}
            aria-describedby="mongo-timezone-help"
          >
            <option value="UTC">UTC（標準）</option>
            <option value="Asia/Tokyo">JST（日本時間・UTC+9）</option>
          </select>
        </label>
        <label htmlFor="mongo-format">
          出力形式
          <select
            id="mongo-format"
            value={format}
            onChange={(event) => {
              setFormat(event.target.value as "pretty" | "compact");
              setCopyStatus(null);
            }}
          >
            <option value="pretty">整形（改行あり）</option>
            <option value="compact">1行（改行なし）</option>
          </select>
        </label>
        <p id="mongo-timezone-help">
          タイムゾーン指定のない日時に適用します。出力日時はUTCです。
        </p>
      </div>

      <div className={styles.editors}>
        <div className={styles.editor}>
          <div className={styles.editorHeading}>
            <label htmlFor="mongo-query-input">入力：Python / PyMongo</label>
            <span>dict</span>
          </div>
          <textarea
            id="mongo-query-input"
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            placeholder={"{'ng': False, 'createdAt': {'$gte': datetime.datetime(2025, 1, 1)}, 'parentManageId': {'$exists': True, '$eq': None}}"}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-invalid={Boolean(result.error)}
            aria-describedby={result.error ? "mongo-query-error" : undefined}
          />
        </div>
        <div className={styles.editor}>
          <div className={styles.editorHeading}>
            <label htmlFor="mongo-query-output">出力：MongoDB Compass</label>
            <button
              type="button"
              className={styles.copyButton}
              onClick={copyOutput}
              disabled={!result.output}
            >
              {currentCopyStatus?.success ? (
                <Check size={15} aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
              {currentCopyStatus?.success ? "コピーしました" : "コピー"}
            </button>
          </div>
          <textarea
            id="mongo-query-output"
            value={result.output}
            readOnly
            placeholder="変換したフィルターがここに表示されます"
            spellCheck={false}
            aria-describedby="mongo-paste-help"
          />
        </div>
      </div>

      {result.error && (
        <p id="mongo-query-error" className={styles.error} role="alert">
          {result.error}
        </p>
      )}
      {result.warnings.length > 0 && (
        <ul className={styles.notes}>
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      <p className={styles.copyStatus} role="status">
        {currentCopyStatus &&
          (currentCopyStatus.success
            ? "変換結果をコピーしました。"
            : "コピーできませんでした。出力欄を選択して手動でコピーしてください。")}
      </p>

      <div className={styles.help}>
        <p id="mongo-paste-help">
          出力をCompassの「Filter」欄に貼り付け、「Find」で検索してください。
        </p>
        <p>
          <code>True / False / None</code> → <code>true / false / null</code>、
          <code>datetime.datetime(...)</code> → <code>ISODate(...)</code> に変換します。
          入力はブラウザ内で処理します。
        </p>
        <a
          href="https://www.mongodb.com/docs/compass/query/filter/"
          target="_blank"
          rel="noopener noreferrer"
        >
          MongoDB Compassの公式ガイド ↗
        </a>
      </div>
    </div>
  );
}
