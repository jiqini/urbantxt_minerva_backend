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
    # Heading if bold only and at least 3 consecutive bold characters
    if line_meta["is_bold"]:
        # Count consecutive bold characters (ignoring spaces), edge case
        if len(re.sub(r'\s', '', line_meta["text"])) >= 3:  # has to be 3 or more bold/large font characters
            return True
    # Heading if font size increases compared to previous line (major jump '+5')
    if last_font_size and line_meta["font_size"]:
        if line_meta["font_size"] > last_font_size + 5:
            # Also require at least 3 consecutive large-font characters
            if len(re.sub(r'\s', '', line_meta["text"])) >= 3:
                return True
    # Heading if line has at least 3 consecutive large-font characters (even if not bold)
    # Define a threshold for "large" font size (e.g., > 20)
    LARGE_FONT_THRESHOLD = 20
    if line_meta["font_size"] and line_meta["font_size"] > LARGE_FONT_THRESHOLD:
        if len(re.sub(r'\s', '', line_meta["text"])) >= 3:
            return True
    return False

def extract_pdf_structure(pdf_path):
    """
    Groups lines into sections based on heading detection (bold, italic, or font size jump).
    Each section contains a heading and its body text, with formatting metadata.
    Returns a list of sections for downstream chunking and embedding.
    """
    doc = fitz.open(pdf_path)
    sections = []  # List to store grouped sections
    current_section = None  # Current section being built
    current_body = []  # Lines belonging to the current section
    last_font_size = None  # Font size of previous line
    last_fonts = None  # Font family of previous line
    heading_buffer = []  # Buffer for multi-line heading
    heading_meta = None  # Metadata for heading

    def is_similar_heading(line_meta, ref_meta):
        """
        Checks if line_meta is similar to ref_meta for heading merging.
        """
        if not ref_meta:
            return False
        # Must be bold, same font size, and same font family
        return (
            line_meta["is_bold"] and
            abs(line_meta["font_size"] - ref_meta["font_size"]) < 1 and
            set(line_meta["fonts"]) == set(ref_meta["fonts"])
        )

    for page_num in range(len(doc)):
        page = doc[page_num]
        for block in page.get_text("dict")['blocks']:
            if 'lines' not in block:
                continue  # Skip non-text blocks
            for line in block['lines']:
                line_meta = extract_line_metadata(line)  # Get line metadata
                text = line_meta["text"]
                if not text:
                    continue  # Skip empty lines
                heading = is_heading(line_meta, last_font_size)
                if heading:
                    # If heading_buffer is empty, start new heading
                    if not heading_buffer:
                        heading_buffer = [text]
                        heading_meta = {
                            "page": page_num + 1,
                            "font_size": line_meta["font_size"],
                            "is_bold": line_meta["is_bold"],
                            "fonts": line_meta["fonts"]
                        }
                    # If similar to previous heading, merge
                    elif is_similar_heading(line_meta, heading_meta):
                        heading_buffer.append(text)
                    else:
                        # Finalize previous heading
                        if current_section:
                            current_section['body'] = "\n".join(current_body).strip()
                            sections.append(current_section)
                        current_section = {
                            "heading": " ".join(heading_buffer).strip(),
                            "page": heading_meta["page"],
                            "font_size": heading_meta["font_size"],
                            "is_bold": heading_meta["is_bold"],
                            "fonts": heading_meta["fonts"]
                        }
                        current_body = []
                        heading_buffer = [text]
                        heading_meta = {
                            "page": page_num + 1,
                            "font_size": line_meta["font_size"],
                            "is_bold": line_meta["is_bold"],
                            "fonts": line_meta["fonts"]
                        }
                else:
                    # If heading_buffer has content, finalize heading
                    if heading_buffer:
                        if current_section:
                            current_section['body'] = "\n".join(current_body).strip()
                            sections.append(current_section)
                        current_section = {
                            "heading": " ".join(heading_buffer).strip(),
                            "page": heading_meta["page"],
                            "font_size": heading_meta["font_size"],
                            "is_bold": heading_meta["is_bold"],
                            "fonts": heading_meta["fonts"]
                        }
                        current_body = []
                        heading_buffer = []
                        heading_meta = None
                    current_body.append(text)
                last_font_size = line_meta["font_size"]

    # Finalize last heading/section
    if heading_buffer:
        if current_section:
            current_section['body'] = "\n".join(current_body).strip()
            sections.append(current_section)
        current_section = {
            "heading": " ".join(heading_buffer).strip(),
            "page": heading_meta["page"],
            "font_size": heading_meta["font_size"],
            "is_bold": heading_meta["is_bold"],
            "fonts": heading_meta["fonts"]
        }
        current_section['body'] = "\n".join(current_body).strip()
        sections.append(current_section)
    elif current_section:
        current_section['body'] = "\n".join(current_body).strip()
        sections.append(current_section)

    return sections

if __name__ == "__main__":
    # Check for PDF path argument
    if len(sys.argv) < 2:
        print("Usage: python parse_pdf_new1.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    # Extract structured blocks from the PDF
    blocks = extract_pdf_structure(pdf_path)
    # Print results as formatted JSON
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(blocks, f, ensure_ascii=False, indent=2)
    print("Results written to output.json")
