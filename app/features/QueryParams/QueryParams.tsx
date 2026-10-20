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
  protocol: string;
  host: string;
  pathname: string;
  searchParams: Record<string, string>;
}

// 二重エンコードされた値でも表示できるように、失敗したら元の値を返す
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
  // 分析するURL
  const [url, setUrl] = useState<string>("");

  // 分析URLのそれぞれの部分
  const [urlObject, setUrlObject] = useState<UrlObject | null>(null);

  // クエリーパラメータを自分で選択して、作成するURL
  const [newUrl, setNewUrl] = useState<string>("");

  // 作成中URLに採用済みのクエリーキー
  const adoptedKeys = useMemo(() => {
    if (!newUrl) return new Set<string>();
    try {
      return new Set(new URL(newUrl).searchParams.keys());
    } catch {
      return new Set<string>();
    }
  }, [newUrl]);

  const handleSetUrl = (inputUrl: string) => {
    setUrl(inputUrl);
    try {
      const parsedUrl = new URL(inputUrl);
      setUrlObject({
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        searchParams: Object.fromEntries(parsedUrl.searchParams),
      });
    } catch {
      // 入力途中のURLは解析できないので無視する
      setUrlObject(null);
    }
  };

  // 対象キーを新URLへ採用/不採用でトグルする
  const toggleQueryParam = (targetKey: string) => {
    if (!urlObject) return;

    const params = newUrl
      ? new URL(newUrl).searchParams
      : new URLSearchParams();

    if (params.has(targetKey)) {
      params.delete(targetKey);
    } else {
      const value = urlObject.searchParams[targetKey];
      if (value !== undefined) {
        params.set(targetKey, value);
      }
    }

    setNewUrl(
      `${urlObject.protocol}//${urlObject.host}${
        urlObject.pathname
      }?${params.toString()}`,
    );
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
              {urlObject &&
                Object.entries(urlObject.searchParams).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {key}
                      <ButtonOnlyIcon type="copy" value={key} />
                    </TableCell>
                    <TableCell>
                      {safeDecode(value)}
                      <ButtonOnlyIcon type="copy" value={safeDecode(value)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        text={adoptedKeys.has(key) ? "不採用" : "採用!!"}
                        handleClick={() => toggleQueryParam(key)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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
