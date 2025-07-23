/*
 * Description:
 *   This script formalizes user answers for a Salvadoran lawsuit using OpenAI, injects them into an HTML template,
 *   and generates a court-ready PDF using Puppeteer. Intended for backend automation of legal document drafting.
 *
 * Usage:
 *   - Configure your .env file with EXPO_PUBLIC_OPENAI_API_KEY.
 *   - Run: node ai_tools/draft_lawsuit.js
 *   - The script will output a demanda_judicial.pdf file in the working directory.
 *
 * Author: Ji Qi Ni, July 21, 2025
 */

const puppeteer = require('puppeteer');

/*
 * This function takes an HTML string and a file path, then uses Puppeteer to render the HTML and save it as a PDF.
 * returns a promise that resolves to the path of the generated PDF file.
 */
async function htmlToPDF(html, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  await browser.close();
  return outputPath;
}

// Step 1: OpenAI setup and legal prompt
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });

// Prompt for legal formalization: You are a Salvadoran paralegal. Rewrite the following text in formal, clear, and appropriate Spanish for a lawsuit in El Salvador. Add legal terms or context if necessary.
const LEGAL_PROMPT = "Eres un asistente legal salvadoreño. Reescribe el siguiente texto en español formal, claro y apropiado para una demanda judicial en El Salvador. Añade palabras o contexto legal si es necesario.";

// Fields to formalize in the lawsuit
const FIELDS_TO_POLISH = [
  'hechos',        // Facts of the case
  'fundamento',    // Legal basis
  'pretensiones',  // Requests to the court
  'pruebas'        // Offered evidence
];

/*
 * This function uses OpenAI to formalize a single field of user input for legal Spanish.
 * Arguments:
 *   - input: The raw user input string to be formalized.
 * Returns:
 *   - A promise that resolves to the formalized legal text string.
 */
async function polishText(input) {
  const messages = [
    { role: "system", content: LEGAL_PROMPT },
    { role: "user", content: input }
  ];
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    temperature: 0
  });
  return completion.choices[0].message.content;
}

/*
 * This function processes all relevant fields in the lawsuit form using OpenAI, skipping empty fields.
 * Arguments:
 *   - form: The raw user form data object.
 * Returns:
 *   - A promise that resolves to the form object with polished legal text.
 */
async function polishLawsuitForm(form) {
  const polished = { ...form };
  for (const field of FIELDS_TO_POLISH) {
    const value = form[field];
    // Only polish non-empty fields
    if (value !== undefined && value !== null && value.toString().trim() !== '') {
      polished[field] = await polishText(value);
    }
  }
  return polished;
}

/*
 * This function generates the HTML template for the lawsuit document.
 * Arguments:
 *   - form: The polished form data object.
 * Returns:
 *   - The HTML string for PDF rendering.
 */
function generateLawsuitHTML(form) {
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Demanda Judicial</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h2 { margin-top: 24px; }
          .section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Demanda Judicial</h1>
        <div class="section"><strong>Ciudad del Juzgado:</strong> ${form.ciudad}</div>
        <div class="section"><strong>Nombre completo:</strong> ${form.nombreCompleto}</div>
        <div class="section"><strong>Edad:</strong> ${form.edad}</div>
        <div class="section"><strong>Profesión u ocupación:</strong> ${form.profesion}</div>
        <div class="section"><strong>Número de DUI o pasaporte:</strong> ${form.dui}</div>
        <div class="section"><strong>Dirección de residencia:</strong> ${form.direccionResidencia}</div>
        <div class="section"><strong>Dirección para notificaciones:</strong> ${form.notificaciones}</div>
        <h2>Relación de los Hechos</h2>
        <div class="section">${form.hechos}</div>
        <h2>Fundamento de Derecho</h2>
        <div class="section">${form.fundamento}</div>
        <h2>Pretensiones</h2>
        <div class="section">${form.pretensiones}</div>
        <h2>Oferta de Pruebas</h2>
        <div class="section">${form.pruebas}</div>
        <h2>Firma y Fecha</h2>
        <div class="section"><strong>Ciudad de firma:</strong> ${form.ciudadFirma}</div>
        <div class="section"><strong>Fecha:</strong> ${form.fecha}</div>
        <div class="section"><strong>Firma del demandante:</strong> ${form.firma}</div>
      </body>
    </html>
  `;
}


// Example usage:
// This block demonstrates the full workflow: polish user input, generate HTML, and create PDF.
(async () => {
  // Example user form data
  const userForm = {
    ciudad: 'San Salvador',
    nombreCompleto: 'Juan Perez',
    edad: '35',
    profesion: 'Abogado',
    dui: '01234567-8',
    direccionResidencia: 'Calle Principal #123',
    notificaciones: 'correo@ejemplo.com',
    hechos: 'El demandado incumplió el contrato.',
    fundamento: 'Art. 123 del Código Civil.',
    pretensiones: 'Pago de daños y perjuicios.',
    pruebas: 'Contrato firmado, testigos.',
    ciudadFirma: 'San Salvador',
    fecha: '2025-07-21',
    firma: 'Juan Perez'
  };

  // Polish the form fields using OpenAI
  const polishedForm = await polishLawsuitForm(userForm);
  // Generate HTML from the polished form
  const html = generateLawsuitHTML(polishedForm);
  // Output PDF file path
  const pdfPath = 'demanda_judicial.pdf';
  // Generate PDF from HTML
  await htmlToPDF(html, pdfPath);
  // Log result
  console.log(`PDF generated at: ${pdfPath}`);
})();
