"""
Extracts structured text (titles, bold, italics, font size) from a PDF using PyMuPDF (fitz).
Outputs a list of text blocks with formatting and hierarchy info for downstream chunking and embedding.
"""

import fitz  # PyMuPDF
import json
import sys
import re

def extract_line_metadata(line):
    """
    Extracts text and formatting info from a PDF line.
    Returns a dictionary with text, font size, bold/italic flags, and font names.
    """
    # merge all spans, but track if the first n chars are bold/large font
    spans = line['spans']
    merged_text = ""
    font_sizes = set()
    fonts = set()
    is_bold = False

    # Track bold/large font runs at the start
    bold_or_large_run = ""
    bold_or_large_count = 0
    LARGE_FONT_THRESHOLD = 20
    for i, span in enumerate(spans):
        font_sizes.add(span['size'])
        fonts.add(span['font'])
        if "Bold" in span['font']:
            span_is_bold = True
        else:
            span_is_bold = False
        span_is_large = span['size'] > LARGE_FONT_THRESHOLD
        # If at start, count consecutive bold/large font chars
        if i == 0 and (span_is_bold or span_is_large):
            bold_or_large_run += span['text']
            bold_or_large_count += len(re.sub(r'\s', '', span['text']))
        else:
            bold_or_large_count = 0
        if span_is_bold:
            is_bold = True
        merged_text += span['text']

    # If the first run is less than 3 chars, treat as regular text
    if bold_or_large_count > 0 and bold_or_large_count < 3:
        merged_text = bold_or_large_run + merged_text[len(bold_or_large_run):]

    text = merged_text.strip()
    font_size = max(font_sizes) if font_sizes else None
    return {
        "text": text,
        "font_size": font_size,
        "is_bold": is_bold,
        "fonts": list(fonts)
    }

def is_heading(line_meta, last_font_size):
    """
    Determines if a line is a heading based on formatting and font size.
    Returns True if the line is bold, italic, or has a font size jump.
    """
    text = line_meta["text"]

    # Excludes lines that start with "Art. " followed by a number and ".-" from being main headings
    if re.match(r"^Art\.\s+[\d\-A-Z]+\.-\s*", text):
        return False

    # New rule: If the text starts with a lowercase letter, it's likely not a heading.
    if text and text[0].islower():
        return False

    # Heading if bold only and at least 3 consecutive bold characters
    if line_meta["is_bold"]:
        # Count consecutive bold characters (ignoring spaces), edge case
        if len(re.sub(r'\s', '', text)) >= 3:
            return True
    # Heading if font size increases compared to previous line (major jump '+5')
    if last_font_size and line_meta["font_size"]:
        if line_meta["font_size"] > last_font_size + 5:
            # Also require at least 3 consecutive large-font characters
            if len(re.sub(r'\s', '', text)) >= 3:
                return True
    # Heading if line has at least 3 consecutive large-font characters (even if not bold)
    # Define a threshold for "large" font size (e.g., > 20)
    LARGE_FONT_THRESHOLD = 20
    if line_meta["font_size"] and line_meta["font_size"] > LARGE_FONT_THRESHOLD:
        if len(re.sub(r'\s', '', text)) >= 3:
            return True
    return False

