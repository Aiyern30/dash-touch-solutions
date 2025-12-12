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
    
    // Generate PDF from HTML
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfPath = path.join(__dirname, `temp-${Date.now()}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();
    
    // Print directly to printer
    await printer.print(pdfPath, { printer: printerName });
    
    // Clean up temp file
    fs.unlinkSync(pdfPath);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Print service running on port 3001'));
