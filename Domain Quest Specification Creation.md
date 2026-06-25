# **Domain Quest プロダクト仕様書**

## **1\. プロダクト概要**

本プロダクト「Domain Quest」（仮称：〇〇クエスト）は、ソフトウェア開発プロジェクトに新規参画したエンジニアが、社内ドキュメント、仕様書、各種情報共有ツール（Google Docs、Notionなど）から抽出されたプロジェクト固有のドメイン知識や技術仕様を学習するためのローカルファーストWebアプリケーションである。  
単なる一問一答のクイズアプリや単調な暗記ツールとは異なり、レトロRPG風のインターフェースを採用することで、学習過程にゲーミフィケーションの要素を取り入れている。ユーザーは自身のローカル環境の指定ディレクトリに配置されたJSON形式のクイズデータを読み込み、配属プロジェクトの仕様を擬人化した「〇〇ドラゴン」とのバトルを通じて知識の定着を図る。特に、完全無欠の理解を証明するための「Max Mode」を備えており、配属初期のキャッチアップの成果を客観的に可視化・証明することを最終的な目的とする。本システムはNext.jsの静的エクスポート機能を利用し、サーバーを介さず完全にフロントエンドのみで完結する堅牢なローカルファーストアーキテクチャを採用している1。

## **2\. 解決したい課題**

配属初期のエンジニアおよび受け入れ側のチームが直面する以下の課題を、ゲーミフィケーションと自己評価の可視化によって解決する。

| 課題の分類 | 現状の課題とペインポイント | 本アプリによる解決策・アプローチ |
| :---- | :---- | :---- |
| **理解度の不可視性** | 社内仕様書やドメイン知識を「読んだ」という事実と「理解した」という状態の間に乖離がある。読んだだけでは身についたか自己評価しづらい。 | 確認テストを通じたスコア化により、理解度を定量的に可視化する。 |
| **客観的証明の欠如** | メンターやレビュワーに対して「ドキュメントを読みました、理解しました」と申告しても、それが客観的な習熟度の証明になりづらい。 | Max Mode（ノーミスクリア）の達成画面を提示することで、完全な理解を客観的に証明する。 |
| **自己の盲点の把握困難** | 仕様書のどの部分を誤解しているか、あるいは見落としているかを、実務での失敗前に把握する手段が乏しい。 | 誤答履歴を蓄積し、自身の知識の穴をReviewモードで効率的に発見・補強する。 |
| **業務ドメイン知識の障壁** | 技術的な知識（フレームワークや言語）だけでなく、配属先固有の業務知識や運用ルールの理解が初期のボトルネックとなる。 | プロジェクト固有の用語や仕様（domainカテゴリ）と一般技術（techカテゴリ）を区別し、集中的に学習可能にする。 |
| **継続性の欠如** | 単調な暗記アプリやドキュメントの反復読み出しでは、モチベーションが維持しづらい。 | RPG風の演出、ダメージ計算、称号システムにより、1日1回のプレイを促す。 |
| **根拠資料へのアクセス性** | 間違えた際に「なぜ間違えたか」「どこを読み直すべきか」を示す根拠資料への導線が即座に提示されない。 | 誤答時に即座に解説、引用（sourceQuote）、および一次資料へのリンク（sourceUrl）を提示する。 |

## **3\. 想定ユーザー**

本アプリケーションのペルソナは、プロジェクトチーム内の以下のメンバーを想定している。

* **新規配属エンジニア（主な利用者）**: 新しくプロジェクトにアサインされ、膨大な社内ドキュメントを読み込み、仕様や業務ドメインの理解を早期に深める必要がある開発者。  
* **若手・中堅エンジニア**: 先輩やレビュワーに対して、キャッチアップの完了を定量的なスコアとして客観的に示したいメンバー。  
* **メンター・オンボーディング担当者**: 新規メンバーの理解度を確認し、適切なタイミングで実務タスクを割り振るための指標を求めるチームリーダー。  
* **セキュリティ意識の高い開発組織**: 社内の機密情報を含むドキュメントやクイズ内容を外部のSaaS型クイズアプリに入力せず、ローカル環境のみで安全に学習環境を構築したい組織。

## **4\. ユースケース**

本プロダクトは、オンボーディング期間中のエンジニアの行動に寄り添う以下のユースケースを想定して設計されている。

1. **初期学習（Normal Mode）**: ユーザーはプロジェクトのドキュメントを一通り読んだ後、本アプリをローカルで起動し「Normal Mode」で挑戦する。間違えた問題については、表示される解説と引用、根拠資料へのリンクを辿り、該当ドキュメントを再読・復習する。  
2. **定着度向上（Hard Mode）**: 日々の業務の合間や朝の始業時に1日1回挑戦し、連続正解数を伸ばす。スコアの推移（初回20点から徐々に100点へ向上する過程）をHistory画面で確認し、自身の成長を実感する。  
3. **習熟の証明（Max Mode）**: プロジェクトの主要仕様を完全に理解したと自信を持った段階で「Max Mode」に挑戦する。20問連続ノーミスでクリアした結果画面のスクリーンショットを撮影し、チームのチャットツール（SlackやTeams等）で共有してキャッチアップ完了を報告する。  
4. **弱点克服（Review）**: History画面から過去に間違えた問題（MistakeRecord）のみを抽出したモードをプレイし、自身の知識の穴を埋める。

## **5\. MVPスコープ**

MVP（Minimum Viable Product）として、1〜2日の短期開発で検証可能な初版に含めるべきコア機能は以下の通りとする。

* **ローカルファーストアーキテクチャ**: next.config.ts での output: 'export' 指定による完全な静的HTML/JSへのエクスポート1。これによりサーバーレスでの稼働を実現する。  
* **ローカルJSON読み込み**: public/quests/ ディレクトリ内に配置されたローカルJSONファイル（index.json および各クエストJSON）の fetch による読み込み機構。  
* **スキーマバリデーション**: Zodを用いた厳格なJSONスキーマバリデーションの実装3。形式の不正を未然に防ぎ、エラー箇所を特定して画面に表示する。  
* **基本画面構成**: Title、Mode Select、Battle、Result、History、Reviewの各画面のUI構築および状態遷移の実装。  
* **レトロRPG風UI**: Tailwind CSSの標準ユーティリティ（border-double, bg-black, text-white等）を活用し、外部画像素材に依存しない純粋なCSSとテキストベースのUI構築4。  
* **ゲームロジック**: Normal / Hard / Max の3つの難易度モードにおけるHP増減ロジック。  
* **出題エンジン**: 全問題リストから1バトル20問をランダムに抽出するアルゴリズムの実装。  
* **永続化**: ユーザー設定、プレイ履歴、誤答記録の localStorage への永続化。ここでもZodを利用してデータのパースを安全に行う6。

