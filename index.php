<?php
// Define constants for paths
define('PYTHON_ENV_PATH', 'C:/Users/loay.mohammed/venv/Scripts/python');
define('PYTHON_SCRIPT_PATH', 'C:/wamp64/www/htmlPdf/script.py');
define('TEMP_FILE_OUTPUT', __DIR__);

// Define a function to generate the PDF
function generatePDF($htmlData) {
    $tmpFileInput = tempnam(TEMP_FILE_OUTPUT, 'data_');
    file_put_contents($tmpFileInput, $htmlData);

    $command = PYTHON_ENV_PATH . ' ' . PYTHON_SCRIPT_PATH . ' ' . $tmpFileInput . ' 2>&1';

    $descriptorspec = [
        0 => ['pipe', 'r'], // stdin
        1 => ['pipe', 'w'], // stdout
        2 => ['pipe', 'w'], // stderr
    ];

    $process = proc_open($command, $descriptorspec, $pipes);

    if (is_resource($process)) {
        fclose($pipes[0]);
        $output = '';

        // Set the Content-Type header to indicate that the response is a PDF
        header("Content-type: application/pdf");
        
        while (!feof($pipes[1])) {
            $output .= fread($pipes[1], 1024);
            ob_flush();
            flush();
        }

        fclose($pipes[1]);
        fclose($pipes[2]);

        $returnStatus = proc_close($process);

        if ($returnStatus === 0) {
            // Send the PDF content to the browser for display
            echo $output;

            // Unlink (delete) the temporary JSON file
            unlink($tmpFileInput);
            // Exit to prevent any additional output from the PHP script
            exit();
        } else {
            echo "Error generating PDF.";
        }
    } else {
        echo "Error starting PDF generation process.";
    }
}

// HTML content to be converted to PDF
$inputHTML = <<<HTML
<!-- Your HTML content here -->
<!DOCTYPE html>
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
  </html>
HTML;

$data = ["html" => $inputHTML];
$jsonData = json_encode($data);

// Generate the PDF
generatePDF($jsonData);
?>