## NHC Tools

Next.js, tailwindcss, shadcn-ui

1. 配列生成

1. 日本時間変換

1. JSONパス取得

1. クエリパラメータ取得、新規URL生成

1. MongoDBクエリ変換（`/tool/9`）

### MongoDBクエリ変換

Python / PyMongoの辞書形式のクエリを入力すると、MongoDB CompassのFilter欄用に自動変換します。
`True`・`False`・`None`、`datetime.datetime(...)`、`ObjectId(...)`、入れ子の辞書・配列に対応します。
サンプル入力、整形／1行出力、コピー、構文エラーの表示を利用できます。入力はブラウザ内で処理します。

タイムゾーンのない日時は既定でUTCとして扱います。日本時間を入力する場合はJSTを選択してください。
MongoDBの日付精度に合わせ、マイクロ秒を指定する場合は1000の倍数にしてください。

変換処理のテスト: `npm run test:mongo-query`
