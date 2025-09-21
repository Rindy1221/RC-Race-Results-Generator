/* RCレース結果ジェネレーター - メインスクリプト */

// 参考: https://ribbit.konomi.app/blog/javascript-drag-and-drop/
// ドラッグ＆ドロップエリアを取得
const dropArea = document.body;
const dropZone = document.getElementById('dropArea');

// ドラッグ＆ドロップのイベントリスナー
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // ブラウザがドラッグしたファイルを開くのを防ぐ
    event.dataTransfer.dropEffect = 'copy'; // ドラッグ中のファイル表示を変更
    if (dropZone) {
        dropZone.classList.add('dragover');
    }
});

dropArea.addEventListener('dragleave', (event) => {
    if (dropZone && !dropArea.contains(event.relatedTarget)) {
        dropZone.classList.remove('dragover');
    }
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault(); // ブラウザがドラッグしたファイルを開くのを防ぐ
    if (dropZone) {
        dropZone.classList.remove('dragover');
    }
    var files = event.dataTransfer.files;
    getFiles(files);
});

// ファイル読み込み関数
const getFiles = (files) => {
    if (files.length === 0) return;
    
    // ファイル数を表示
    const fileCount = files.length;
    const dropArea = document.getElementById('dropArea');
    if (dropArea) {
        dropArea.innerHTML = `
            <div class="drop-text">✅ ${fileCount}個のファイルを読み込み中...</div>
            <div class="drop-subtext">しばらくお待ちください</div>
        `;
    }
    
    let loadedCount = 0;
    for (const file of files) {
        const reader = new FileReader();
        // 最初にShift_JISで読み込みを試行
        reader.readAsText(file, 'shift-jis');
        reader.onload = (event) => {
            let text = event.target.result;
            // Shift_JISで失敗した場合はUTF-8を試行
            if (text.indexOf('ARC4 Manager Race Data') !== 0 && text.indexOf('ARC4 Manager User List') !== 0) {
                const reader2 = new FileReader();
                reader2.readAsText(file, 'utf-8');
                reader2.onload = (event2) => {
                    text = event2.target.result;
                    if (text.indexOf('ARC4 Manager Race Data')==0 || text.indexOf('ARC4 Manager User List')==0){
                        document.getElementById('ta').value = document.getElementById('ta').value + '\n' + text;
                    }
                    loadedCount++;
                    
                    // 全ファイル読み込み完了時にメッセージを更新
                    if (loadedCount === files.length && dropArea) {
                        dropArea.innerHTML = `
                            <div class="drop-text">✅ ${fileCount}個のファイルを正常に読み込みました</div>
                            <div class="drop-subtext">集計ボタンを押して結果を表示してください</div>
                        `;
                    }
                };
                return;
            }
            
            if (text.indexOf('ARC4 Manager Race Data')==0 || text.indexOf('ARC4 Manager User List')==0){
                document.getElementById('ta').value = document.getElementById('ta').value + '\n' + text;
            }
            loadedCount++;
            
            // 全ファイル読み込み完了時にメッセージを更新
            if (loadedCount === files.length && dropArea) {
                dropArea.innerHTML = `
                    <div class="drop-text">✅ ${fileCount}個のファイルを正常に読み込みました</div>
                    <div class="drop-subtext">集計ボタンを押して結果を表示してください</div>
                `;
            }
        };
        reader.onerror = () => {
            loadedCount++;
            if (loadedCount === files.length && dropArea) {
                dropArea.innerHTML = `
                    <div class="drop-text">⚠️ ファイル読み込みエラー</div>
                    <div class="drop-subtext">もう一度ファイルをドロップしてください</div>
                `;
            }
        };
    }
};

// 印刷/入力表示の切り替え
function switchDisplay(num) {
    let inputArea = document.getElementsByClassName("inputArea")[0];
    let btn = document.getElementById('btn');
    if (inputArea.style.display === 'none' || num == 1) {
        inputArea.style.display = 'block';
        btn.innerHTML = '📊 印刷用表示に切り替える';
    } else {
        inputArea.style.display = 'none';
        btn.innerHTML = '📝 入力画面に戻る';
    }
}