## **6\. 非MVPスコープ**

初回リリース時の実装コストを抑え、コア価値の検証に集中するため、以下の機能は初版では実装せず、将来的な拡張要件とする。

* **ファイルアップロード機能**: ブラウザ上でのJSONファイルのドラッグ＆ドロップやファイル選択ダイアログを通じた読み込み。MVPでは指定ディレクトリへの直接配置とする。  
* **認証およびサーバーサイド保存**: ログイン・サインアップ機能、データベース構築、バックエンドAPIの実装。  
* **高度なメディアアセット**: 既存ゲームのIPに依存する画像素材、BGM、効果音の実装。  
* **複雑な演出**: パーティクルエフェクトや複雑なCSSアニメーション。  
* **エディタ機能**: クエストJSONをブラウザ上で作成・編集・出力するためのGUIエディタ画面。

## **7\. 画面一覧**

本アプリケーションは、単一ページアプリケーション（SPA）として動作し、以下の6つの主要画面（ビュー）で構成される。

1. **Title / Home** (タイトル・ホーム画面)  
2. **Mode Select** (難易度選択画面)  
3. **Battle** (バトル画面)  
4. **Result** (結果画面)  
5. **History** (履歴画面)  
6. **Review** (復習画面)

## **8\. 各画面の詳細仕様**

### **1\. Title / Home**

* **状態・役割**: アプリ起動時に最初に表示される画面。localStorage からユーザー設定（AppSettings）を読み込み復元する。起動と同時に public/quests/index.json を非同期でFetchし、プレイ可能なクエスト一覧を構築する。  
* **表示要素**:  
  * アプリタイトル（例：「Domain Quest」「〇〇クエスト」）。  
  * サブコピー：「仕様を理解せし者よ、{dragonName}を討伐せよ。」  
  * 勇者名入力フォーム（初期値は localStorage の playerName）。  
  * クエスト選択ドロップダウン（index.json に定義されたリスト）。  
  * クエスト名表示（選択中のクエストの title。ユーザーが上書き入力可能）。  
  * 選択中クエストのメタ情報（dragonName、総問題数、カテゴリ別問題数 domain: n問 / tech: n問）。  
  * 「冒険を始める」ボタン。  
  * JSON追加方法の案内文（例：「クエストを追加するには public/quests/ にJSONファイルを置き、index.jsonに追記してください」）。  
* **アクション**:  
  * 勇者名・クエスト名の変更時、localStorage を即時更新する。  
  * クエスト選択時、対象のJSONファイルをFetchしてZodバリデーションを実行。成功すれば問題数をカウントし画面に反映する。  
  * JSON読み込み前、またはバリデーションエラー時は「冒険を始める」ボタンを非活性化（Disabled）とする。

### **2\. Mode Select**

* **状態・役割**: クエスト選択完了後、難易度を決定する画面。  
* **表示要素**:  
  * Normal Mode, Hard Mode, Max Mode の3つの選択肢をカードUIで表示。  
  * 各カードには、初期プレイヤーHP、不正解時のダメージ量、敗北条件（許容ミス数）を明記する。  
  * 前回の選択モードをハイライト表示（localStorage の preferredMode に基づく）。  
* **アクション**:  
  * モードを選択・クリックした瞬間に QuizSession を新規発行し、状態を初期化してBattle画面へ遷移する。

### **3\. Battle**

* **状態・役割**: クイズ進行中のメイン画面。選出された20問の状態、プレイヤーHP、敵HP、現在の出題インデックスを管理する。  
* **表示要素**:  
  * **ヘッダー**: 敵のHPバー（Max 100）、プレイヤーのHPバー（Maxはモード依存）。現在の問題番号（例: 1/20）。  
  * **メイン領域**: 問題文テキスト。選択肢ボタン（4択）。  
  * **フッター・ログ領域**: アクション結果のテキストをタイプライター風に表示する領域。  
* **アクションと演出**:  
  * 選択肢クリック後、即座に正誤判定を行う。  
  * **正解時**: 「正解！」「{playerName}のこうげき！」「{dragonName}に 5 のダメージ！」のテキスト表示と共に、敵HPのプログレスバーを減少させる。  
  * **不正解時**: 「ミス！」「{dragonName}のこうげき！」「{playerName}は {damage} のダメージをうけた！」のテキスト表示と共に、プレイヤーHPのプログレスバーを減少させる。  
  * **Max Mode不正解時**: 「敵の攻撃力が100倍になった！」「{dragonName}のこうげき！」「{playerName}は 9999 のダメージをうけた！」「ちからつきた...」の特殊なログを流した後、即ゲームオーバー状態へ移行する。  
  * 回答後は、正誤に関わらず画面下部に「解説（explanation）」「根拠資料のタイトル（sourceTitle）・セクション（sourceSection）・引用（sourceQuote）」を展開する。sourceUrl が存在すれば「元資料を開く」外部リンクボタンを表示する8。  
  * 「次の問題へ」ボタンで進行。20問消化またはプレイヤーHPが0になった時点でResult画面へ遷移する。

### **4\. Result**

* **状態・役割**: バトル終了後のスコア計算および統計の表示画面。セッション結果を localStorage に保存する。  
* **表示要素**:  
  * 討伐成功 / ちからつきた の巨大テキスト（勝敗結果）。  
  * 獲得スコア（正答数×5点）、全体の正答率、Category別正答率（tech / domain それぞれの正答率）。  
  * 初回プレイ時のスコアとの差分（成長度の可視化）、過去の最高スコアの表示。  
  * 当該セッションで間違えた問題の一覧リスト（問題文冒頭と解説へのアコーディオンUI）。  
  * 「タイトルに戻る」「復習へ進む」ボタン。

### **5\. History**

* **状態・役割**: 過去の全セッションの統計と成長の軌跡を確認する画面。  
* **表示要素**:  
  * サマリー情報：初回スコア、最新スコア、最高スコア。  
  * モード別のクリア回数、特に「Max Modeクリア履歴」のバッジ表示（証明書としての役割）。  
  * 過去のセッション一覧（日時、クエスト名、モード、スコアのリスト表示）。  
  * データの全リセットボタン（localStorage のクリア処理、誤操作防止の確認モーダル付き）。

