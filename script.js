// RC Race Results Generator JavaScript
class RaceResultsGenerator {
    constructor() {
        this.raceData = [];
        this.currentFormat = 'bestLap';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const formatRadios = document.querySelectorAll('input[name="raceFormat"]');
        const exportPngBtn = document.getElementById('exportPng');
        const shareTwitterBtn = document.getElementById('shareTwitter');
        const printBtn = document.getElementById('printResults');

        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        formatRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleFormatChange(e));
        });
        exportPngBtn.addEventListener('click', () => this.exportToPNG());
        shareTwitterBtn.addEventListener('click', () => this.shareToTwitter());
        printBtn.addEventListener('click', () => this.printResults());
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        this.showLoading(true);
        
        try {
            this.raceData = [];
            
            for (const file of files) {
                const data = await this.parseFile(file);
                if (data && data.length > 0) {
                    this.raceData.push(...data);
                }
            }

            if (this.raceData.length > 0) {
                this.showSection('raceFormatSection');
                this.processAndDisplayResults();
            } else {
                this.showError('No valid race data found in the uploaded files.');
            }
        } catch (error) {
            console.error('Error processing files:', error);
            this.showError('Error processing files. Please check the file format.');
        } finally {
            this.showLoading(false);
        }
    }

    async parseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    
                    let data;
                    if (fileExtension === 'csv') {
                        data = this.parseCSV(content);
                    } else if (fileExtension === 'arc4') {
                        data = this.parseARC4(content);
                    } else {
                        throw new Error('Unsupported file format');
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    parseCSV(content) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= headers.length) {
                const record = {};
                headers.forEach((header, index) => {
                    record[header] = values[index];
                });
                
                // Standard ARC4 Manager CSV format mapping
                const processedRecord = {
                    position: parseInt(record['pos'] || record['position'] || i),
                    driver: record['driver'] || record['name'] || record['pilot'] || `Driver ${i}`,
                    laps: parseInt(record['laps'] || record['lap count'] || 0),
                    bestLap: this.parseTime(record['best'] || record['best lap'] || record['fastest lap'] || '0:00.000'),
                    totalTime: this.parseTime(record['time'] || record['total time'] || record['race time'] || '0:00.000'),
                    car: record['car'] || record['vehicle'] || record['model'] || 'Unknown',
                    points: parseInt(record['points'] || record['score'] || 0),
                    originalPoints: parseInt(record['points'] || record['score'] || 0)
                };
                
                data.push(processedRecord);
            }
        }

        return data;
    }

    parseARC4(content) {
        // Basic ARC4 file parsing - this is a simplified version
        // In a real implementation, you'd need to parse the binary ARC4 format
        const lines = content.split('\n').filter(line => line.trim());
        const data = [];
        
        // Look for race results section
        let inResultsSection = false;
        let position = 1;
        
        for (const line of lines) {
            if (line.includes('Race Results') || line.includes('RESULTS')) {
                inResultsSection = true;
                continue;
            }
            
            if (inResultsSection && line.trim()) {
                // Simple pattern matching for race data
                const match = line.match(/(\w+.*?)\s+(\d+)\s+(\d+:\d+\.\d+)\s+(\d+:\d+\.\d+)/);
                if (match) {
                    data.push({
                        position: position++,
                        driver: match[1].trim(),
                        laps: parseInt(match[2]),
                        bestLap: this.parseTime(match[3]),
                        totalTime: this.parseTime(match[4]),
                        car: 'Unknown',
                        points: this.calculatePoints(position - 1)
                    });
                }
            }
        }
        
        return data;
    }

    parseTime(timeString) {
        if (!timeString || timeString === '0:00.000') return 0;
        
        const parts = timeString.match(/(?:(\d+):)?(\d+)[:.](\d+)\.?(\d+)?/);
        if (!parts) return 0;
        
        const minutes = parseInt(parts[1] || 0);
        const seconds = parseInt(parts[2] || 0);
        const milliseconds = parseInt((parts[3] + (parts[4] || '0')).padEnd(3, '0').substring(0, 3));
        
        return (minutes * 60 + seconds) * 1000 + milliseconds;
    }

    formatTime(milliseconds) {
        if (!milliseconds || milliseconds === 0) return '--:---.---';
        
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = milliseconds % 1000;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    calculatePoints(position) {
        const pointsTable = [25, 20, 16, 13, 11, 10, 8, 6, 4, 2, 1];
        return pointsTable[position] || 0;
    }

    handleFormatChange(event) {
        this.currentFormat = event.target.value;
        this.processAndDisplayResults();
    }

    processAndDisplayResults() {
        if (!this.raceData || this.raceData.length === 0) return;

        let sortedData;
        if (this.currentFormat === 'bestLap') {
            // Sort by best lap time (ascending, 0 times go to end)
            sortedData = [...this.raceData].sort((a, b) => {
                if (a.bestLap === 0) return 1;
                if (b.bestLap === 0) return -1;
                return a.bestLap - b.bestLap;
            });
        } else {
            // Sort by laps (descending) then by total time (ascending)
            sortedData = [...this.raceData].sort((a, b) => {
                if (a.laps !== b.laps) return b.laps - a.laps;
                if (a.totalTime === 0) return 1;
                if (b.totalTime === 0) return -1;
                return a.totalTime - b.totalTime;
            });
        }

        // Update positions and points based on new sorting
        sortedData.forEach((driver, index) => {
            driver.position = index + 1;
            // Keep original points from CSV if available, otherwise calculate standard points
            if (!driver.originalPoints) {
                driver.points = this.calculatePoints(index);
            }
        });

        this.displayResults(sortedData);
        this.showSection('resultsSection');
    }

    displayResults(data) {
        const container = document.getElementById('resultsContainer');
        const formatTitle = this.currentFormat === 'bestLap' ? 'Best Lap Time Results' : 'Lap Race Results';
        
        const tableHTML = `
            <div class="results-title">
                <h3>${formatTitle}</h3>
                <p class="race-info">Total Drivers: ${data.length} | Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Driver</th>
                        <th>Car</th>
                        <th>Laps</th>
                        <th>Best Lap</th>
                        ${this.currentFormat === 'lapRace' ? '<th>Total Time</th>' : ''}
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(driver => `
                        <tr>
                            <td class="position position-${driver.position <= 3 ? driver.position : ''}">${driver.position}</td>
                            <td class="driver-name">${driver.driver}</td>
                            <td>${driver.car}</td>
                            <td>${driver.laps}</td>
                            <td>${this.formatTime(driver.bestLap)}</td>
                            ${this.currentFormat === 'lapRace' ? `<td>${this.formatTime(driver.totalTime)}</td>` : ''}
                            <td>${driver.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHTML;
    }

    async exportToPNG() {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) return;

        this.showLoading(true);
        
        try {
            const canvas = await html2canvas(resultsContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                allowTaint: true,
                useCORS: true
            });

            // Create download link
            const link = document.createElement('a');
            link.download = `rc-race-results-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            this.showSuccess('Results exported as PNG successfully!');
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export PNG. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    shareToTwitter() {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer || !this.raceData.length) return;

        const winner = this.raceData.find(d => d.position === 1);
        const raceType = this.currentFormat === 'bestLap' ? 'Best Lap Time' : 'Lap Race';
        
        const text = `🏁 RC Race Results (${raceType})\\n🥇 Winner: ${winner.driver}\\n⏱️ Best Lap: ${this.formatTime(winner.bestLap)}\\n\\n#RCRacing #Results`;
        const url = encodeURIComponent(text);
        
        window.open(`https://twitter.com/intent/tweet?text=${url}`, '_blank');
    }

    printResults() {
        window.print();
    }

    showSection(sectionId) {
        document.getElementById(sectionId).style.display = 'block';
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        // Simple error display - in production, you might want a more sophisticated notification system
        alert('Error: ' + message);
    }

    showSuccess(message) {
        // Simple success display
        alert('Success: ' + message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RaceResultsGenerator();
});

// Add some sample data generation for testing
function generateSampleData() {
    const sampleDrivers = [
        'John Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 
        'Lisa Davis', 'Chris Miller', 'Anna Taylor', 'Tom Anderson'
    ];
    
    const sampleCars = [
        'Traxxas Slash 4x4', 'Team Associated B6.1', 'XRAY XB2', 
        'Kyosho Inferno MP9', 'HPI Baja 5B', 'Losi TEN-SCTE'
    ];
    
    const data = sampleDrivers.map((driver, index) => ({
        position: index + 1,
        driver: driver,
        car: sampleCars[Math.floor(Math.random() * sampleCars.length)],
        laps: Math.floor(Math.random() * 5) + 25,
        bestLap: Math.floor(Math.random() * 5000) + 45000, // 45-50 seconds
        totalTime: Math.floor(Math.random() * 30000) + 600000, // 10-15 minutes
        points: 0
    }));
    
    return data;
}

// Add demo button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add demo button to the upload section
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        const demoButton = document.createElement('button');
        demoButton.textContent = 'Load Demo Data';
        demoButton.className = 'btn btn-secondary';
        demoButton.style.marginTop = '20px';
        demoButton.onclick = () => {
            const generator = new RaceResultsGenerator();
            generator.raceData = generateSampleData();
            generator.showSection('raceFormatSection');
            generator.processAndDisplayResults();
        };
        uploadSection.appendChild(demoButton);
    }
});