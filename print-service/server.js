import express from 'express';
import printer from 'pdf-to-printer';
import puppeteer from 'puppeteer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create prints directory if it doesn't exist
const printsDir = path.join(__dirname, 'prints');
if (!fs.existsSync(printsDir)) {
  fs.mkdirSync(printsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

// Get available printers
app.get('/printers', async (req, res) => {
  try {
    const printers = await printer.getPrinters();
    const printerNames = printers.map(p => p.name);
    res.json({ printers: printerNames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/print', async (req, res) => {
  try {
    const { html, printerName } = req.body;
    console.log(`[PRINT REQUEST] Printer: ${printerName} at ${new Date().toISOString()}`);
    console.log(`[PRINT REQUEST] HTML content length: ${html ? html.length : 0}`);

    if (!html) {
      throw new Error("No HTML content provided");
    }

    if (!printerName) {
      throw new Error("No printer name provided");
    }

    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .substring(0, 19); 
    
    const pdfPath = path.join(printsDir, `print_${timestamp}.pdf`);
    console.log('[BACKEND] Generating PDF at:', pdfPath);

    console.log('[BACKEND] Launching puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    console.log('[BACKEND] Setting HTML content...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    console.log('[BACKEND] Generating PDF...');
    await page.pdf({ 
      path: pdfPath, 
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    await browser.close();
    console.log('[BACKEND] PDF generated successfully');
    
    console.log(`[BACKEND] Sending to printer: ${printerName}`);
    await printer.print(pdfPath, { printer: printerName });
    console.log(`[PRINT SUCCESS] Sent to printer: ${printerName}`);

    console.log('[BACKEND] PDF saved permanently at:', pdfPath);
    
    res.json({ success: true, message: 'Printed successfully', filename: `print_${timestamp}.pdf` });
  } catch (error) {
    console.error(`[PRINT ERROR]`, error.message);
    console.error(error.stack);

    let friendlyMessage = error.message;
    if (
      printerName &&
      printerName.toLowerCase().includes("pdf") &&
      error.message &&
      error.message.includes("SumatraPDF")
    ) {
      friendlyMessage =
        "Printing to 'Microsoft Print to PDF' is not supported for silent printing. Please select a real/physical printer or download the PDF from the backend.";
    }

    res.status(500).json({ error: friendlyMessage });
  }
});

app.get('/prints/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(printsDir, filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename);
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/', (req, res) => {
  res.send('Print service is running');
});

app.listen(3001, () => console.log('Print service running on port 3001'));
