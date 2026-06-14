const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const apiVar = "`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}`";
const wsVar = "`${import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'}`";

walkDir(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace API URL string literals
    content = content.replace(/'http:\/\/localhost:8080\/api/g, apiVar + ' + \'');
    
    // Replace template literals: `http://localhost:8080/api...`
    content = content.replace(/`http:\/\/localhost:8080\/api/g, apiVar + ' + `');
    
    // Replace WebSocket string literals
    content = content.replace(/'http:\/\/localhost:8080\/ws/g, wsVar + ' + \'');
    content = content.replace(/`http:\/\/localhost:8080\/ws/g, wsVar + ' + `');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