### **6\. Review**

* **状態・役割**: MistakeRecord （誤答履歴）から未解決（resolved: false）の問題のみを抽出し、再出題する復習特化画面。  
* **表示要素**:  
  * 基本UIはBattle画面に準拠するが、HPの概念や敵キャラクターは存在せず、純粋な学習ドリルとして機能する。  
  * 連続正解により resolved: true に更新され、リストから消込される仕組み。

## **9\. ユーザーフロー**

アプリ起動から終了までの基本トランジションは以下の通り定義される。  
\[アプリ起動\]  
↓ (index.json の自動フェッチ)  
\[Title / Home\] ──(設定・履歴ボタン)──\> \[History\]  
↓ クエスト選択 & JSONロード & バリデーション  
\[Mode Select\]  
↓ モード決定 & QuizSession初期化  
\[Battle\]  
├─ 正解 ──\> (敵HP \-5) ──┐  
├─ 不正解 ─\> (プレイヤーHP減少、解説表示) ─┤  
│ ↓  
│ \[次の問題へ\]  
│ ↓  
└────────────────\> (20問終了 or プレイヤーHP0)  
↓  
\[Result\] ─────────────\> \[Review (間違えた問題のみ再出題)\]  
↓  
\[Title / Home\]へ戻る

## **10\. 問題JSONスキーマ**

問題データは以下の形式のJSON配列として定義する。Zodを用いて厳格に型と値を検証するため、フィールドの欠損や想定外のデータ型はロード時に弾かれる3。

JSON  
\[  
  {  
    "id": "q001",  
    "category": "domain",  
    "question": "ユーザー登録時のパスワード最小文字数と、必須となる文字種の組み合わせとして正しい仕様はどれか？",  
    "choices": \[  
      "8文字以上、英小文字・英大文字・数字の3種必須",  
      "8文字以上、英字・数字の2種必須",  
      "12文字以上、英小文字・英大文字・数字・記号の4種必須",  
      "10文字以上、文字種制限なし"  
    \],  
    "answerIndex": 2,  
    "explanation": "2024年4月のセキュリティ要件改定により、全サービスで12文字以上かつ4文字種の混在が必須となりました。",  
    "sourceTitle": "認証基盤セキュリティ仕様書 v2.1",  
    "sourceSection": "3.1 パスワードポリシー",  
    "sourceUrl": "https://docs.company.local/auth/security-policy\#password",  
    "sourceQuote": "ユーザーのアカウント保護を強化するため、新規登録およびパスワード変更時には、最低12文字以上とし、英大文字、英小文字、数字、記号（\!@\#$%^&\*等）の4種類すべてを含むことをシステム側で強制する。"  
  }  
\]

## **11\. クエスト一覧JSONスキーマ**

public/quests/index.json に配置されるクエストメタデータの配列。アプリの初期表示時に利用される。

JSON  
\[  
  {  
    "id": "sample",  
    "title": "Sample Quest",  
    "dragonName": "Sample Dragon",  
    "file": "/quests/sample.json"  
  },  
  {  
    "id": "auth-system",  
    "title": "認証基盤リプレイス",  
    "dragonName": "認証ドラゴン",  
    "file": "/quests/auth-system.json"  
  }  
\]

## **12\. バリデーション仕様**

外部から読み込むJSONデータに対して、実行時型検査ライブラリであるZodを利用して厳格なバリデーションを行う。バリデーションエラー時は safeParse の結果から flattenError().fieldErrors を利用して、どの問題のどのプロパティに異常があるかを階層的に抽出し、ユーザーに提示する3。

| 検証対象 | Zodルール | エラーハンドリング / UI表示 |
| :---- | :---- | :---- |
| id | z.string().min(1) | 一意性チェックはパース後に配列全体で実行。重複時「idが重複しています」表示。 |
| category | z.enum(\["tech", "domain"\]) | スキーマ不一致時「categoryはtechまたはdomainを指定してください」と表示。 |
| question | z.string().min(1) | 空文字の場合はエラー。 |
| choices | z.array(z.string()).length(4) | 要素数が4以外の場合、エラー表示。配列長を固定することでUIの崩れを防ぐ。 |
| answerIndex | z.number().int().min(0).max(3) | 0〜3以外の数値が指定された場合、エラー。 |
| explanation | z.string() | 未定義の場合はエラー。空文字は許容するが推奨しない。 |
| sourceTitle 等 | z.string() | 未定義または別の型の場合はエラー。 |

## **13\. ゲームロジック仕様**

* **ダメージ計算**: モードを問わず、1問正解につき敵に一律 **5ダメージ** を与える。敵の基本HPは **100** であり、20問正解で討伐（HP 0）となる。  
* **勝敗判定**:  
  * 敵HP \<= 0: 討伐成功（クリア）。  
  * プレイヤーHP \<= 0: ゲームオーバー（ちからつきた）。  
  * 上記の条件を満たさずに20問出題が終了した場合もゲームオーバー扱い（敵を倒しきれなかった）とするが、スコア自体はResultへ引き継がれ記録される。

## **14\. モード別パラメータ**

プレイヤーの習熟度と目的に合わせて、以下の3つのモードを提供する。

| モード名 | 目的 | プレイヤーHP | 不正解時被ダメージ | 許容ミス数 | 特殊演出 |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Normal** | 初期の理解確認。ドキュメントを一読した後の最初のテスト用。 | 100 | 10 | 9回（10回目で敗北） | なし |
| **Hard** | 理解の精度向上。実務に入る前の総仕上げ用。 | 100 | 25 | 3回（4回目で敗北） | なし |
| **Max** | 完全理解の証明。先輩やレビュワーへの報告用。 | 1 | 9999 | 0回（1問ミスで即敗北） | 被ダメージ「9999」、即時ゲームオーバー画面遷移 |

## **15\. 20問バトル設計**

毎日の学習を重すぎない負荷で継続させるため、1セッションは必ず20問で完結する設計とする。

* 全問題（例えば200問のJSON）の中から、1回のバトル開始時にランダムに20問を抽出する。抽出アルゴリズムには偏りのないFisher-Yatesシャッフルを採用する。  
* 抽出された20問に対してインデックス（0〜19）を振り、シーケンシャルに出題する。  
* カテゴリの比率（tech / domain）は、デフォルトでは全問題の比率に依存する完全ランダムとする。  
* 初回読み込み時に問題データ自体が20問未満の場合は、存在する全問題を出題する。その際、敵の最大HPは「問題数 × 5」に自動調整し、全問正解で討伐できるようにバランスを取る。