// 全データをクリア
function clear1() {
    document.getElementById('ta').value = '';
    document.getElementById('table1').innerHTML = '';
    
    // X投稿ボタンを非表示
    const postBtn = document.getElementById('postToXBtn');
    if (postBtn) {
        postBtn.style.display = 'none';
    }
    
    // 画像保存ボタンを非表示
    const imageBtn = document.getElementById('generateImageBtn');
    if (imageBtn) {
        imageBtn.style.display = 'none';
    }
    
    // レース結果データをクリア
    currentRaceResults = null;
    
    // ドロップエリアをリセット
    const dropArea = document.getElementById('dropArea');
    if (dropArea) {
        dropArea.innerHTML = `
            <div class="drop-text">📁 ここにファイルをドラッグ＆ドロップ</div>
            <div class="drop-subtext">ARC4 Managerの結果ファイル (.csv または .arc4) を放り込んでください</div>
            <div class="drop-subtext">複数ファイルを一度にドロップすることも可能です</div>
        `;
    }
    
    switchDisplay(1);
}

// X（Twitter）に投稿
function postToX() {
    if (!currentRaceResults) {
        alert('投稿するデータがありません。先に集計を実行してください。');
        return;
    }
    
    const results = currentRaceResults;
    let tweetText = '';
    
    // ヘッダー情報
    tweetText += `🏁 ${results.title}\n`;
    
    if (results.mode == 1) {
        tweetText += `⚡ ベストラップ ${results.style} スタート\n\n`;
    } else {
        tweetText += `🏃 周回レース ${results.style} スタート\n\n`;
    }
    
    // 上位3位まで表示
    let displayCount = 0;
    for (let i = 0; i < results.data.length && displayCount < 3; i++) {
        if (results.data[i][4] == "") continue;
        
        const pos = displayCount + 1;
        const name = results.data[i][3];
        
        let posEmoji = '';
        if (pos === 1) posEmoji = '🥇';
        else if (pos === 2) posEmoji = '🥈';
        else if (pos === 3) posEmoji = '🥉';
        
        if (results.mode == 1) {
            // ベストラップモード
            const bestTime = results.data[i][7];
            if (bestTime != 999999) {
                tweetText += `${posEmoji}${pos}位: ${name} ${msecToSec(bestTime)}\n`;
            } else {
                tweetText += `${posEmoji}${pos}位: ${name} -\n`;
            }
        } else {
            // 周回レースモード
            const laps = results.data[i][4];
            const goalTime = results.data[i][5];
            tweetText += `${posEmoji}${pos}位: ${name} ${laps}周 ${msecToMin(goalTime)}\n`;
        }
        displayCount++;
    }
    
    // ハッシュタグを追加
    tweetText += '\n#RCレース';
    
    // 文字数制限チェック（280文字）
    if (tweetText.length > 270) {
        tweetText = tweetText.substring(0, 250) + '...\n\n#RCレース';
    }
    
    // X Web Intent URLを作成
    const tweetUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText);
    
    // Xを新しいウィンドウで開く
    window.open(tweetUrl, '_blank', 'width=550,height=420');
}

