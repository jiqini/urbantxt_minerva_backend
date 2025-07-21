"""
 * PDF Legal Document Parser
 *
 * Description:
 *   This script parses PDF legal documents and extracts structured content with
 *   enhanced "Art. X.-" article detection and header-body text separation.
 *   Designed for El Salvador's legal texts including procedural codes and
 *   constitutional documents. Outputs structured JSON with headings, body text,
 *   and formatting metadata.
 *
 * Usage:
 *   - Run: python parse_pdf_new4.py <pdf_path>
 *   - Creates 'output.json' with structured sections including separated
 *     article headers and their corresponding body content
 *
 * Jaime Monjaraz, July 18, 2025
 *
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
    spans = line['spans']
    merged_text = ""
    font_sizes = set()
    fonts = set()
    is_bold = False

    LARGE_FONT_THRESHOLD = 20

    for span in spans:
        font_sizes.add(span['size'])
        fonts.add(span['font'])
        if "Bold" in span['font'] or "bold" in span['font'].lower():
            is_bold = True
        merged_text += span['text']

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
    Determines if a line is a header based on the specified rules:
    - "Contenido;"
    - Any line starting with "Art. X.-"
    - Any line that is bold (and not a lowercase start, etc.)
    - Any line with a significant font size increase.
    """
    text = line_meta["text"].strip()

    # Rule 1: "Contenido;" is always a header.
    if text == "Contenido;":
        return True

    # Rule 2: Any line starting with "Art. " followed by a number/letter and ".-" is a header.
    # IMPORTANT: This function just flags it *as a header*. The parsing function
    # will handle splitting "Art. X.-" from the rest of the text.
    if re.match(r"^Art\.\s+[\d\-A-Z]+\.-\s*", text):
        return True

    # Exclude lines that start with a lowercase letter, as they are unlikely to be headings.
    if text and text[0].islower():
        return False

    # Rule 3: Lines that are detected as bold.
    if line_meta["is_bold"]:
        if len(re.sub(r'\s', '', text)) >= 3:
            return True

    # Rule 4: Lines with a significant font size increase.
    if last_font_size is not None and line_meta["font_size"] is not None:
        if line_meta["font_size"] > last_font_size + 5:
            if len(re.sub(r'\s', '', text)) >= 3:
                return True
    
    LARGE_FONT_THRESHOLD = 20
    if line_meta["font_size"] is not None and line_meta["font_size"] > LARGE_FONT_THRESHOLD:
        if len(re.sub(r'\s', '', text)) >= 3:
            return True

    return False


