const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/portals/resident/pages/*.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Pattern to match <h1>...</h1> followed by <p className="text-sm ...">
    const regex = /(<h1[^>]*>.*?<\/h1>\s*)<p className="([^"]*text-sm[^"]*)"/g;
    
    const newContent = content.replace(regex, (match, h1Part, pClass) => {
        if (!pClass.includes('hidden')) {
            return `${h1Part}<p className="hidden ${pClass}"`;
        }
        return match;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    }
});
