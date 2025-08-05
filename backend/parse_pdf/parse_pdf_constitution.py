"""
 * PDF Constitution Parser - Legal Document Structure Extractor
 *
 * Description:
 *   This module provides intelligent parsing capabilities for legal PDF documents,
 *   specifically designed for extracting structured content from constitutional
 *   texts. It identifies and categorizes different heading types (Titles, Articles,
 *   Chapters) and organizes content into a hierarchical structure suitable for
 *   legal AI applications.
 *
 * Features:
 *   - Smart heading detection and categorization
 *   - Structural content organization (Titles, Articles, Chapters)
 *   - Table of Contents handling
 *   - Font-based formatting analysis
 *   - JSON output for downstream processing
 *
 * Usage:
 *   - Run: python parse_pdf_constitution.py <pdf_path>
 *   - Creates 'output.json' with structured legal document sections
 *
 * Dependencies:
 *   - PyMuPDF (fitz): PDF text extraction and analysis
 *   - json: Output formatting
 *   - re: Pattern matching for legal document structures
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
    Extracts text and basic formatting info from a PDF line.
    """
    spans = line['spans']
    merged_text = ""
    font_sizes = set()
    fonts = set()

    for span in spans:
        font_sizes.add(span['size'])
        fonts.add(span['font'])
        merged_text += span['text']

    text = re.sub(r'\[\d+\]', '', merged_text).strip()
    font_size = max(font_sizes) if font_sizes else None
    return {
        "text": text,
        "font_size": font_size,
        "fonts": list(fonts)
    }

def get_heading_type(line_meta):
    """
    Determines if a line is a heading and categorizes its type for nuanced combining.
    Returns:
    - "standalone_structural_heading": For Titles and Articles (should NOT combine)
    - "combinable_structural_chapter": For Chapters (should combine with next descriptive line)
    - "descriptive_follow_up": For lines that follow a combinable_structural_chapter
    - "standard_heading": For other standalone headings (e.g., general sections)
    - "toc_heading": For Table of Contents (special handling)
    - None: If not a recognized heading
    """
    text = line_meta["text"]

    # 1. "Article X" AND "TITLE X" - These are both standalone structural headings
    if re.match(r"^(Art\.|Article)\s+[\d\-A-Z]+\.?\s*", text, re.IGNORECASE) or \
       re.match(r"^TITLE\s+[\dIVXLC]+\s*$", text, re.IGNORECASE):
        return "standalone_structural_heading"

    # 2. "Table of Contents" - special handling, always its own section
    if "Table of Contents" in text:
        return "toc_heading"

    # 3. "CHAPTER X" or "SOLE CHAPTER" - These are the ONLY structural headings that combine
    #    with a descriptive part.
    #    Regex updated to correctly include "SOLE" as a valid chapter identifier.
    if re.match(r"^CHAPTER\s+(?:[\dIVXLC]+|SOLE)\s*$", text, re.IGNORECASE):
        return "combinable_structural_chapter"

    # 4. Descriptive follow-up lines - these will ONLY combine if the PREVIOUS heading was a "combinable_structural_chapter"
    #    a. Lines starting with "THE " and fully uppercase (e.g., "THE HUMAN PERSON...")
    if text.startswith("THE ") and text.isupper() and len(text) > 4:
        return "descriptive_follow_up"
    #    b. Specific title-cased keywords (e.g., "First Section", "The Family")
    heading_keywords = [
        "First Section", "Second Section", "Third Section", "Fourth Section",
        "The Family", "Labor and Social Security", "Education, Science, and Culture",
        "Public Health and Social Assistance"
    ]
    if text in heading_keywords:
        return "descriptive_follow_up"
    #    c. General title-cased lines that could be descriptive parts (e.g., "INDIVIDUAL RIGHTS...")
    capitalized_word_count = sum(1 for word in text.split() if word and word[0].isupper())
    total_word_count = len(text.split())
    if total_word_count > 1 and capitalized_word_count / total_word_count >= 0.5 and not text.isupper():
        return "descriptive_follow_up"

    # 5. Other general headings (e.g., "SECTION ONE", or other all-caps that don't fit above rules)
    #    These should be standalone headings.
    if text.isupper() and len(text) > 2:
        return "standard_heading"

    return None # If not a recognized heading type

