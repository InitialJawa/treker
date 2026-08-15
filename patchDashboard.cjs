const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// 1. Add import
file = file.replace(
  "import { Place } from '../types/travel';",
  "import { Place } from '../types/travel';\nimport { loadBanyuwangiTemplateToFirestore } from '../scripts/loadTemplate';"
);

// 2. Add loading state and modify button onClick
file = file.replace(
  "  const [toastMessage, setToastMessage] = useState<string | null>(null);",
  "  const [toastMessage, setToastMessage] = useState<string | null>(null);\n  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);\n\n  const handleLoadTemplate = async () => {\n    if (!user?.uid) return;\n    setIsLoadingTemplate(true);\n    try {\n      await loadBanyuwangiTemplateToFirestore(user.uid);\n      setToastMessage('✓ Template Banyuwangi berhasil dimuat ke database!');\n      setTimeout(() => setToastMessage(null), 3000);\n    } catch (e) {\n      console.error(e);\n      alert('Gagal memuat template');\n    } finally {\n      setIsLoadingTemplate(false);\n    }\n  };"
);

// 3. Update the button
file = file.replace(
  "                  onClick={() => resetToDefaults()}\n                  className=\"bg-offwhite border border-card-pink text-dark px-3 py-1.5 rounded-full text-xs font-bold hover:bg-soft-pink transition-colors\"\n                >\n                  Load Template Banyuwangi",
  "                  onClick={handleLoadTemplate}\n                  disabled={isLoadingTemplate}\n                  className=\"bg-offwhite border border-card-pink text-dark px-3 py-1.5 rounded-full text-xs font-bold hover:bg-soft-pink transition-colors disabled:opacity-50\"\n                >\n                  {isLoadingTemplate ? 'Loading...' : 'Load Template Banyuwangi'}"
);

fs.writeFileSync('src/components/DashboardView.tsx', file);
