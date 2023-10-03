import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import open from "open";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pythonEnv = "C:/Users/loay.mohammed/venv/Scripts/python";
const pythonScript = 'C:/wamp64/www/htmlPdf/script.py';
const tempFileOutput = __dirname;

async function main() {
  const inputHTML = `<!DOCTYPE html>
  <html>
  <head>
      <meta charset='UTF-8'>
      <title>Complex HTML with Flexbox</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              height: 100vh;
          }
  
          header {
              background-color: #333;
              color: #fff;
              padding: 20px;
              width: 20in;
          }
  
          @page {
              margin: 0; /* Set page margin to zero */
          }
  
          main {
              flex: 1;
              display: flex;
              justify-content: space-between;
              padding: 20px;
          }
  
          aside {
              width: 25%;
              background-color: #eee;
              padding: 10px;
          }
  
          section {
              width: 70%;
              background-color: #f7f7f7;
              padding: 10px;
          }
  
          footer {
              background-color: #333;
              color: #fff;
              padding: 10px;
          }
      </style>
  </head>
  <body>
      <header>
          <h1>Header Section</h1>
      </header>
      <main>
          <aside>
              <h2>Sidebar</h2>
              <ul>
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
              </ul>
          </aside>
          <section>
              <h2>Main Content Section</h2>
              <p>This is the main content of your document. You can add text, images, and other elements here.</p>
          </section>
      </main>
      <footer>
          <p>Footer Section</p>
      </footer>
  </body>
  </html>`;

  const dataToSend = {
    html: inputHTML,
  };

  const jsonData = JSON.stringify(dataToSend);

  const tmpFileInput = path.join(tempFileOutput, `data_${Date.now()}.json`);

  try {
    // Write the JSON data to a file
    await fs.writeFile(tmpFileInput, jsonData);

    // Spawn the Python process
    const pythonProcess = spawn(pythonEnv, [pythonScript, tmpFileInput]);

    // Create a variable to accumulate stdout data
    let pdfData = Buffer.from([]);

    pythonProcess.stdout.on("data", (data) => {
      // Accumulate the data received from Python
      pdfData = Buffer.concat([pdfData, data]);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        // Save the accumulated PDF data to a file (e.g., output.pdf)
        await fs.writeFile("output.pdf", pdfData);

        // Open the saved PDF file with the default application for PDFs
        await open("output.pdf", { wait: true }); // Open with the default PDF viewer

        // Unlink (delete) the temporary JSON file
        await fs.unlink(tmpFileInput);

        // Delete the PDF file after opening it
        await fs.unlink('output.pdf');

        console.log("PDF generation and opening completed successfully.");
      } else {
        console.error(`Python process exited with code ${code}.`);
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

main().catch((error) => {
  console.error(`Error in the main function: ${error}`);
});