// 画像を生成して保存
function generateImage() {
    const table = document.getElementById('table1');
    if (!table || !table.innerHTML) {
        alert('先に集計を実行してください。');
        return;
    }
    
    // 進行状況を表示
    const imageBtn = document.getElementById('generateImageBtn');
    const originalText = imageBtn.innerHTML;
    imageBtn.innerHTML = '📷 画像生成中...';
    imageBtn.disabled = true;
    
    // html2canvasオプション
    const options = {
        backgroundColor: '#ffffff',
        scale: 2, // 高解像度
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        width: table.offsetWidth,
        height: table.offsetHeight,
        onclone: function(clonedDoc) {
            // クローンした要素のスタイルを調整
            const clonedTable = clonedDoc.getElementById('table1');
            if (clonedTable) {
                clonedTable.style.margin = '20px';
                clonedTable.style.fontFamily = "'メイリオ', 'Meiryo', sans-serif";
                clonedTable.style.fontSize = '14px';
            }
        }
    };
    
    html2canvas(table, options).then(canvas => {
        try {
            // タイムスタンプ付きファイル名を生成
            const now = new Date();
            const filename = `race-results-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.png`;
            
            // ダウンロードリンクを作成
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            
            // 自動ダウンロードを実行
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // ボタンの状態を復元
            imageBtn.innerHTML = originalText;
            imageBtn.disabled = false;
            
            // 成功メッセージ
            setTimeout(() => {
                alert('画像を保存しました！\nX投稿画面を開きます...');
                // 自動的にX投稿画面を開く
                if (currentRaceResults) {
                    postToX();
                }
            }, 500);
            
        } catch (error) {
            console.error('画像保存エラー:', error);
            imageBtn.innerHTML = originalText;
            imageBtn.disabled = false;
            alert('画像保存中にエラーが発生しました。');
        }
    }).catch(error => {
        console.error('html2canvasエラー:', error);
        imageBtn.innerHTML = originalText;
        imageBtn.disabled = false;
        alert('画像生成中にエラーが発生しました。');
    });
}