## **16\. localStorage 保存仕様**

ブラウザの localStorage への保存時は、JSONパースの安全性と型の整合性を担保するため、Zodによる検証を通すカスタムフック（useZodLocalStorage 等）を実装する6。万が一データの構造が変わっていたり、破損していたりする場合は、エラーをキャッチしてデフォルト値にフォールバックする安全な設計とする。 また、社内情報の漏洩リスクを下げるため、**問題の本文、選択肢テキスト、解説、引用文（sourceQuote）、URL（sourceUrl）は一切保存しない**。保存するのはID、カテゴリ、正誤判定、スコアなどのメタデータのみとする。

### **保存キーと内容**

| localStorage Key | 目的 | 内容の概要 |
| :---- | :---- | :---- |
| dq\_app\_settings | アプリの基本設定 | プレイヤー名、選択中のクエストID、最後にプレイしたモード。 |
| dq\_quiz\_history | 過去のセッション履歴 | QuizSession の配列。各セッションごとのスコアや日時を記録。 |
| dq\_mistake\_records | 誤答履歴 | MistakeRecord の配列。特定の問題IDに対する間違えた回数やフラグを管理。 |

## **17\. 型定義案 (TypeScript)**

ドメインモデルを正確に表現し、コンポーネント間で型安全性を担保するため、以下のTypeScript型定義（および対応するZodスキーマ）を設ける。

TypeScript  
import { z } from "zod";

// \--- 問題JSON用 \---  
export const QuestionSchema \= z.object({  
  id: z.string().min(1),  
  category: z.enum(\["tech", "domain"\]),  
  question: z.string().min(1),  
  choices: z.array(z.string()).length(4), // UIレイアウト保護のため要素数4を強制  
  answerIndex: z.number().int().min(0).max(3),  
  explanation: z.string(),  
  sourceTitle: z.string(),  
  sourceSection: z.string(),  
  sourceUrl: z.string(), // z.url() の利用も検討するが、社内ローカルパス対応のため string を許容  
  sourceQuote: z.string()  
});  
export type Question \= z.infer\<typeof QuestionSchema\>;

// \--- クエストメタ用 \---  
export const QuestMetaSchema \= z.object({  
  id: z.string().min(1),  
  title: z.string().min(1),  
  dragonName: z.string().min(1),  
  file: z.string().startsWith("/quests/")  
});  
export type QuestMeta \= z.infer\<typeof QuestMetaSchema\>;

// \--- localStorage保存用 \---  
export const AppSettingsSchema \= z.object({  
  playerName: z.string().default("勇者"),  
  questTitle: z.string().default(""),  
  lastSelectedQuestId: z.string().nullable().default(null),  
  preferredMode: z.enum(\["Normal", "Hard", "Max"\]).default("Normal")  
});  
export type AppSettings \= z.infer\<typeof AppSettingsSchema\>;

export const QuizAttemptSchema \= z.object({  
  questionId: z.string(),  
  isCorrect: z.boolean(),  
  category: z.enum(\["tech", "domain"\]),  
  answeredAt: z.string().datetime()  
});  
export type QuizAttempt \= z.infer\<typeof QuizAttemptSchema\>;

export const QuizSessionSchema \= z.object({  
  id: z.string().uuid(),  
  questId: z.string(),  
  questTitle: z.string(),  
  dragonName: z.string(),  
  mode: z.enum(\["Normal", "Hard", "Max"\]),  
  startedAt: z.string().datetime(),  
  finishedAt: z.string().datetime().nullable(),  
  totalQuestions: z.number(),  
  correctCount: z.number(),  
  cleared: z.boolean(),  
  gameOver: z.boolean(),  
  attempts: z.array(QuizAttemptSchema)  
});  
export type QuizSession \= z.infer\<typeof QuizSessionSchema\>;

export const MistakeRecordSchema \= z.object({  
  questionId: z.string(),  
  count: z.number(),  
  lastMistakenAt: z.string().datetime(),  
  resolved: z.boolean()  
});  
export type MistakeRecord \= z.infer\<typeof MistakeRecordSchema\>;

## **18\. コンポーネント設計案**

Reactのコンポーネントは役割ごとに分割し、Tailwind CSSによるスタイリングを適用する。レトロRPG風のUIを実現するため、外部ライブラリは使わず border-double などのTailwind標準ユーティリティを組み合わせる4。

* **Layouts**:  
  * AppLayout: 全画面共通の黒背景、中央寄せのコンテナ。bg-black text-white font-mono をベースとする。  
* **Features / Battle**:  
  * BattleHeader: HPバーを実装。Tailwindの幅ユーティリティ（w-full, w-1/2）と背景色（bg-red-500）を動的に切り替えてHPを視覚化する。  
  * QuestionCard: 問題文を表示する枠組み。border-4 border-double border-gray-400 p-4 rounded を用い、RPG風のダイアログボックスを表現する4。  
  * ChoiceList / ChoiceButton: 4つの選択肢。Hoverステートのスタイル（hover:bg-gray-800 transition-colors）により、インタラクティブなフィードバックを提供する5。  
  * BattleLog: ダメージや正誤演出のテキストを表示する領域。  
  * ExplanationPanel: 不正解/正解後に展開される解説領域。  
* **Features / Result**:  
  * StatBoard: スコア、カテゴリー別正答率を表示するコンポーネント。divide-y divide-dashed などを用いてセクションを区切る4。  
* **UI Elements**:  
  * Button: レトロRPG風の共通ボタン。  
  * ProgressBar: HPの増減を可視化するプログレスバー。

## **19\. ディレクトリ構成案**

Next.js (App Router) の静的エクスポート（output: 'export'）を前提とした構成を採用する2。ダイナミックルーティングの最適化等の高度なサーバー機能は利用せず、純粋なクライアントサイドアプリーケーションとして構築する。  
├── next.config.ts \# output: 'export' および images: { unoptimized: true } の指定  
├── package.json  
├── public/  
│ └── quests/ \# JSONファイルの配置ディレクトリ (Git管理外)  
│ ├── index.sample.json  
│ ├── sample.json  
│ └── .gitkeep  
├── src/  
│ ├── app/  
│ │ ├── page.tsx \# Title / Home  
│ │ ├── layout.tsx \# ルートレイアウト (フォントやグローバルCSSの読み込み)  
│ │ ├── mode/page.tsx \# Mode Select  
│ │ ├── battle/page.tsx\# Battle  
│ │ ├── result/page.tsx\# Result  
│ │ └── history/page.tsx  
│ ├── components/  
│ │ ├── ui/ \# 汎用コンポーネント (Button, Card, ProgressBar)  
│ │ └── battle/ \# バトル機能特化コンポーネント  
│ ├── hooks/  
│ │ ├── useGameState.ts \# ゲーム進行のステート管理  
│ │ ├── useLocalStorage.ts \# Zodを用いた安全なストレージ操作フック  
│ │ └── useQuestLoader.ts \# JSONのFetchとバリデーションをカプセル化したフック  
│ ├── lib/  
│ │ ├── schemas.ts \# Zodスキーマ定義群  
│ │ └── utils.ts \# シャッフル関数、クラス名結合(clsx/tailwind-merge)など  
│ └── types/ \# 型定義の再エクスポート

