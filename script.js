/* RC Race Results Generator - Main Script */

// Reference: https://ribbit.konomi.app/blog/javascript-drag-and-drop/
// Get drag & drop area
const dropArea = document.body;
const dropZone = document.getElementById('dropArea');

// Drag and drop event listeners
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevent browser from opening the dragged file
    event.dataTransfer.dropEffect = 'copy'; // Change file display while dragging
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
    event.preventDefault(); // Prevent browser from opening the dragged file
    if (dropZone) {
        dropZone.classList.remove('dragover');
    }
    var files = event.dataTransfer.files;
    getFiles(files);
});

// File reading function
const getFiles = (files) => {
    if (files.length === 0) return;
    
    // Display file count
    const fileCount = files.length;
    const dropArea = document.getElementById('dropArea');
    if (dropArea) {
        dropArea.innerHTML = `
            <div class="drop-text">✅ Loading ${fileCount} file(s)...</div>
            <div class="drop-subtext">Please wait</div>
        `;
    }
    
    let loadedCount = 0;
    for (const file of files) {
        const reader = new FileReader();
        // Try reading with Shift_JIS first
        reader.readAsText(file, 'shift-jis');
        reader.onload = (event) => {
            let text = event.target.result;
            // Try UTF-8 if Shift_JIS fails
            if (text.indexOf('ARC4 Manager Race Data') !== 0 && text.indexOf('ARC4 Manager User List') !== 0) {
                const reader2 = new FileReader();
                reader2.readAsText(file, 'utf-8');
                reader2.onload = (event2) => {
                    text = event2.target.result;
                    if (text.indexOf('ARC4 Manager Race Data')==0 || text.indexOf('ARC4 Manager User List')==0){
                        document.getElementById('ta').value = document.getElementById('ta').value + '\n' + text;
                    }
                    loadedCount++;
                    
                    // Update message when all files are loaded
                    if (loadedCount === files.length && dropArea) {
                        dropArea.innerHTML = `
                            <div class="drop-text">✅ ${fileCount} file(s) loaded successfully</div>
                            <div class="drop-subtext">Press calculation button to display results</div>
                        `;
                    }
                };
                return;
            }
            
            if (text.indexOf('ARC4 Manager Race Data')==0 || text.indexOf('ARC4 Manager User List')==0){
                document.getElementById('ta').value = document.getElementById('ta').value + '\n' + text;
            }
            loadedCount++;
            
            // Update message when all files are loaded
            if (loadedCount === files.length && dropArea) {
                dropArea.innerHTML = `
                    <div class="drop-text">✅ ${fileCount} file(s) loaded successfully</div>
                    <div class="drop-subtext">Press calculation button to display results</div>
                `;
            }
        };
        reader.onerror = () => {
            loadedCount++;
            if (loadedCount === files.length && dropArea) {
                dropArea.innerHTML = `
                    <div class="drop-text">⚠️ File loading error</div>
                    <div class="drop-subtext">Please drop the file again</div>
                `;
            }
        };
    }
};

// Toggle print/input display
function switchDisplay(num) {
    let inputArea = document.getElementsByClassName("inputArea")[0];
    let btn = document.getElementById('btn');
    if (inputArea.style.display === 'none' || num == 1) {
        inputArea.style.display = 'block';
        btn.innerHTML = '📊 Switch to Print View';
    } else {
        inputArea.style.display = 'none';
        btn.innerHTML = '📝 Back to Input View';
    }
}

// Clear all data
function clear1() {
    document.getElementById('ta').value = '';
    document.getElementById('table1').innerHTML = '';
    
    // Hide X post button
    const postBtn = document.getElementById('postToXBtn');
    if (postBtn) {
        postBtn.style.display = 'none';
    }
    
    // Hide image save button
    const imageBtn = document.getElementById('generateImageBtn');
    if (imageBtn) {
        imageBtn.style.display = 'none';
    }
    
    // Clear race results data
    currentRaceResults = null;
    
    // Reset drop area
    const dropArea = document.getElementById('dropArea');
    if (dropArea) {
        dropArea.innerHTML = `
            <div class="drop-text">📁 Drag & Drop Files Here</div>
            <div class="drop-subtext">Drop ARC4 Manager result files (.csv or .arc4)</div>
            <div class="drop-subtext">Multiple files can be dropped at once</div>
        `;
    }
    
    switchDisplay(1);
}