def extract_pdf_structure(pdf_path):
    """
    Groups lines into a granular structure based on specific heading rules:
    - Titles and Articles are standalone.
    - Chapters combine with their immediate descriptive line.
    - Table of Contents has special handling.
    """
    doc = fitz.open(pdf_path)
    sections = []
    
    current_heading_text = [] 
    current_heading_meta = None 
    current_body_lines = [] 
    in_table_of_contents_section = False
    # Tracks the type of the LAST heading line that successfully started or extended a heading
    last_processed_heading_type = None 

    # Tolerance for floating-point font size comparisons
    FONT_SIZE_TOLERANCE = 0.1 # A small tolerance (e.g., 0.1 points)

    # Patterns for lines to ignore (page numbers, lines, boilerplate text)
    ignore_patterns = [
        re.compile(r"^\s*\d+\s*$"),
        re.compile(r"^[_\-]+$"),
        re.compile(r"CONSTITUTION OF THE REPUBLIC OF EL SALVADOR, 1983"),
        re.compile(r"Oceana™.*", re.IGNORECASE)
    ]

    def finalize_current_section():
        """Helper to finalize the current section and append it to the sections list."""
        nonlocal current_heading_text, current_heading_meta, current_body_lines
        if current_heading_text:
            heading_str = " ".join(current_heading_text).strip()
            sections.append({
                "heading": heading_str,
                "page": current_heading_meta["page"],
                "font_size": current_heading_meta["font_size"],
                "fonts": list(set(current_heading_meta["fonts"])),
                "body": "\n".join(line for line in current_body_lines if line.strip()).strip() 
            })
        current_heading_text = []
        current_heading_meta = None
        current_body_lines = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        for block in page.get_text("dict")['blocks']:
            if 'lines' not in block:
                continue
            for line in block['lines']:
                line_meta = extract_line_metadata(line)
                text = line_meta["text"]

                # Skip ignored lines
                if not text or any(p.search(text) for p in ignore_patterns):
                    continue

                current_line_type = get_heading_type(line_meta)

                # --- Handle Table of Contents section first (highest priority) ---
                # **THIS LOGIC IS UNCHANGED TO PRESERVE ITS CORRECT BEHAVIOR**
                if in_table_of_contents_section:
                    # If any new heading type is encountered (that's not ToC itself), TOC body ends
                    if current_line_type is not None and current_line_type != "toc_heading":
                        finalize_current_section()
                        in_table_of_contents_section = False
                    else:
                        current_body_lines.append(text)
                        continue # Continue to next line within ToC body
                
                if current_line_type == "toc_heading":
                    finalize_current_section() # Always finalize prior section before starting ToC
                    current_heading_text = [text]
                    current_heading_meta = {"page": page_num + 1, **line_meta}
                    in_table_of_contents_section = True
                    last_processed_heading_type = "toc_heading" # Update state
                    continue # Move to next line

                # --- Main Document Body Logic ---
                if current_line_type is not None: # If the current line is ANY type of heading
                    # Condition for COMBINING:
                    # ONLY if the previous heading was a "combinable_structural_chapter"
                    # AND the current line is a "descriptive_follow_up"
                    # AND they share similar font size (within tolerance) and are on the same page.
                    if (current_heading_text and 
                        last_processed_heading_type == "combinable_structural_chapter" and 
                        current_line_type == "descriptive_follow_up" and
                        abs(line_meta["font_size"] - current_heading_meta["font_size"]) < FONT_SIZE_TOLERANCE and # Use tolerance here
                        page_num + 1 == current_heading_meta["page"]):
                        
                        current_heading_text.append(text)
                        # Metadata like font size/fonts are primarily from the first part;
                        # assuming consistency for the combined heading.
                    else:
                        # Otherwise, this is a new, distinct heading (Title, Article, Chapter, or standard heading).
                        # Finalize the previous section first.
                        finalize_current_section()
                        
                        # Start a new section with this current heading.
                        current_heading_text = [text]
                        current_heading_meta = {"page": page_num + 1, **line_meta}
                    
                    # IMPORTANT: Update the type of the last heading line that was successfully processed.
                    # This dictates the decision for the *next* line.
                    last_processed_heading_type = current_line_type 
                else: # The current line is not a heading (it's body text)
                    current_body_lines.append(text)
                    last_processed_heading_type = None # Reset when body text is encountered

    # Finalize any remaining section at the end of the document
    finalize_current_section()
    return sections

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python your_script_name.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    blocks = extract_pdf_structure(pdf_path)
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(blocks, f, ensure_ascii=False, indent=2)
    print("Results written to output.json")