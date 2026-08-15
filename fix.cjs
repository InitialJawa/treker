const fs = require('fs');
let file = fs.readFileSync('src/components/TripWorkspaceView.tsx', 'utf-8');
file = file.replace(
  "  const {\n    const { user } = useAuth();\n    itineraryDays,",
  "  const { user } = useAuth();\n  const {\n    itineraryDays,"
);
fs.writeFileSync('src/components/TripWorkspaceView.tsx', file);