// Post to X (Twitter)
function postToX() {
    if (!currentRaceResults) {
        alert('No result data to post. Please run calculation first.');
        return;
    }
    
    const results = currentRaceResults;
    let tweetText = '';
    
    // Header information
    tweetText += `🏁 ${results.title}\n`;
    
    if (results.mode == 1) {
        tweetText += `⚡ Best Lap ${results.style} Start\n\n`;
    } else {
        tweetText += `🏃 Lap Race ${results.style} Start\n\n`;
    }
    
    // Display top 3 positions
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
            // Best lap mode
            const bestTime = results.data[i][7];
            if (bestTime != 999999) {
                tweetText += `${posEmoji}${pos}: ${name} ${msecToSec(bestTime)}\n`;
            } else {
                tweetText += `${posEmoji}${pos}: ${name} -\n`;
            }
        } else {
            // Lap race mode
            const laps = results.data[i][4];
            const goalTime = results.data[i][5];
            tweetText += `${posEmoji}${pos}: ${name} ${laps} laps ${msecToMin(goalTime)}\n`;
        }
        displayCount++;
    }
    
    // Add hashtag
    tweetText += '\n#RCRacing';
    
    // Character limit check (280 characters)
    if (tweetText.length > 270) {
        tweetText = tweetText.substring(0, 250) + '...\n\n#RCRacing';
    }
    
    // Create X Web Intent URL
    const tweetUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText);
    
    // Open X in new window
    window.open(tweetUrl, '_blank', 'width=550,height=420');
}

// Generate and save image
function generateImage() {
    const table = document.getElementById('table1');
    if (!table || !table.innerHTML) {
        alert('Please run calculation first.');
        return;
    }
    
    // Show progress
    const imageBtn = document.getElementById('generateImageBtn');
    const originalText = imageBtn.innerHTML;
    imageBtn.innerHTML = '📷 Generating image...';
    imageBtn.disabled = true;
    
    // html2canvas options
    const options = {
        backgroundColor: '#ffffff',
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        width: table.offsetWidth,
        height: table.offsetHeight,
        onclone: function(clonedDoc) {
            // Adjust cloned element styles
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
            // Generate image filename with timestamp
            const now = new Date();
            const filename = `race-results-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}.png`;
            
            // Create download link
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            
            // Execute automatic download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Restore button state
            imageBtn.innerHTML = originalText;
            imageBtn.disabled = false;
            
            // Success message
            setTimeout(() => {
                alert('Image saved successfully!\nOpening X post screen...');
                // Automatically open X post screen
                if (currentRaceResults) {
                    postToX();
                }
            }, 500);
            
        } catch (error) {
            console.error('Image save error:', error);
            imageBtn.innerHTML = originalText;
            imageBtn.disabled = false;
            alert('Error occurred while saving image.');
        }
    }).catch(error => {
        console.error('html2canvas error:', error);
        imageBtn.innerHTML = originalText;
        imageBtn.disabled = false;
        alert('Error occurred while generating image.');
    });
}

