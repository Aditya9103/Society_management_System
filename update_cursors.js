const fs = require('fs');
const file = '/Users/abhimanyukumar/Desktop/Society-Management-System/sms-frontend/src/portals/admin/components/residents/ResidentDetailsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<(button|a)([^>]*?)className="([^"]*?)"([^>]*?)>/g, (match, tag, before, cls, after) => {
    if (!cls.includes('cursor-pointer')) {
        return `<${tag}${before}className="${cls} cursor-pointer"${after}>`;
    }
    return match;
});

fs.writeFileSync(file, content);
console.log("Updated cursors.");
