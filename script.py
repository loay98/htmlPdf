import sys
import json
import logging
from weasyprint import HTML

# Configure the logging settings
logging.basicConfig(filename='pdf_generation.log', level=logging.INFO,
                    format='%(asctime)s [%(levelname)s] - %(message)s')

def generate_pdf(input_json_file):
    try:
        # Read the JSON data from the input file
        with open(input_json_file, 'r') as f:
            data = json.load(f)

        # Get the HTML content from the JSON data
        inputHTML = data.get("html")

        # Generate the PDF using WeasyPrint
        pdf_bytes = HTML(string=inputHTML).write_pdf()

        # Send the PDF content to stdout
        sys.stdout.buffer.write(pdf_bytes)

        # Log success
        logging.info(f"PDF generated from {input_json_file}")

    except Exception as e:
        # Log errors
        print(f"Error: {e}")
        logging.error(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("No input provided Usage: python generate_pdf.py <input_json_file>")
        logging.error(f"No input provided Usage: python generate_pdf.py <input_json_file>")
        sys.exit(1)

    input_json_file = sys.argv[1]
    generate_pdf(input_json_file)
