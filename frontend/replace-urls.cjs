const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/PC/Documents/gemini-integration/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace API URL
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:8080\/api'\}/g, 
        "${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}");
        
    // Replace WS URL
    content = content.replace(/\$\{import\.meta\.env\.VITE_WS_URL \|\| 'http:\/\/localhost:8080\/ws'\}/g, 
        "${import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/ws' : 'http://localhost:8080/ws')}");
        
    fs.writeFileSync(file, content);
});

console.log('Replaced successfully!');
