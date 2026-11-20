"use client";

import { useState } from "react";
import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";

const fields = [
  {
    name: "decoded",
    label: "デコード済みテキスト",
    placeholder: "ルート検索結果ページ",
  },
  {
    name: "encoded",
    label: "URLエンコード済みテキスト",
    placeholder: "%E3%83%AB%E3%83%BC%E3%83%88",
  },
] as const;

type Field = (typeof fields)[number]["name"];

export default function UrlCodec() {
  const [input, setInput] = useState<{ field: Field; value: string }>({
    field: "decoded",
    value: "",
  });

  const values = { decoded: "", encoded: "", [input.field]: input.value };
  let error = "";
  try {
    if (input.field === "decoded") {
      values.encoded = encodeURIComponent(input.value);
    } else {
      values.decoded = decodeURIComponent(input.value);
    }
  } catch {
    error =
      input.field === "encoded"
        ? "パーセントエンコードの形式またはUTF-8の文字列を確認してください。"
        : "エンコードできない文字が含まれています。";
  }

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        どちらかの欄に入力すると、もう一方に変換結果が表示されます。
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map(({ name, label, placeholder }) => {
          const id = `url-codec-${name}`;
          const fieldError = input.field === name ? error : "";
          return (
            <div key={name} className="min-w-0">
              <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
                <label
                  htmlFor={id}
                  className="text-xs font-medium text-slate-600"
                >
                  {label}
                </label>
                {values[name] && (
                  <ButtonOnlyIcon type="copy" value={values[name]} />
                )}
              </div>
              <div className="field-textarea">
                <textarea
                  id={id}
                  rows={8}
                  spellCheck={false}
                  autoCapitalize="off"
                  placeholder={placeholder}
                  value={values[name]}
                  onChange={(event) =>
                    setInput({ field: name, value: event.target.value })
                  }
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? `${id}-error` : undefined}
                />
              </div>
              {fieldError && (
                <p
                  id={`${id}-error`}
                  className="mt-2 text-sm text-red-700"
                  role="alert"
                >
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
