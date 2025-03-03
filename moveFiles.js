const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');
const dashboardDir = path.join(baseDir, 'pages/Dashboard');
const pagesDir = path.join(baseDir, 'pages');

function moveFiles() {
  // Step 1: Move files from Dashboard to Pages
  fs.readdir(dashboardDir, (err, files) => {
    if (err) {
      console.error(`Error reading Dashboard directory: ${err}`);
      return;
    }

    files.forEach(file => {
      const oldPath = path.join(dashboardDir, file);
      const newPath = path.join(pagesDir, file);

      fs.rename(oldPath, newPath, err => {
        if (err) {
          console.error(`Error moving file ${file}: ${err}`);
        } else {
          console.log(`Moved ${file} to pages/`);
        }
      });
    });
  });

  // Step 2: Update all imports in the project
  updateImports();
}

function updateImports() {
  // Read all files in src directory to update imports
  function readDirectory(dir) {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${dir}: ${err}`);
        return;
      }

      files.forEach(file => {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
          readDirectory(fullPath); // Recursive call for subdirectories
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          updateFileImports(fullPath);
        }
      });
    });
  }

  function updateFileImports(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}: ${err}`);
        return;
      }

      const updatedData = data.replace(
        /\/pages\/Dashboard\//g,
        '/pages/'
      );

      fs.writeFile(filePath, updatedData, 'utf8', err => {
        if (err) {
          console.error(`Error updating imports in ${filePath}: ${err}`);
        } else {
          console.log(`Updated imports in ${filePath}`);
        }
      });
    });
  }

  readDirectory(baseDir);
}

moveFiles();