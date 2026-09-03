const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/portals/resident/pages/*.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Sometimes the <p> is not right after <h1> because there's a <div> or something.
    // Let's just look for <p className="text-sm text-white font-bold"> directly in the file.
    // If it's a known header subtitle.
    
    const newContent = content.replace(/<p className="([^"]*text-sm text-white font-bold[^"]*)"/g, (match, pClass) => {
        if (!pClass.includes('hidden')) {
            return `<p className="hidden md:block ${pClass}"`;
        }
        return match;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    }
});
