import express from 'express';
import printer from 'pdf-to-printer';
import puppeteer from 'puppeteer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // Generate PDF from HTML
    console.log('[BACKEND] Launching puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    console.log('[BACKEND] Setting HTML content...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(__dirname, `temp-${Date.now()}.pdf`);
    console.log('[BACKEND] Generating PDF at:', pdfPath);
    
    await page.pdf({ 
      path: pdfPath, 
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    await browser.close();
    console.log('[BACKEND] PDF generated successfully');
    
    // Print directly to printer
    console.log(`[BACKEND] Sending to printer: ${printerName}`);
    await printer.print(pdfPath, { printer: printerName });
    console.log(`[PRINT SUCCESS] Sent to printer: ${printerName}`);

    // Keep temp file for 5 seconds for debugging (optional - comment out in production)
    setTimeout(() => {
      try {
        fs.unlinkSync(pdfPath);
        console.log('[BACKEND] Temp PDF cleaned up');
      } catch (e) {
        console.error('[BACKEND] Failed to clean up temp PDF:', e);
      }
    }, 5000);
    
    res.json({ success: true, message: 'Printed successfully' });
  } catch (error) {
    console.error(`[PRINT ERROR]`, error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Print service is running');
});

app.listen(3001, () => console.log('Print service running on port 3001'));