def extract_pdf_structure(pdf_path):
    """
    Groups lines into sections based on heading detection (bold, italic, or font size jump).
    Each section contains a heading and its body text, with formatting metadata.
    Returns a list of sections for downstream chunking and embedding.
    """
    doc = fitz.open(pdf_path)
    sections = []
    
    current_heading_text = [] # Accumulate lines of a heading
    current_heading_meta = None # Metadata for the heading
    current_body_lines = [] # Accumulate raw lines of the body

    # Regex for lines to ignore (boilerplate and standalone page numbers)
    ignore_patterns = [
        re.compile(r"ASAMBLEA LEGISLATIVA\s*[-_]*\s*REPUBLICA DE EL SALVADOR", re.IGNORECASE),
        re.compile(r"INDICE LEGISLATIVO", re.IGNORECASE),
        re.compile(r"^\s*\d+\s*$", re.IGNORECASE), # Lines containing only numbers (page numbers)
        re.compile(r"^[_\-]+$", re.IGNORECASE) # Lines consisting solely of underscores or dashes
    ]

    def finalize_current_section():
        """Helper to finalize the current section and add to sections list."""
        nonlocal current_heading_text, current_heading_meta, current_body_lines
        if current_heading_text: # Only finalize if there's a heading to form a section
            sections.append({
                "heading": " ".join(current_heading_text).strip(),
                "page": current_heading_meta["page"],
                "font_size": current_heading_meta["font_size"],
                "is_bold": current_heading_meta["is_bold"],
                "fonts": current_heading_meta["fonts"],
                # REVERTED CHANGE: Join all body lines with a single newline into one string
                "body": "\n".join([line for line in current_body_lines if line.strip()]).strip() 
            })
        # Reset for the next section
        current_heading_text = []
        current_heading_meta = None
        current_body_lines = []

    # New helper to identify parts of multi-line titles like TÍTULO, CAPÍTULO, SECCIÓN
    def is_compound_title_part(text):
        if not text:
            return False
        
        alpha_chars = ''.join(filter(str.isalpha, text))
        # Lower the threshold slightly to catch "mostly" uppercase titles like "Sujetos PROCESALES"
        if alpha_chars and (sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)) > 0.6: 
            # Use a more comprehensive list of structural keywords
            if re.search(r"(TÍTULO|CAPÍTULO|SECCIÓN|ACCIONES|ACCIÓN\s*PENAL|EJERCICIO\s*DE\s*LA\s*ACCIÓN\s*PENAL|SUJETOS\s*PROCESALES|COMPETENCIAS\s*MATERIAL\s*Y\s*FUNCIONAL|TRIBUNALES|COMPETENCIA|IMPUTADO|LIBRO|DISPOSICIONES\s*GENERALES|PRINCIPIOS\s*Y\s*GARANTÍAS|PRINCIPIOS\s*BÁSICOS\s*Y\s*GARANTÍAS|CONSTITUCIONALES)", text, re.IGNORECASE): 
                return True
        return False

    last_font_size = None # Needed for is_heading

    for page_num in range(len(doc)):
        page = doc[page_num]
        for block in page.get_text("dict")['blocks']:
            if 'lines' not in block:
                continue
            for line in block['lines']:
                line_meta = extract_line_metadata(line)
                text = line_meta["text"]

                if not text:
                    continue

                # Check for boilerplate/page numbers and skip
                is_boilerplate = False
                for pattern in ignore_patterns:
                    if pattern.search(text): # Using .search for robustness
                        is_boilerplate = True
                        break
                if is_boilerplate:
                    continue # Skip this line entirely

                heading_candidate = is_heading(line_meta, last_font_size)

                if heading_candidate:
                    is_continuation_of_compound_title = False
                    if current_heading_text:
                        # Check if both current text and last part of current heading are 'compound parts'
                        # and their formatting is similar (e.g., same size/bold)
                        if (is_compound_title_part(text) and 
                            is_compound_title_part(current_heading_text[-1]) and
                            abs(line_meta["font_size"] - current_heading_meta["font_size"]) < 1 and # Match font size
                            line_meta["is_bold"] == current_heading_meta["is_bold"]): # Match bold status
                            is_continuation_of_compound_title = True

                    if not current_heading_text or is_continuation_of_compound_title:
                        # If no heading yet, or it's a continuation of a compound title, append
                        current_heading_text.append(text)
                        if not current_heading_meta: # Initialize meta if starting new
                            current_heading_meta = {
                                "page": page_num + 1,
                                "font_size": line_meta["font_size"],
                                "is_bold": line_meta["is_bold"],
                                "fonts": line_meta["fonts"]
                            }
                        # If it's a continuation, ensure font info is comprehensive
                        current_heading_meta["fonts"].extend(line_meta["fonts"])
                        current_heading_meta["fonts"] = list(set(current_heading_meta["fonts"])) # Remove duplicates
                        # Ensure font size and bold status reflect the *first* part of the compound heading
                        # or at least a consistent one, if not dynamically updated for each part.
                        # For simplicity, we keep the initial meta's font_size and is_bold for the compound heading.

                    else:
                        # It's a new, distinct heading (not a continuation of a compound title)
                        finalize_current_section()
                        current_heading_text.append(text)
                        current_heading_meta = {
                            "page": page_num + 1,
                            "font_size": line_meta["font_size"],
                            "is_bold": line_meta["is_bold"],
                            "fonts": line_meta["fonts"]
                        }
                    # Update last_font_size *after* considering if it's a heading
                    # This ensures correct comparison for subsequent lines
                    last_font_size = line_meta["font_size"]
                else: # Not a heading
                    # If we haven't found a heading yet, this is initial body text before the first heading
                    if not current_heading_text:
                        # Append to body without a heading - could be document preamble
                        current_body_lines.append(text)
                    else:
                        # This is body text for the current section
                        current_body_lines.append(text)
                    # Update last_font_size even for body text
                    last_font_size = line_meta["font_size"]

    # Finalize any remaining section after iterating through all lines
    finalize_current_section()

    return sections

if __name__ == "__main__":
    # Check for PDF path argument
    if len(sys.argv) < 2:
        print("Usage: python parse_pdf_new2.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    # Extract structured blocks from the PDF
    blocks = extract_pdf_structure(pdf_path)
    # Print results as formatted JSON
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(blocks, f, ensure_ascii=False, indent=2)
    print("Results written to output.json")