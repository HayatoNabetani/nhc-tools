import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextInput from "@/components/elements/TextInput/TextInput";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/elements/Button/Button";

interface UrlObject {
  baseUrl: string;
  searchParams: [string, string][];
}

const parseUrl = (inputUrl: string): UrlObject | null => {
  const trimmedUrl = inputUrl.trim();
  const normalizedUrl = trimmedUrl.replace(
    /^\\?\s*(https?)\\?:\/\//i,
    "$1://",
  );

  try {
    const parsedUrl = new URL(normalizedUrl);
    if (normalizedUrl !== trimmedUrl) {
      // MarkdownからコピーしたURLのクエリーキー「\_」を戻す
      parsedUrl.search = parsedUrl.search.replace(/(^\?|&)\\_(?==)/g, "$1_");
    }
    return {
      baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`,
      searchParams: Array.from(parsedUrl.searchParams),
    };
  } catch {
    return null;
  }
};

// 二重エンコードされたクエリー値も表示時にデコードする
const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * http://localhost:8888/api/v1/items?to_date=2024-08-03&interval=2&app_id=6%2C7 のような
 * URLからドメインとそれぞれのクエリーパラメータを見やすく表示し、新しいURLも作成できる機能
 */
const QueryParams = () => {
  const [url, setUrl] = useState<string>("");
  const [adoptedIndexes, setAdoptedIndexes] = useState<Set<number> | null>(null);
  const urlObject = useMemo(() => parseUrl(url), [url]);

  let newUrl = "";
  if (urlObject && adoptedIndexes) {
    const params = new URLSearchParams(
      Array.from(adoptedIndexes, (index) => urlObject.searchParams[index]),
    );
    newUrl = `${urlObject.baseUrl}?${params.toString()}`;
  }

  const handleSetUrl = (inputUrl: string) => {
    setUrl(inputUrl);
    setAdoptedIndexes(null);
  };

  const toggleQueryParam = (index: number) => {
    setAdoptedIndexes((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col justify-between w-full mb-10">
        <div>
          <TextInput
            id="inputUrl"
            textAreaLabel="解析するURL"
            placeholder="ここにURLを入力"
            value={url}
            onChange={handleSetUrl}
          />
          {url.trim() && !urlObject && (
            <p className="mb-4 text-sm text-red-700" role="status">
              解析できるURLを入力してください。
            </p>
          )}
        </div>
        <div>
          <Table>
            <TableCaption>クエリーパラメータ一覧</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">クエリーキー</TableHead>
                <TableHead>クエリー値</TableHead>
                <TableHead className="text-right">採用トグル</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urlObject?.searchParams.map(([key, value], index) => {
                const decodedValue = safeDecode(value);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {key}
                      <ButtonOnlyIcon type="copy" value={key} />
                    </TableCell>
                    <TableCell>
                      {decodedValue}
                      <ButtonOnlyIcon type="copy" value={decodedValue} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        text={adoptedIndexes?.has(index) ? "不採用" : "採用!!"}
                        handleClick={() => toggleQueryParam(index)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div>
          <TextInput
            id="inputNewUrl"
            textAreaLabel="作成したURL"
            placeholder="作成後のURL"
            value={newUrl}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default QueryParams;