// メイン集計関数
function calc1(mode, mode2) { // mode: 1=ベストラップ, 2=周回レース; mode2: 1=1周目含む, 2=1周目除外
    let titles = [];
    let styles = [];
    let ta = document.getElementById('ta').value;
    if (ta == '') {
        alert('先にレース結果データを読み込んでください。');
        return;
    }
    ta = ta.replace('\r\n', '\n').trim();
    let tas = ta.split("\n");
    for (let i = 0; i < tas.length; ++i) {
        tas[i] = tas[i].split(",");
    }
    
    console.log('CSV解析開始:', tas); // デバッグログ
    
    let drivers = [];
    let laptimes = [];
    let readFlg = 0;
    let rd;
    let rds = [];
    let ht;
    let hts = [];
    let drv = 0;
    let drvstart;
    let drv2;
    let sbv = document.getElementById('sb').value;
    
    for (let i = 0; i < tas.length; ++i) {
        if (readFlg == 1) {
            if (tas[i][0] == 'ARC4 Manager Race Data' || tas[i][0] == 'ARC4 Manager User List') {
                readFlg = 0;
                continue;
            }
            drv2 = drvStart;
            for (let j = 1; j < drv - drvStart + 1; ++j) {
                if (tas[i][j] && !isNaN(parseFloat(tas[i][j]))) {
                    laptimes[drv2].push(parseFloat(tas[i][j]));
                }
                ++drv2;
            }
        }
        
        // 数値行の直接検出（新しいサポート）
        if (readFlg == 0 && !isNaN(parseInt(tas[i][0])) && tas[i][1] && !isNaN(parseFloat(tas[i][1]))) {
            // ドライバーが設定されていない場合は自動作成
            if (drivers.length === 0 || !drivers[0]) {
                drvStart = 0;
                drv = 0;
                // データがある列についてドライバーを作成
                for (let j = 1; j < tas[i].length; ++j) {
                    if (tas[i][j] && !isNaN(parseFloat(tas[i][j]))) {
                        let driverName = "ドライバー" + j;
                        if (sbv == "with") {
                            drivers[drv] = driverName + ' (H:' + ht + ')';
                        } else {
                            drivers[drv] = driverName;
                        }
                        laptimes[drv] = [];
                        rds[drv] = rd || 1;
                        hts[drv] = ht || 1;
                        ++drv;
                    }
                }
            }
            readFlg = 1;
            // 現在の行も処理
            drv2 = drvStart;
            for (let j = 1; j < drv - drvStart + 1; ++j) {
                if (tas[i][j] && !isNaN(parseFloat(tas[i][j]))) {
                    laptimes[drv2].push(parseFloat(tas[i][j]));
                }
                ++drv2;
            }
        }
        
        if (tas[i][0] == "名前") {
            readFlg = 1;
            drvStart = drv;
            
            for (let j = 1; j < tas[i].length; ++j) {
                if (tas[i][j]) {
                    if (sbv == "with") {
                        drivers[drv] = tas[i][j] + ' (H:' + ht + ')';
                    } else {
                        drivers[drv] = tas[i][j];
                    }
                    laptimes[drv] = [];
                    rds[drv] = rd;
                    hts[drv] = ht;
                    ++drv;
                }
            }
        }
        
        // 「名前」行なしのケースをサポート
        if (tas[i][0] == "バンド" || (tas[i][0] == "" && i > 0 && tas[i-1][0] == "バンド")) {
            if (tas[i][0] == "バンド") {
                drvStart = drv;
                for (let j = 1; j < tas[i].length; ++j) {
                    if (tas[i][j] && tas[i][j].trim() === "") {
                        let driverName = "ドライバー" + j;
                        if (sbv == "with") {
                            drivers[drv] = driverName + ' (H:' + ht + ')';
                        } else {
                            drivers[drv] = driverName;
                        }
                        laptimes[drv] = [];
                        rds[drv] = rd;
                        hts[drv] = ht;
                        ++drv;
                    }
                }
            } else if (tas[i][0] == "" && tas[i+1] && !isNaN(parseFloat(tas[i+1][1]))) {
                readFlg = 1;
            }
        }
        
        // 追加サポート: コース行の後の数値行の直接検出
        if (tas[i][0] == "コース" && i+2 < tas.length) {
            let nextDataLine = i+2;
            while (nextDataLine < tas.length && (!tas[nextDataLine][1] || isNaN(parseFloat(tas[nextDataLine][1])))) {
                nextDataLine++;
            }
            if (nextDataLine < tas.length && !isNaN(parseFloat(tas[nextDataLine][1]))) {
                drvStart = drv;
                for (let j = 1; j < tas[i].length; ++j) {
                    if (j < 20) { // 最大20名まで
                        let driverName = "ドライバー" + j;
                        if (sbv == "with") {
                            drivers[drv] = driverName + ' (H:' + ht + ')';
                        } else {
                            drivers[drv] = driverName;
                        }
                        laptimes[drv] = [];
                        rds[drv] = rd;
                        hts[drv] = ht;
                        ++drv;
                    }
                }
                if (i+1 < tas.length && (tas[i+1][0] == "" || tas[i+1][0] == "バンド")) {
                    i++; // 次の行をスキップ
                }
            }
        }
        
        if (tas[i][0] == "ラウンド") {
            rd = tas[i][1];
        }
        if (tas[i][0] == "ヒート") {
            ht = tas[i][1];
        }
        if (tas[i][0] == "レースタイトル") {
            if (!titles.includes(tas[i][1])) {
                titles.push(tas[i][1]);
            }
        }
        if (tas[i][0] == "レーススタイル") {
            if (!styles.includes(tas[i][1])) {
                styles.push(tas[i][1]);
            }
        }
    }
    
    console.log('解析結果:');
    console.log('ドライバー:', drivers);
    console.log('ラップタイム:', laptimes);
    console.log('ラウンド:', rds);
    console.log('ヒート:', hts);
    
    let goaltimes = [];
    let results = [];
    for (let i = 0; i < drivers.length; ++i) {
        if (drivers[i]) {
            results[i] = [];
            results[i].push(rds[i]);
            results[i].push(hts[i]);
            results[i].push(i+1);
            results[i].push(drivers[i]);
            results[i] = results[i].concat(totallingPersonal(laptimes[i], rds[i], mode2));
        }
    }
    
    if (mode == 1) { // ベストラップ予選
        results = arrSort(results, 1, 9); // 2番手ベストラップ
        results = arrSort(results, 1, 7); // 1番手ベストラップ
    } else { // 周回レース予選
        results = arrSort(results, 1, 9); // 2番手ベストラップ
        results = arrSort(results, 1, 7); // 1番手ベストラップ
        results = arrSort(results, 1, 5); // ゴールタイム
        results = arrSort(results, -1, 4); // 周回数
    }
    let results2 = removeDuplicates(results);
    arrDisplayTable(results2, mode, mode2, titles.join(' '), styles.join(' '));
    switchDisplay();
    window.print();
}

