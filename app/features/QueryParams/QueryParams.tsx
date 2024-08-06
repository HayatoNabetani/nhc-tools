import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";
import TextInput from "@/components/elements/TextInput/TextInput";
import { useCallback, useState } from "react";
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

/**
 * http://localhost:8888/api/v1/items?to_date=2024-08-03&interval=2&app_id=6%2C7%2C1%2C2%2C3%2C4%2C5%2C8%2C9%2C10&genre_id=51%2C40%2C294%2C112%2C18&sort=streaming_period-desc%2Ccost-desc&media_type=video&version=1&transition_type_id=1%2C2%2C3&keyword=in%253A%25E3%2583%2580%25E3%2582%25A4%25E3%2582%25A8%25E3%2583%2583%25E3%2583%2588&next=streaming_period%3D98%26cost%3D8183808%26item_id%3D901261
 * のようなURLからドメインとそれぞれのクエリーパラメータを見やすく表示し、新しいURLも作成できる機能
 * @returns
 */
const QueryParams = () => {
  // 分析するURL
  const [url, setUrl] = useState<string>("");

  // 分析URLのそれぞれの部分
  const [urlObject, setUrlObject] = useState<UrlObject | {}>({});

  // クエリーパラメータを自分で選択して、作成するURL
  const [newUrl, setNewUrl] = useState<string>("");

  const handleSetUrl = (inputUrl: string) => {
    setUrl(inputUrl);
    try {
      const parsedUrl = new URL(inputUrl);
      const queryParams: Record<string, string> = {};
      parsedUrl.searchParams.forEach((value: string, key: string) => {
        queryParams[key] = value;
      });
      setUrlObject({
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        searchParams: queryParams,
      });
    } catch (error) {
      console.error("URL解析エラー:", error);
      setUrlObject({});
    }
  };

  const createNewUrl = (targetKey: string) => {
    if (
      urlObject &&
      "protocol" in urlObject &&
      "host" in urlObject &&
      "pathname" in urlObject &&
      "searchParams" in urlObject
    ) {
      const newQueryParams: Record<string, string> = {};
      if (newUrl) {
        const parsedNewUrl = new URL(newUrl);
        parsedNewUrl.searchParams.forEach((value: string, key: string) => {
          newQueryParams[key] = value;
        });
        const newSearchParams = new URLSearchParams(newQueryParams);
        if (newSearchParams.has(targetKey)) {
          newSearchParams.delete(targetKey);
        } else {
          const value = urlObject.searchParams[targetKey];
          if (value) {
            newSearchParams.set(targetKey, value);
          }
        }
        const newUrlString = `${urlObject.protocol}//${urlObject.host}${
          urlObject.pathname
        }?${newSearchParams.toString()}`;
        setNewUrl(newUrlString);
      } else {
        const nowSearchParams = new URLSearchParams(urlObject.searchParams);
        const value: any = nowSearchParams.get(targetKey);
        newQueryParams[targetKey] = value;
        const newSearchParams = new URLSearchParams(newQueryParams);
        const newUrlString = `${urlObject.protocol}//${urlObject.host}${
          urlObject.pathname
        }?${newSearchParams.toString()}`;
        setNewUrl(newUrlString);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col justify-between w-full mb-10">
        <div>
          <div>
            <TextInput
              id="inputUrl"
              textAreaLabel=""
              placeholder="ここにURLを入力"
              value={url}
              disabled={false}
              onChange={handleSetUrl}
            />
          </div>
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
              {"searchParams" in urlObject &&
                Object.entries(urlObject.searchParams).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {key}
                      <ButtonOnlyIcon type="copy" value={key} />
                    </TableCell>
                    <TableCell>
                      {decodeURIComponent(value)}
                      <ButtonOnlyIcon
                        type="copy"
                        value={decodeURIComponent(value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        text={
                          newUrl && new URL(newUrl).searchParams.has(key)
                            ? "不採用"
                            : "採用!!"
                        }
                        handleClick={() => createNewUrl(key)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <div>
            <TextInput
              id="inputNewUrl"
              textAreaLabel=""
              placeholder="作成後のURL"
              value={newUrl}
              disabled={true}
              onChange={setNewUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryParams;
