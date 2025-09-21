# RC Race Results Generator

A professional web application for generating and sharing RC (Remote Control) race results from ARC4 Manager data files. This tool provides comprehensive race data analysis, multiple race format support, and various export options for RC racing events.

![RC Race Results Generator](https://github.com/user-attachments/assets/65340f24-9374-46bc-92ce-56a11abc57d1)

## Features

### 🏁 Race Data Analysis
- **ARC4 Manager CSV Support**: Import and process CSV files from ARC4 Manager
- **ARC4 File Processing**: Basic support for ARC4 binary files
- **Automatic Data Parsing**: Intelligent field mapping for various CSV formats
- **Multi-file Processing**: Batch upload and process multiple race files

### 🏆 Multiple Race Formats
- **Best Lap Time Results**: Sort and display results by fastest lap time
- **Lap Race Results**: Sort by laps completed, then by total race time
- **Dynamic Switching**: Switch between formats instantly without re-uploading
- **Professional Formatting**: Clean, organized results tables

### 📸 Image Generation
- **PNG Export**: High-quality PNG export using html2canvas
- **Print-friendly Layout**: Optimized CSS for physical printing
- **Scalable Output**: High-resolution exports suitable for sharing

### 🐦 Social Media Integration
- **X (Twitter) Integration**: Direct sharing to X/Twitter with formatted race results
- **Pre-formatted Content**: Automatic generation of race summary text
- **Winner Highlighting**: Automatic winner and best lap time inclusion

### 🖨️ Print-friendly Layout
- **Optimized CSS**: Special print styles for clean physical printing
- **Hidden Elements**: Upload sections and buttons hidden during printing
- **Professional Layout**: Clean, professional results formatting

## Usage

### Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Rindy1221/RC-Race-Results-Generator.git
   cd RC-Race-Results-Generator
   ```

2. **Open the Application**
   - Open `index.html` in your web browser, or
   - Serve with a local web server:
   ```bash
   python3 -m http.server 8000
   # Then open http://localhost:8000
   ```

### Uploading Race Data

1. **Choose Files**: Click "Choose ARC4 Manager Files" to select your data files
2. **Supported Formats**: 
   - CSV files exported from ARC4 Manager
   - ARC4 binary files (basic support)
3. **Multiple Files**: Select multiple files for batch processing

### CSV Format Requirements

The application supports flexible CSV formats with automatic field mapping. Common field names include:

```csv
pos,driver,car,laps,best,time,points
1,John Smith,Traxxas Slash 4x4,28,0:45.234,10:15.678,25
2,Sarah Johnson,Team Associated B6.1,28,0:45.567,10:18.234,20
```

**Supported Field Names:**
- **Position**: `pos`, `position`
- **Driver**: `driver`, `name`, `pilot`
- **Car**: `car`, `vehicle`, `model`
- **Laps**: `laps`, `lap count`
- **Best Lap**: `best`, `best lap`, `fastest lap`
- **Total Time**: `time`, `total time`, `race time`
- **Points**: `points`, `score`

### Race Format Options

#### Best Lap Time Format
- Results sorted by fastest lap time
- Perfect for qualifying sessions or time trials
- Shows position, driver, car, laps, best lap, and points

#### Lap Race Format
- Results sorted by laps completed (descending), then by total time (ascending)
- Standard format for endurance races and main events
- Shows position, driver, car, laps, best lap, total time, and points

### Export Options

#### PNG Export
- Click "Export as PNG" to generate a high-quality image
- Perfect for sharing on social media or websites
- Uses html2canvas for precise rendering

#### Social Media Sharing
- Click "Share on X" to open a pre-formatted Twitter post
- Includes race format, winner, and best lap time
- Customize the message before posting

#### Printing
- Click "Print" or use Ctrl+P for optimized print output
- Special print CSS ensures clean, professional results
- Hides unnecessary elements like upload buttons

## Demo Mode

Click the "Load Demo Data" button to see the application in action with sample race data. Perfect for testing and demonstration purposes.

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and file upload APIs
- **CSS3**: Responsive design with print media queries
- **Vanilla JavaScript**: No external dependencies for core functionality
- **html2canvas**: High-quality PNG export capability

### Browser Compatibility
- Modern browsers with File API support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile responsive design for tablets and phones

### File Processing
- Client-side processing for privacy and speed
- Support for various time formats (MM:SS.sss, SS.sss)
- Flexible CSV parsing with error handling
- Memory-efficient processing for large files

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Additional file format support
- New export options
- UI/UX improvements
- Bug fixes and optimizations

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports, please open an issue on the GitHub repository.

---

**Perfect for RC racing events, clubs, and competitions!** 🏁