// ミリ秒を分:秒.ミリ秒に変換
function msecToMin(time) {
    if (time == 0) {
        return "";
    }
    let min = Math.floor(time / 60000);
    let sec = (time % 60000) / 1000;
    if ((time % 1000) == 0) { // ちょうどの秒数
        return min + ":" + sec + ".000";
    }
    if (sec < 10) {
        sec = "0" + sec;
    }
    sec = sec + "000";
    return min + ":" + sec.slice(0, 6);
}

// ミリ秒を秒.ミリ秒に変換
function msecToSec(time) {
    if (time == 0) {
        return "";
    }
    if ((time % 1000) == 0) { // ちょうどの秒数
        return time/1000 + ".000";
    }
    if (time >= 100000) {
        time = time / 1000 + "00";
        return time.slice(0, 7);
    }
    time = time / 1000 + "00";
    return time.slice(0, 6);
}

// 個人成績の計算（周回数とタイム）
function totallingPersonal(arr, rd, mode2) {
    let total = 0;
    let total2 = 0;
    let laps = 0;
    let ave = "";
    let best1 = 999999;
    let best2 = 999999;
    let best1In = "";
    let best2In = "";
    for (let i = 0; i < arr.length; ++i) {
        if (!isNaN(arr[i])) {
            total = total + arr[i];
            laps = i + 1;
            if (i > 0 || mode2 == 1) {
                total2 = total2 + arr[i];
                if (arr[i] < best1) {
                    best2 = best1;
                    best2In = best1In;
                    best1 = arr[i];
                    best1In = String(rd) + '-' + String(i + 1);
                } else if (arr[i] < best2) {
                    best2 = arr[i];
                    best2In = String(rd) + '-' + String(i + 1);
                }
            }
        }
    }
    if (mode2 == 1) {
        if (laps > 0) {
            ave = Math.round(total / laps);
        }
    } else {
        if (laps > 1) {
            ave = Math.round(total2 / (laps - 1));
        }
    }
    return [laps, total, ave, best1, best1In, best2, best2In];
}

// 配列のソート
function arrSort(arr, order, index) { // arr: 2次元配列, order: 1=昇順, -1=降順, index: 2次元目のインデックスを指定
    arr.sort(function (a, b) {
        let a1 = a[index];
        let b1 = b[index];
        return order * (a1 - b1);
    });
    return arr;
}

// 配列をテキストエリアに表示
function arrDisplay(arr) {
    let str = [];
    for (let i = 0; i < arr.length; ++i) {
        str.push(arr[i].join('\t'));
    }
    document.getElementById('ta2').value = str.join('\n');
}

// 重複を削除
function removeDuplicates(arr) {
    let results = structuredClone(arr);
    let results2 = [];
    let drivers = [];
    let positions = {};
    let j = 0;
    for (let i = 0; i < results.length; ++i) {
        if (drivers.includes(results[i][3])) {
            if (results2[positions[results[i][3]]][11] == '') { // 2回目の出現
                // 周回数
                results2[positions[results[i][3]]][11] = results[i][4];
                results2[positions[results[i][3]]][12] = results[i][5];
                results2[positions[results[i][3]]][13] = results[i][0];
                // ベストラップ
                let bests = [];
                bests.push([results2[positions[results[i][3]]][7], results2[positions[results[i][3]]][8]]);
                bests.push([results2[positions[results[i][3]]][9], results2[positions[results[i][3]]][10]]);
                bests.push([results[i][7], results[i][8]]);
                bests.push([results[i][9], results[i][10]]);
                bests = arrSort(bests, 1, 0);
                results2[positions[results[i][3]]][7] = bests[0][0];
                results2[positions[results[i][3]]][8] = bests[0][1];
                results2[positions[results[i][3]]][9] = bests[1][0];
                results2[positions[results[i][3]]][10] = bests[1][1];
            }
        } else { // 初回出現
            results2[j] = results[i];
            results2[j].push('');
            results2[j].push('');
            results2[j].push('');
            drivers[j] = results[i][3];
            positions[results[i][3]] = j;
            ++j;
        }
    }
    return results2;
}

// レース結果を保存するグローバル変数
let currentRaceResults = null;