## **20\. UI文言一覧**

アプリ全体で統一感のあるレトロRPG風の世界観を維持するため、以下の文言を標準仕様とする。敵名は「知識ドラゴン」固定にせず、クエストメタ情報から動的に展開する。

| シーン | 文言 | 変数展開 |
| :---- | :---- | :---- |
| **タイトル画面** | 「{questTitle}」 | 選択中クエスト名 |
|  | 「仕様を理解せし者よ、{dragonName}を討伐せよ。」 | ドラゴン名 |
|  | 「冒険を始める」 | \- |
|  | 「クエストを追加するには public/quests/ にJSONファイルを置き、index.jsonに追記してください」 | \- |
| **JSON読込完了** | 「{totalQuestions}問の知識が この地に封印された。」 | 総問題数 |
|  | 「domain: {domainCount}問 / tech: {techCount}問」 | カテゴリ別問題数 |
| **クイズ正解時** | 「正解！」 | \- |
|  | 「{playerName}のこうげき！」 | プレイヤー名 |
|  | 「{dragonName}に 5 のダメージ！」 | ドラゴン名 |
| **クイズ不正解時** | 「ミス！」 | \- |
|  | 「{dragonName}のこうげき！」 | ドラゴン名 |
|  | 「{playerName}は {damage} のダメージをうけた！」 | プレイヤー名、ダメージ量 |
| **Max Modeミス時** | 「敵の攻撃力が100倍になった！」 | \- |
|  | 「{playerName}は 9999 のダメージをうけた！」 | プレイヤー名 |
|  | 「ちからつきた...」 | \- |
| **クリア時** | 「{dragonName}を討伐した！」 | ドラゴン名 |
|  | 「称号を獲得しました：{questTitle} 見習い卒業」 | クエスト名 |

## **21\. エラーハンドリング**

ローカル運用時のトラブルシューティングを容易にするため、データの不整合や欠損に対しては無言でクラッシュさせるのではなく、原因を特定しやすいエラーメッセージを画面に表示する。Zodのバリデーションエラーは flattenError または treeifyError を用いて人間が読める形式に変換する3。

| エラー状況 | UI表示・振る舞い (Graceful Degradation) |
| :---- | :---- |
| index.json が見つからない | 警告パネル：「public/quests/index.json が存在しません。ファイル名と配置パスを確認してください。」 |
| index.json の形式が壊れている | 警告パネル：「クエスト一覧のパースに失敗しました。JSONの構文（カンマ忘れ、クオート漏れなど）を確認してください。」 |
| index.json にクエストが0件 | 警告パネル：「クエストが登録されていません。index.json にクエスト配列を追記してください。」 |
| 選択したクエストJSONが無い | 警告パネル：「{file} の読み込みに失敗しました。ファイルが存在するか確認してください。」 |
| 問題JSONの形式が不正 | 警告パネル：「{N}番目の問題でエラーが発生しました。 フィールド: {Field} \- 理由: {Message}」（例: 3番目の問題でエラー: choices \- 要素数は4つである必要があります）3 |
| 問題数が20問未満 | 警告テキスト表示：「問題数が20問未満です。全{N}問でバトルを開始します。」として、処理自体は継続・進行可能とする。 |
| id が重複している | 警告パネル：「問題ID '{id}' が複数回使われています。一意のIDを設定してください。」 |
| localStorage への保存失敗 | トースト通知：「プレイデータの保存に失敗しました。ブラウザのシークレットモード等の制限を確認してください。」機能制限状態でプレイは続行可能。 |
| sourceUrl 等が空文字の場合 | UI上から「元資料を開く」ボタンや引用ブロックのレンダリングをスキップし、レイアウト崩れを防ぐ。 |

## **22\. セキュリティ・情報管理上の注意**

本アプリは「社内ドキュメント」という機密性の高いデータを扱うため、情報漏洩を防ぐ運用ルールをシステム設計レベルで強制する。

1. **完全ローカルファーストの徹底**: アプリはNext.jsの機能によって静的ファイルとしてビルドされ、ローカルのブラウザ上でのみ動作する。外部APIやトラッキングツールへの通信処理は一切実装しない1。  
2. **Git管理からの除外**: 本物の社内JSONデータを誤ってGitHub等のパブリック/プライベートリポジトリにプッシュしないよう、.gitignore で public/quests/ 配下を厳格に除外する。  
3. **ストレージへの保存制限**: localStorage には問題の本文や引用文（ドメイン知識そのもの）を保存しない。万が一ブラウザの拡張機能やXSS攻撃等で localStorage が読み取られたとしても、意味不明なID文字列やスコアの数値しか取得できない設計とする6。  
4. **ローカルサーバー起動時の注意**: 開発環境（npm run dev）や静的配信（npx serve out）でローカルサーバーを起動している間は、同一ネットワーク内の他端末から http://\<ローカルIP\>:3000/quests/xxx.json へアクセスされるリスクがゼロではない。READMEにて「パブリックなWi-Fi環境下で社内JSONを配置したままサーバーを公開状態にしないこと」を明記する。

## **23\. .gitignore 案**

社内情報を絶対にコミットさせないための推奨設定。この設定により、開発者がうっかり git add . を実行しても、実データはステージングされない。

コード スニペット  
\# ... (Next.js default gitignore) ...

\# \----------------------------------------------------------------------------  
\# Domain Quest: クエストJSONの除外設定  
\# 機密情報を含むJSONファイルがリポジトリに混入することを防ぐための厳格な設定  
\# \----------------------------------------------------------------------------  
public/quests/\*  
\!public/quests/.gitkeep  
\!public/quests/sample.json  
\!public/quests/index.sample.json