// Main calculation function
function calc1(mode, mode2) { // mode: 1=Best Lap, 2=Lap Race; mode2: 1=Include 1st lap, 2=Exclude 1st lap
    let titles = [];
    let styles = [];
    let ta = document.getElementById('ta').value;
    if (ta == '') {
        alert('Please load race result data first.');
        return;
    }
    ta = ta.replace('\r\n', '\n').trim();
    let tas = ta.split("\n");
    for (let i = 0; i < tas.length; ++i) {
        tas[i] = tas[i].split(",");
    }
    
    console.log('CSV parsing started:', tas); // Debug log
    
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
        
        // Direct detection of numeric rows (new support)
        if (readFlg == 0 && !isNaN(parseInt(tas[i][0])) && tas[i][1] && !isNaN(parseFloat(tas[i][1]))) {
            // Auto-create drivers if not set
            if (drivers.length === 0 || !drivers[0]) {
                drvStart = 0;
                drv = 0;
                // Create drivers for columns with data
                for (let j = 1; j < tas[i].length; ++j) {
                    if (tas[i][j] && !isNaN(parseFloat(tas[i][j]))) {
                        let driverName = "Driver" + j;
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
            // Process current row too
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
        
        // Support for cases without "名前" row
        if (tas[i][0] == "バンド" || (tas[i][0] == "" && i > 0 && tas[i-1][0] == "バンド")) {
            if (tas[i][0] == "バンド") {
                drvStart = drv;
                for (let j = 1; j < tas[i].length; ++j) {
                    if (tas[i][j] && tas[i][j].trim() === "") {
                        let driverName = "Driver" + j;
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
        
        // Additional support: Direct detection of numeric rows after course row
        if (tas[i][0] == "コース" && i+2 < tas.length) {
            let nextDataLine = i+2;
            while (nextDataLine < tas.length && (!tas[nextDataLine][1] || isNaN(parseFloat(tas[nextDataLine][1])))) {
                nextDataLine++;
            }
            if (nextDataLine < tas.length && !isNaN(parseFloat(tas[nextDataLine][1]))) {
                drvStart = drv;
                for (let j = 1; j < tas[i].length; ++j) {
                    if (j < 20) { // Maximum 20 drivers
                        let driverName = "Driver" + j;
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
                    i++; // Skip next row
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
    
    console.log('Parsing results:');
    console.log('Drivers:', drivers);
    console.log('Lap times:', laptimes);
    console.log('Rounds:', rds);
    console.log('Heats:', hts);
    
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
    
    if (mode == 1) { // Best lap qualifying
        results = arrSort(results, 1, 9); // 2nd best lap
        results = arrSort(results, 1, 7); // 1st best lap
    } else { // Lap race qualifying
        results = arrSort(results, 1, 9); // 2nd best lap
        results = arrSort(results, 1, 7); // 1st best lap
        results = arrSort(results, 1, 5); // Goal time
        results = arrSort(results, -1, 4); // Lap count
    }
    let results2 = removeDuplicates(results);
    arrDisplayTable(results2, mode, mode2, titles.join(' '), styles.join(' '));
    switchDisplay();
    window.print();
}

// Convert milliseconds to minutes:seconds.milliseconds
function msecToMin(time) {
    if (time == 0) {
        return "";
    }
    let min = Math.floor(time / 60000);
    let sec = (time % 60000) / 1000;
    if ((time % 1000) == 0) { // Exact seconds
        return min + ":" + sec + ".000";
    }
    if (sec < 10) {
        sec = "0" + sec;
    }
    sec = sec + "000";
    return min + ":" + sec.slice(0, 6);
}

// Convert milliseconds to seconds.milliseconds
function msecToSec(time) {
    if (time == 0) {
        return "";
    }
    if ((time % 1000) == 0) { // Exact seconds
        return time/1000 + ".000";
    }
    if (time >= 100000) {
        time = time / 1000 + "00";
        return time.slice(0, 7);
    }
    time = time / 1000 + "00";
    return time.slice(0, 6);
}

// Calculate personal results (laps and times)
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

// Sort array
function arrSort(arr, order, index) { // arr: 2D array, order: 1=ascending, -1=descending, index: specify 2nd dimension
    arr.sort(function (a, b) {
        let a1 = a[index];
        let b1 = b[index];
        return order * (a1 - b1);
    });
    return arr;
}

// Display array in textarea
function arrDisplay(arr) {
    let str = [];
    for (let i = 0; i < arr.length; ++i) {
        str.push(arr[i].join('\t'));
    }
    document.getElementById('ta2').value = str.join('\n');
}

// Remove duplicates
function removeDuplicates(arr) {
    let results = structuredClone(arr);
    let results2 = [];
    let drivers = [];
    let positions = {};
    let j = 0;
    for (let i = 0; i < results.length; ++i) {
        if (drivers.includes(results[i][3])) {
            if (results2[positions[results[i][3]]][11] == '') { // Second occurrence
                // Laps
                results2[positions[results[i][3]]][11] = results[i][4];
                results2[positions[results[i][3]]][12] = results[i][5];
                results2[positions[results[i][3]]][13] = results[i][0];
                // Best lap
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
        } else { // First occurrence
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

// Global variable to store race results
let currentRaceResults = null;

// Display results in table format
function arrDisplayTable(arr, mode, mode2, title, style) {
    // Save race results
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
        str.push('<tr class="title"><td colspan="8"><div align="left">Best Lap　' + style + ' Start</div></td></tr>\n');
    } else {
        str.push('<tr class="title"><td colspan="8"><div align="left">Lap Race　' + style + ' Start</div></td></tr>\n');
    }
    str.push('<tr>\n');
    str.push('<th></th>\n');
    str.push('<th></th>\n');
    str.push('<th colspan="3">1st</th>\n');
    str.push('<th colspan="3">2nd</th>\n');
    str.push('</tr>\n');
    str.push('<tr>\n');
    str.push('<th>Pos.</th>\n');
    str.push('<th>Name</th>\n');
    if (mode == 1) {
        str.push('<th>Best</th>\n');
        str.push('<th>Rd</th>\n');
        str.push('<th>Lap</th>\n');
        str.push('<th>Best</th>\n');
        str.push('<th>Rd</th>\n');
        str.push('<th>Lap</th>\n');
    } else {
        str.push('<th>Laps</th>\n');
        str.push('<th>Goal Time</th>\n');
        str.push('<th>Rd.</th>\n');
        str.push('<th>Laps</th>\n');
        str.push('<th>Goal Time</th>\n');
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
    
    // Show X post button
    const postBtn = document.getElementById('postToXBtn');
    if (postBtn) {
        postBtn.style.display = 'inline-block';
        postBtn.className = 'btn-success x-post';
    }
    
    // Show image save button
    const imageBtn = document.getElementById('generateImageBtn');
    if (imageBtn) {
        imageBtn.style.display = 'inline-block';
        imageBtn.className = 'btn-success';
    }
}