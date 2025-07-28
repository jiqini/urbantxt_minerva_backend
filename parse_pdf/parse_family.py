"""
Description: 
    Extracts headings and body text from a PDF file (family law), using all-caps lines as headings.
    Outputs a JSON file with a list of {heading, body} objects, suitable for downstream chunking/vectorization.

Usage:
    python parse_family.py

    Author: Ji Qi Ni, July 2025
"""

import fitz  # PyMuPDF
import json
import sys
import os

def is_all_caps(line):
    """
    Returns True if the line is all uppercase (ignoring whitespace).
    """
    return line.strip().isupper()

def parse_family_pdf(pdf_path):
    """
    Parses the PDF at pdf_path, extracting headings (all-caps lines) and their associated body text.
    Returns a list of dicts: [{"heading": ..., "body": ...}, ...]
    """
    doc = fitz.open(pdf_path)
    results = []
    current_heading = None
    current_body_lines = []
    buffered_caps = []

    # Process each page in the PDF
    for page in doc:
        lines = page.get_text().split('\n')
        for i, line in enumerate(lines):
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                continue

            # If the line is all caps, buffer it (potential heading)
            if is_all_caps(stripped):
                buffered_caps.append(stripped)
                continue

            # If we hit a non-all-caps line and had buffered caps before, treat last as heading
            if buffered_caps:
                current_heading = buffered_caps[-1]
                if current_body_lines and current_heading:
                    # Save previous heading/body block
                    results.append({
                        "heading": current_heading,
                        "body": "\n".join(current_body_lines).strip()
                    })
                current_body_lines = []
                buffered_caps = []  # Clear buffer now that heading is captured

            # Add line to current body
            current_body_lines.append(stripped)

    # Add the final block if exists
    if current_heading and current_body_lines:
        results.append({
            "heading": current_heading,
            "body": "\n".join(current_body_lines).strip()
        })
    return results

if __name__ == "__main__":
    # Check for PDF path argument
    if len(sys.argv) < 2:
        print("Usage: python parse_family.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    output_path = os.path.join(os.path.dirname(__file__), "../output_parsed_pdf/output_family.json")

    # Parse PDF and write JSON
    parsed = parse_family_pdf(pdf_path)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed, f, ensure_ascii=False, indent=2)
    print(f"Parsed {len(parsed)} heading/body blocks. Output written to {output_path}")