## **24\. READMEに書くべき注意事項**

本アプリケーションの利用を開始する開発者向けに、以下の情報をREADMEへ明確に記載する（詳細は「C. READMEドラフト」セクションを参照）。

* アプリの目的と、ローカルファーストという設計思想の背景。  
* 自身の環境の public/quests ディレクトリに対するJSONの配置手順とルール。  
* **【最重要】社内情報を絶対にコミットしないための警告**。

## **25\. 実装ステップ**

MVPを最短（1〜2日）で組み上げるための、依存関係を考慮したフェーズ分け。

1. **Phase 1: プロジェクトセットアップ**  
   * Next.js \+ Tailwind CSSの導入。  
   * next.config.ts で output: 'export' および images: { unoptimized: true } を設定し、完全静的書き出しに対応させる1。  
2. **Phase 2: データ層とバリデーションの構築**  
   * Zodの導入と src/lib/schemas.ts におけるスキーマ定義3。  
   * public/quests/ にサンプルJSONを配置。  
   * fetch とZodを組み合わせたJSONローダーの実装。  
3. **Phase 3: 永続化層の構築**  
   * Zodを用いて安全に localStorage を読み書きするカスタムフック（useZodLocalStorage等）の作成6。  
4. **Phase 4: ルーティングと状態管理の基盤**  
   * Title画面とMode Select画面の作成。選択したクエストとモードをグローバルステート（または上位コンポーネント）に保持する。  
5. **Phase 5: バトルエンジン（コアロジック）実装**  
   * 配列シャッフルアルゴリズム。  
   * インデックスに応じた問題の表示。  
   * 選択肢押下時の正誤判定、HP計算、ダメージ演出、および解説の表示。  
   * Max Modeにおける即時ゲームオーバー処理の割り込み。  
6. **Phase 6: 結果と履歴の実装**  
   * Result画面へのスコア引き継ぎと表示。  
   * プレイ終了時の QuizSession と MistakeRecord の localStorage への保存処理。  
   * History画面のリスト表示。  
7. **Phase 7: スタイリングの仕上げ**  
   * Tailwind CSSを活用したレトロRPG風のUI調整（border-double等の適用）4。

## **26\. GitHub Issue分解**

実装タスクを細分化し、それぞれの完了条件を定めたIssue単位のリスト（詳細は「B. GitHub Issue分解」セクションを参照）。

## **27\. 将来拡張案**

MVP完了後に検討すべき、本アプリケーションの価値をさらに高めるための拡張要件。

* **苦手問題優先出題アルゴリズム**: 単純なランダム出題に加え、MistakeRecord に基づき、間違えた回数が多い問題（resolved: false）の出現確率を意図的に上げる学習効率化ロジック。  
* **タイムアタック要素**: 1問あたりの回答までにかかった時間を計測し、素早く答えた場合はスコアに乗算ボーナスを与えるロジック。直感的な理解度を測る。  
* **PWA（Progressive Web App）化**: サービスワーカーを登録し、アプリ本体とJSONデータをローカルにキャッシュすることで、ローカルサーバーすら不要な完全オフライン環境での起動・プレイを実現する。  
* **暗号化JSONのサポート**: JSONファイル自体をAES等で暗号化して配置しておき、アプリ起動時にブラウザ上で復号パスワードを入力させる仕組み。これにより、PC紛失時のリスクをさらに低減する。

## **28\. 最初に着手すべき実装順序チェックリスト**

開発を開始する際、以下の順序で手を動かすことで手戻りを最小限に抑えることができる。

* \[ \] npx create-next-app@latest でプロジェクトを初期化する。App Routerを利用する。  
* \[ \] next.config.ts を編集し、output: 'export' を設定する2。  
* \[ \] Tailwind CSSのセットアップ確認と、グローバルCSS（globals.css）へのRPG風背景・フォントの指定を行う。  
* \[ \] Zodをインストール（npm install zod）し、src/lib/schemas.ts に仕様書記載のスキーマを定義する。  
* \[ \] public/quests/ ディレクトリを作成し、指定の .gitignore 設定を追記する。  
* \[ \] 動作確認用に index.sample.json と sample.json を作成・配置する。

# **追加作成セクション**

## **A. Claude Code / Codex 用の実装指示プロンプト**

開発支援AIエージェント（Claude CodeやGitHub Copilot / Codex）を利用してMVPを一気に構築するための、コンテキストを凝縮したマスタープロンプト。  
あなたはシニアReact/Next.jsエンジニアです。  
以下の仕様に基づいて、個人用ローカルファーストWebアプリ「Domain Quest」のMVPを実装してください。  
技術スタックは Next.js (App Router), React, TypeScript, Tailwind CSS, Zod です。  
サーバーAPIやデータベースは使用せず、すべてクライアントサイドで完結させます。

### **1\. アプリの目的とMVPスコープ**

* 社内ドキュメントから生成したクイズJSONを読み込み、RPG風の画面で学習するアプリです。  
* 完全な静的エクスポート (next.config.ts で output: 'export') を行います。  
* public/quests/index.json および各クエストJSONを fetch して利用します。  
* Zodを用いて読み込んだJSONおよび localStorage のデータを厳格にバリデーションします。  
* 3つのモード (Normal, Hard, Max) に対応したクイズバトルロジックを実装します。

### **2\. JSONスキーマとZod定義**

以下のZodスキーマを src/lib/schemas.ts に実装してください。

* QuestionSchema: id, category("tech"|"domain"), question, choices(文字列配列, 要素数4必須), answerIndex, explanation, sourceTitle, sourceSection, sourceUrl, sourceQuote を持つ。  
* QuestMetaSchema: id, title, dragonName, file を持つ。  
* AppSettingsSchema, QuizSessionSchema, QuizAttemptSchema, MistakeRecordSchema (仕様に沿ったフィールドを定義してください)。

### **3\. ゲームロジックとモード仕様**

* 1バトルは全問題からランダムに20問を抽出します（Fisher-Yatesシャッフルを使用）。1問正解で敵に5ダメージ。敵の初期HPは100。  
* Normal Mode: プレイヤーHP 100, 不正解時ダメージ 10。  
* Hard Mode: プレイヤーHP 100, 不正解時ダメージ 25。  
* Max Mode: プレイヤーHP 1, 不正解時ダメージ 9999。1問ミスで即ゲームオーバー。  
* プレイヤーHPが0以下でゲームオーバー、敵HPが0以下でクリア。  
* ログ領域に「{dragonName}に 5 のダメージ！」等のテキストを出力してください。

