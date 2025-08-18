const express = require('express');
const router = express.Router();
const { generateLawsuitPDF } = require('../ai_tools/draft_lawsuit');

router.post('/', async (req, res) => {
  try {
    const pdfPath = await generateLawsuitPDF(req.body);
    res.download(pdfPath, 'demanda_judicial.pdf');
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;