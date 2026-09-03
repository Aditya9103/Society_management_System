const fs = require('fs');

const file = 'src/portals/resident/components/dashboard/ApprovedDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /(<h1[^>]*>.*?<\/h1>\s*)<p className="([^"]*text-[xsm]+[^"]*)"/g;

const newContent = content.replace(regex, (match, h1Part, pClass) => {
    if (!pClass.includes('hidden')) {
        return `${h1Part}<p className="hidden md:block ${pClass}"`;
    }
    return match;
});

if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
}