### **4\. localStorage保存内容**

* キー名: dq\_app\_settings, dq\_quiz\_history, dq\_mistake\_records  
* 保存処理前に必ずZodでパースし、エラーがあれば握り潰すかデフォルト値にフォールバックする安全なカスタムフック useLocalStorage を作成すること。  
* 機密情報保護のため、履歴データには問題文そのものや引用文は保存せず、questionId やスコアのみ保存すること。

### **5\. 画面構成**

* Title画面: クエスト選択、勇者名入力、「冒険を始める」ボタン。  
* Mode Select画面: モードの選択。  
* Battle画面: 敵・味方HPバー、問題テキスト、4択ボタン、バトルログ、解説表示エリア（アコーディオン等）。RPG風の枠線には Tailwindの border-double などを利用。  
* Result画面: スコア表示、合否、間違えた問題リストの表示。  
* History画面: 過去のセッション履歴と成績の表示。

### **6\. セキュリティと .gitignore方針**

* .gitignore に public/quests/\* を追加し、\!public/quests/.gitkeep, \!public/quests/sample.json, \!public/quests/index.sample.json を除外設定すること。

まずはプロジェクトのスケルトンと、Zodスキーマ定義、および sample.json の作成から着手し、ステップバイステップで実装を進めてください。各ステップ完了ごとに動作確認項目を提示してください。

## **B. GitHub Issue分解**

開発プロセスを管理しやすくするためのIssueテンプレート。

### **Issue 1: Project setup & Configuration**

* **目的**: 静的エクスポート前提の開発基盤の構築。  
* **作業内容**:  
  * Next.js App Routerでの初期化。  
  * next.config.ts への output: 'export' および images: { unoptimized: true } の追加。  
  * Tailwind CSSのセットアップとグローバルCSSへの適用。  
* **完了条件**: npm run build を実行し、out ディレクトリにエラーなく静的ファイル群が出力されること。

### **Issue 2: Define Zod Schemas & Sample JSON**

* **目的**: アプリケーション全体の型定義と、検証用のモックデータの用意。  
* **作業内容**:  
  * src/lib/schemas.ts に Question, QuestMeta, AppSettings 等のZodスキーマを実装。  
  * public/quests/index.sample.json および sample.json の作成。  
* **完了条件**: 型定義がコンパイルエラーなくエクスポートされており、作成したサンプルJSONがスキーマ定義の検証（parse）をパスすること。

### **Issue 3: .gitignore and Security Configurations**

* **目的**: 本物の社内機密データがリポジトリに漏洩する事故を未然に防ぐ。  
* **作業内容**:  
  * .gitignore の編集。public/quests/\* で実データを弾きつつ、\!public/quests/sample.json などサンプルデータのみ許可するルールの記述。  
* **完了条件**: ダミーの機密ファイル（例: secret-project.json）を public/quests/ に置いた際、git status コマンドで追跡対象として表示されないことを確認する。

### **Issue 4: Create useLocalStorage and State Hooks**

* **目的**: 型安全なデータ永続化基盤の構築。  
* **作業内容**:  
  * Zodを活用してlocalStorageへのRead/Writeを安全に行うカスタムフック（useZodLocalStorage）の実装。  
  * パースエラー時のフォールバック処理の実装。  
* **完了条件**: ブラウザをリロードしても設定（勇者名など）が維持され、Chrome DevToolsから意図的に不正なJSON文字列をlocalStorageに注入してもアプリがクラッシュしないこと。

### **Issue 5: JSON Loader & Validation Logic**

* **目的**: クエスト一覧および問題データの動的読み込みと検証機能の実装。  
* **作業内容**:  
  * fetch APIを用いて index.json および選択されたクエストJSONを非同期で取得。  
  * 取得したデータをZodでバリデーションし、flattenError を用いてエラーを整形するロジックの実装。  
* **完了条件**: 正しいJSONはパースされ、プロパティが欠損した不正なJSONを読み込ませた場合は適切なエラーメッセージが画面に表示されること。

### **Issue 6: Title & Mode Select Screens**

* **目的**: アプリケーションの入り口と設定画面の構築。  
* **作業内容**:  
  * タイトル画面のUI構築（勇者名、クエスト選択）。  
  * 難易度選択（Normal / Hard / Max）のカードUI実装。  
* **完了条件**: クエストを選択し、モードを選ぶことで、正しく初期化された QuizSession オブジェクトが生成され、次画面へのルーティングが発火すること。

### **Issue 7: Battle Engine & UI Implementation**

* **目的**: コアとなるゲーム体験（問題のシャッフル、HP計算、正誤判定）の実装。  
* **作業内容**:  
  * 20問のランダム抽出アルゴリズム。  
  * HPバーコンポーネント、4択ボタン、正解/不正解時のダメージ計算とバトルログ出力の実装。  
  * 回答後の解説表示パネル（アコーディオンUI）の実装。  
* **完了条件**: 1問ごとにHPが正しく増減し、Max Modeでは1問ミスで即座にHPがゼロになり敗北演出が走ること。20問終了またはHP0でResult画面へ遷移すること。

### **Issue 8: Result & History Screens**

* **目的**: 学習結果のフィードバック提供と、成長記録の可視化。  
* **作業内容**:  
  * Result画面でのスコア計算、勝敗結果の表示、間違えた問題リストの展開。  
  * 終了状態を受け取り、履歴（dq\_quiz\_history）を localStorage に保存。  
  * History画面での過去データ一覧とサマリー表示。  
* **完了条件**: Result画面で詳細な結果が確認でき、一度トップに戻ってからHistory画面を開いても永続化されたデータが正しくリスト表示されること。

### **Issue 9: Styling & Retro RPG Theme**

* **目的**: ゲーミフィケーションのビジュアル強化。  
* **作業内容**:  
  * Tailwind CSSの標準ユーティリティ（border-double, divide-dashed等）を用いたダークテーマの徹底。  
  * ホバー時の反応（hover:bg-gray-800）や、ダメージ時の簡単なテキストエフェクトの適用。  
* **完了条件**: 外部アセット（画像やフォントファイル）に依存せず、会社で開いていても不自然ではない程度の清潔感を保ちつつ、RPG風の世界観がUIに反映されていること。

### **Issue 10: README and Final Polish**

* **目的**: 他の開発者が利用・貢献しやすい状態にする。  
* **作業内容**:  
  * リポジトリのREADME作成（JSONの配置方法、セキュリティ上の注意事項の明記）。  
  * 全体の通しテストと残存する細かいバグの修正。  