// 結果をテーブル形式で表示
function arrDisplayTable(arr, mode, mode2, title, style) {
    // レース結果を保存
    currentRaceResults = {
        data: arr,
        mode: mode,
        mode2: mode2,
        title: title,
        style: style
    };
    
    let str = [];
    let date = new Date();
    let strDate = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
    str.push('<table>\n');
    str.push('<tr class="title"><td colspan="8"><div align="right">' + strDate + '</div></td></tr>\n');
    str.push('<tr class="title"><td colspan="8"><div align="left"><b><u>' + title + '</u></b></div></td></tr>\n');
    if (mode == 1) {
        str.push('<tr class="title"><td colspan="8"><div align="left">ベストラップ　' + style + ' スタート</div></td></tr>\n');
    } else {
        str.push('<tr class="title"><td colspan="8"><div align="left">周回レース　' + style + ' スタート</div></td></tr>\n');
    }
    str.push('<tr>\n');
    str.push('<th></th>\n');
    str.push('<th></th>\n');
    str.push('<th colspan="3">1位</th>\n');
    str.push('<th colspan="3">2位</th>\n');
    str.push('</tr>\n');
    str.push('<tr>\n');
    str.push('<th>順位</th>\n');
    str.push('<th>名前</th>\n');
    if (mode == 1) {
        str.push('<th>ベスト</th>\n');
        str.push('<th>Rd</th>\n');
        str.push('<th>周</th>\n');
        str.push('<th>ベスト</th>\n');
        str.push('<th>Rd</th>\n');
        str.push('<th>周</th>\n');
    } else {
        str.push('<th>周回</th>\n');
        str.push('<th>ゴールタイム</th>\n');
        str.push('<th>Rd.</th>\n');
        str.push('<th>周回</th>\n');
        str.push('<th>ゴールタイム</th>\n');
        str.push('<th>Rd.</th>\n');
    }
    str.push('</tr>\n');
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i][4] == "") {
            continue;
        }
        str.push('<tr>\n');
        str.push('<td class="right">' + (i+1) + '</td>\n');
        str.push('<td              >' + arr[i][3] + '</td>\n');
        if (mode == 1) {
            let rdht = arr[i][8].split('-');
            let rd = "";
            let lp = "";
            if (rdht.length > 1) {
                rd = rdht[0];
                lp = rdht[1];
            }
            if (arr[i][7] == 999999) {
                str.push('<td class="right"></td>\n');
            } else {
                str.push('<td class="right">' + msecToSec(arr[i][7]) + '</td>\n');
            }
            str.push('<td class="right">' + rd + '</td>\n');
            str.push('<td class="right">' + lp + '</td>\n');
            rdht = arr[i][10].split('-');
            rd = "";
            lp = "";
            if (rdht.length > 1) {
                rd = rdht[0];
                lp = rdht[1];
            }
            if (arr[i][9] == 999999) {
                str.push('<td class="right"></td>\n');
            } else {
                str.push('<td class="right">' + msecToSec(arr[i][9]) + '</td>\n');
            }
            str.push('<td class="right">' + rd + '</td>\n');
            str.push('<td class="right">' + lp + '</td>\n');
        } else {
            str.push('<td class="right">' + arr[i][4] + '</td>\n');
            str.push('<td class="right">' + msecToMin(arr[i][5]) + '</td>\n');
            str.push('<td class="right">' + arr[i][0] + '</td>\n');
            str.push('<td class="right">' + arr[i][11] + '</td>\n');
            str.push('<td class="right">' + msecToMin(arr[i][12]) + '</td>\n');
            str.push('<td class="right">' + arr[i][13] + '</td>\n');
        }
        str.push('</tr>\n');
    }
    str.push('</table>\n');
    document.getElementById('table1').innerHTML = str.join('');
    
    // X投稿ボタンを表示
    const postBtn = document.getElementById('postToXBtn');
    if (postBtn) {
        postBtn.style.display = 'inline-block';
        postBtn.className = 'btn-success x-post';
    }
    
    // 画像保存ボタンを表示
    const imageBtn = document.getElementById('generateImageBtn');
    if (imageBtn) {
        imageBtn.style.display = 'inline-block';
        imageBtn.className = 'btn-success';
    }
}
