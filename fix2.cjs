const fs = require('fs');
let file = fs.readFileSync('src/components/TripWorkspaceView.tsx', 'utf-8');
file = file.replace(
  "        )}\n          <Edit3 className=\"w-5 h-5\" />\n        </button>",
  "        )}"
);
fs.writeFileSync('src/components/TripWorkspaceView.tsx', file);