* **完了条件**: READMEを読めば、新しくジョインしたエンジニアが迷わずローカルでアプリを起動し、自身のドキュメントから生成したJSONを追加できる状態になっていること。

## **C. READMEドラフト**

以下は、リポジトリのルートに配置する README.md の記述案である。

# **Domain Quest (〇〇クエスト)**

Domain Questは、社内ドキュメントや仕様書から抽出・生成したクイズJSONを読み込み、配属プロジェクト固有のドメイン知識をRPG感覚で学習・定着させるための「ローカルファースト Webアプリケーション」です。

## **アプリ概要**

* **目的**: 配属プロジェクトの仕様・業務ドメイン知識の理解度を可視化し、キャッチアップの完了を客観的に証明する。  
* **特徴**:  
  * **完全ローカル稼働**: サーバーサイドやデータベースは一切不要。Next.jsの静的エクスポートを利用し、完全にブラウザ（ローカル環境）内で完結します。  
  * **永続化**: localStorage を活用した履歴保存機能を備え、初日のスコアから100点への成長の軌跡を記録します。  
  * **Max Mode**: 1問のミスで即終了となるハードコアモード。20問ノーミスクリアの画面は「完全理解の証明」として使えます。

## **⚠️ セキュリティ・注意事項（重要）**

**本物の社内ドキュメント内容を含むJSONファイルは、絶対にGitHub等のリポジトリにコミットしないでください。**  
本アプリは機密性の高い社内情報を扱う前提で設計されています。そのため、以下のルールを厳守してください。

1. 本リポジトリの .gitignore には、public/quests/ 配下のファイルを除外する設定が組み込まれています。この設定は変更しないでください。  
2. index.sample.json と sample.json 以外のファイルをGitに追加しないよう注意してください。  
3. ローカル開発サーバー（npm run dev など）を起動中、同一ネットワークからアプリにアクセスされる可能性があります。パブリックなWi-Fi環境下で実データを入れたままサーバーを公開状態にしないでください。

## **使い方**

### **1\. 起動方法**

Node.js がインストールされている環境で以下のコマンドを実行します。bash

# **依存関係のインストール**

npm install

# **ローカル開発サーバーの起動**

npm run dev

ブラウザで \`http://localhost:3000\` にアクセスしてください。

\#\#\# 2\. クエストJSONの置き方  
プロジェクト固有の問題データを作成し、\`public/quests/\` ディレクトリに直接配置します。

1\. \`public/quests/project-a.json\` 等の任意のファイル名で問題JSONを作成します。  
2\. \`public/quests/index.json\` を作成（または \`index.sample.json\` をコピーしてリネーム）し、クエスト一覧配列に追記します。

\#\#\# index.json の書き方  
\`index.json\` はアプリ起動時に読み込まれる目次ファイルです。  
\`\`\`json  
\[  
  {  
    "id": "project-a",  
    "title": "Aプロジェクト仕様",  
    "dragonName": "Aプロドラゴン",  
    "file": "/quests/project-a.json"  
  }  
\]

### **問題JSONのスキーマ**

各問題JSONファイルは、以下の形式の配列である必要があります。Zodによって厳密にバリデーションされるため、要素の欠損や型の違いに注意してください。

JSON  
\[  
  {  
    "id": "q001",  
    "category": "domain",  
    "question": "問題文をここに記述",  
    "choices": \[  
      "選択肢A",  
      "選択肢B",  
      "選択肢C",  
      "選択肢D"  
    \],  
    "answerIndex": 0,  
    "explanation": "間違えたときに読む解説を記述",  
    "sourceTitle": "根拠資料のタイトル",  
    "sourceSection": "該当する章・見出し",  
    "sourceUrl": "https://docs.company.local/...",  
    "sourceQuote": "ドキュメント本文からの引用を記述"  
  }  
\]

## **開発方法 / デプロイ**

本アプリは Next.js の Static Exports (output: 'export') を利用しています。

Bash  
\# 静的HTML/JSのビルド  
npm run build

ビルド完了後、out ディレクトリに静的ファイルが出力されます。社内のセキュアなイントラネット環境等にデプロイしてチームで利用する場合は、この out ディレクトリの中身をWebサーバー（Nginx等）やS3等に配置してください。  
**※デプロイを行う際、本物のJSONを含めるかどうかは、デプロイ先のセキュリティ基準や社内ポリシーに従って慎重に判断してください。**

#### **引用文献**

1. Build a Next.js Mobile App from Scratch with Capacitor 8 \- Capgo, [https://capgo.app/blog/nextjs-mobile-app-capacitor-from-scratch/](https://capgo.app/blog/nextjs-mobile-app-capacitor-from-scratch/)  
2. Next.js Static Export and Dynamic Routing Optimization | by Kevin | CodeToDeploy, [https://medium.com/codetodeploy/next-js-static-export-and-dynamic-routing-optimization-045560a7408d](https://medium.com/codetodeploy/next-js-static-export-and-dynamic-routing-optimization-045560a7408d)  
3. Zodのエラーハンドリングについて覚書 \- Zenn, [https://zenn.dev/s\_takashi/articles/71c04d68e0c9c0](https://zenn.dev/s_takashi/articles/71c04d68e0c9c0)  
4. border-style \- Tailwind CSS, [https://tailwindcss.com/docs/border-style](https://tailwindcss.com/docs/border-style)  
5. Styling with utility classes \- Core concepts \- Tailwind CSS, [https://tailwindcss.com/docs/styling-with-utility-classes](https://tailwindcss.com/docs/styling-with-utility-classes)  
6. Type safe local storage | Sinclair Software, [https://www.sinclair.software/articles/typesafe-localstorage/](https://www.sinclair.software/articles/typesafe-localstorage/)  
7. localStorage の値を Zod で安全にパースする \- Techouse Developers Blog, [https://developers.techouse.com/entry/localstorage-parse-zod](https://developers.techouse.com/entry/localstorage-parse-zod)  
8. Defining schemas | Zod, [https://zod.dev/api](https://zod.dev/api)  
9. Customizing errors | Zod, [https://zod.dev/error-customization](https://zod.dev/error-customization)  
10. Formatting errors \- Zod, [https://zod.dev/error-formatting](https://zod.dev/error-formatting)  
11. Next.js i18n with next-intl: A comprehensive guide \- POEditor Blog, [https://poeditor.com/blog/next-js-i18n/](https://poeditor.com/blog/next-js-i18n/)