def extract_pdf_structure(pdf_path):
    """
    Groups lines into sections where each heading (as determined by is_heading)
    starts a new section. The body text belongs to the preceding header.
    """
    doc = fitz.open(pdf_path)
    sections = []
    
    current_heading_parts = [] # Accumulate parts of a multi-line heading
    current_heading_meta = None # Metadata for the current heading
    current_body_lines = [] # Accumulate raw text lines for the body of the current section

    ignore_patterns = [
        re.compile(r"ASAMBLEA LEGISLATIVA\s*[-_]*\s*REPUBLICA DE EL SALVADOR", re.IGNORECASE),
        re.compile(r"INDICE LEGISLATIVO", re.IGNORECASE),
        re.compile(r"^\s*\d+\s*$", re.IGNORECASE),
        re.compile(r"^[_\-]+$", re.IGNORECASE)
    ]

    def finalize_current_section():
        """Helper to finalize the current section and add to sections list."""
        nonlocal current_heading_parts, current_heading_meta, current_body_lines
        if current_heading_parts and current_heading_meta: # Only finalize if there's a heading
            sections.append({
                "heading": " ".join(current_heading_parts).strip(),
                "page": current_heading_meta["page"],
                "font_size": current_heading_meta["font_size"],
                "is_bold": current_heading_meta["is_bold"],
                "fonts": current_heading_meta["fonts"],
                "body": "\n".join([line for line in current_body_lines if line.strip()]).strip()
            })
        # Reset for the next section
        current_heading_parts = []
        current_heading_meta = None
        current_body_lines = []

    def is_compound_title_part(text):
        if not text:
            return False
        alpha_chars = ''.join(filter(str.isalpha, text))
        if alpha_chars and (sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)) > 0.6: 
            if re.search(r"(TÍTULO|CAPÍTULO|SECCIÓN|ACCIONES|ACCIÓN\s*PENAL|EJERCICIO\s*DE\s*LA\s*ACCIÓN\s*PENAL|SUJETOS\s*PROCESALES|COMPETENCIAS\s*MATERIAL\s*Y\s*FUNCIONAL|TRIBUNALES|COMPETENCIA|IMPUTADO|LIBRO|DISPOSICIONES\s*GENERALES|PRINCIPIOS\s*Y\s*GARANTÍAS|PRINCIPIOS\s*BÁSICOS\s*Y\s*GARANTÍAS|CONSTITUCIONALES)", text, re.IGNORECASE): 
                return True
        return False

    last_font_size = None

    for page_num in range(len(doc)):
        page = doc[page_num]
        for block in page.get_text("dict")['blocks']:
            if 'lines' not in block:
                continue
            for line in block['lines']:
                line_meta = extract_line_metadata(line)
                full_text_line = line_meta["text"] # The original full line text

                if not full_text_line:
                    continue

                is_boilerplate = False
                for pattern in ignore_patterns:
                    if pattern.search(full_text_line):
                        is_boilerplate = True
                        break
                if is_boilerplate:
                    continue

                heading_candidate = is_heading(line_meta, last_font_size)

                # Special handling for "Art. X.-" lines
                art_match = re.match(r"^(Art\.\s+[\d\-A-Z]+\.-\s*)(.*)", full_text_line)

                if heading_candidate:
                    # Always finalize the previous section if a new heading is found
                    finalize_current_section()

                    # Handle Art. X.- headers specifically
                    if art_match:
                        header_part = art_match.group(1).strip() # "Art. X.-"
                        body_start_part = art_match.group(2).strip() # The rest of the line
                        
                        current_heading_parts.append(header_part)
                        current_heading_meta = {
                            "page": page_num + 1,
                            "font_size": line_meta["font_size"], # Keep original font size
                            "is_bold": line_meta["is_bold"], # Keep original bold status
                            "fonts": line_meta["fonts"]
                        }
                        if body_start_part: # Add the rest of the line to body if it exists
                            current_body_lines.append(body_start_part)
                    else: # It's a non-Art header (Contenido;, bold title, etc.)
                        is_continuation_of_compound_title = False
                        if current_heading_parts and current_heading_meta: # Only if there's a previous header
                            if (is_compound_title_part(full_text_line) and 
                                is_compound_title_part(current_heading_parts[-1]) and
                                abs(line_meta["font_size"] - current_heading_meta["font_size"]) < 1 and
                                line_meta["is_bold"] == current_heading_meta["is_bold"]):
                                is_continuation_of_compound_title = True
                            # Specific compound title check for "CODIGO DE PROCEDIMIENTOS CIVILES."
                            # followed by "INTRODUCCION Y DIVISION DEL CODIGO"
                            elif (current_heading_parts[-1].strip() == "CODIGO DE PROCEDIMIENTOS CIVILES." and
                                  full_text_line.strip() == "INTRODUCCION Y DIVISION DEL CODIGO" and
                                  line_meta["is_bold"] and current_heading_meta["is_bold"]):
                                  is_continuation_of_compound_title = True

                        if is_continuation_of_compound_title:
                            current_heading_parts.append(full_text_line)
                            # Update meta for compound headings if needed, but primarily keep first part's meta
                            current_heading_meta["fonts"].extend(line_meta["fonts"])
                            current_heading_meta["fonts"] = list(set(current_heading_meta["fonts"])) # Remove duplicates
                        else:
                            # It's a brand new, non-Art header
                            current_heading_parts.append(full_text_line)
                            current_heading_meta = {
                                "page": page_num + 1,
                                "font_size": line_meta["font_size"],
                                "is_bold": line_meta["is_bold"],
                                "fonts": line_meta["fonts"]
                            }
                    last_font_size = line_meta["font_size"]
                else: # Not a header, so it's body text
                    # If there's an active heading, add to its body
                    if current_heading_parts:
                        current_body_lines.append(full_text_line)
                    else:
                        # This handles initial text before the very first header
                        # This text won't be associated with any specific header in the output
                        # but we still track its font size for `last_font_size`
                        pass # Or you could accumulate this into a "Preamble" section if desired

                    last_font_size = line_meta["font_size"]

    # Finalize any remaining section after iterating through all lines
    finalize_current_section()

    return sections

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_pdf_new4.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    blocks = extract_pdf_structure(pdf_path)
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(blocks, f, ensure_ascii=False, indent=2)
    print("Results written to output.json")