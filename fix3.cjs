const fs = require('fs');
let file = fs.readFileSync('src/components/TripWorkspaceView.tsx', 'utf-8');
file = file.replace(
  "  } = useTripContext();\n  const { user } = useAuth();\n\n  const isOwner = user?.uid === trip.userId;",
  "  } = useTripContext();\n\n  const isOwner = user?.uid === trip.userId;"
);
fs.writeFileSync('src/components/TripWorkspaceView.tsx', file);
