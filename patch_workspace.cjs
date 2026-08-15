const fs = require('fs');

let file = fs.readFileSync('src/components/TripWorkspaceView.tsx', 'utf-8');

// 1. Add AuthContext
file = file.replace(
  "import { useTripContext } from '../context/TripContext';",
  "import { useTripContext } from '../context/TripContext';\nimport { useAuth } from '../context/AuthContext';"
);

// 2. Add useAuth into component
file = file.replace(
  "    itineraryDays,",
  "    const { user } = useAuth();\n    itineraryDays,"
);

// 3. Add states and logic inside component (before activeTab)
const logic = `
  const isOwner = user?.uid === trip.userId;
  const isCollaborator = trip.collaborators?.includes(user?.email || '');
  const hasEditAccess = isOwner || isCollaborator;
  const isTemplateViewOnly = !hasEditAccess && trip.isTemplate;

  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDest, setEditDest] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editTravelers, setEditTravelers] = useState(1);
  const [editBudget, setEditBudget] = useState(0);

  const openEditTripModal = () => {
    setEditName(trip.name);
    setEditDest(trip.destination);
    setEditStart(trip.startDate);
    setEditEnd(trip.endDate);
    setEditTravelers(trip.travelersCount || 1);
    setEditBudget(trip.budget || 0);
    setIsEditTripModalOpen(true);
  };

  const handleEditTripSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEditAccess) return;
    try {
      await updateTrip(trip.id, {
        name: editName,
        destination: editDest,
        startDate: editStart,
        endDate: editEnd,
        travelersCount: editTravelers,
        budget: editBudget
      });
      setIsEditTripModalOpen(false);
      setToastMessage('✓ Detail trip berhasil diperbarui!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan perubahan.');
    }
  };

  // Import Template Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importName, setImportName] = useState('');
  const [importStartDate, setImportStartDate] = useState('');
  const [importEndDate, setImportEndDate] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const openImportModal = () => {
    setImportName(\`\${trip.name} (Salin)\`);
    setImportStartDate(trip.startDate);
    setImportEndDate(trip.endDate);
    setIsImportModalOpen(true);
  };

  const handleStartDateChange = (newStart: string) => {
    setImportStartDate(newStart);
    if (trip.startDate && trip.endDate) {
      const oldStart = new Date(trip.startDate);
      const oldEnd = new Date(trip.endDate);
      const diffMs = oldEnd.getTime() - oldStart.getTime();
      
      const newStartObj = new Date(newStart);
      const newEndObj = new Date(newStartObj.getTime() + diffMs);
      setImportEndDate(newEndObj.toISOString().split('T')[0]);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    try {
      const newId = await duplicateTrip(trip.id, importName, importStartDate, importEndDate);
      setToastMessage('✓ Template berhasil diimpor! Silakan kembali ke Dashboard.');
      setIsImportModalOpen(false);
      setTimeout(() => {
        setToastMessage(null);
        onBackToDashboard();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengimpor template: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsImporting(false);
    }
  };
`;

file = file.replace(
  "const [activeTab, setActiveTab] = useState<'Overview'",
  logic + "\n  const [activeTab, setActiveTab] = useState<'Overview'"
);

// 4. Update Header Buttons
const oldButtons = `          <button
            onClick={() => setIsShareModalOpen(true)}
            className="bg-white hover:bg-soft-pink text-primary-pink px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Kolaborasi</span>
            {trip.collaborators && trip.collaborators.length > 0 && (
              <span className="bg-primary-pink text-white text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5">
                {trip.collaborators.length}
              </span>
            )}
          </button>

          <button
            onClick={handleDuplicate}
            className="bg-white hover:bg-soft-pink text-primary-pink px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Copy className="w-4 h-4" />
            <span>Duplikat</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-primary-gradient text-white px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-white hover:bg-red-50 text-red-500 px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>`;

const newButtons = `          {isTemplateViewOnly ? (
            <button
              onClick={openImportModal}
              className="bg-primary-gradient text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>Gunakan Template Ini</span>
            </button>
          ) : (
            <>
              {hasEditAccess && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-white hover:bg-soft-pink text-primary-pink px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kolaborasi</span>
                  {trip.collaborators && trip.collaborators.length > 0 && (
                    <span className="bg-primary-pink text-white text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5">
                      {trip.collaborators.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleDuplicate}
                className="bg-white hover:bg-soft-pink text-primary-pink px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Duplikat</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-primary-gradient text-white px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF</span>
              </button>

              {isOwner && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-white hover:bg-red-50 text-red-500 px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              )}
            </>
          )}`;

file = file.replace(oldButtons, newButtons);

// 5. Title & Edit Button
const oldTitle = `<h1 className="text-2xl md:text-4xl font-black tracking-tight">{trip.name}</h1>`;
const newTitle = `<h1 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            {trip.name}
            {hasEditAccess && (
              <button onClick={openEditTripModal} className="text-white hover:text-primary-pink transition-colors bg-white/20 hover:bg-white p-2 rounded-full backdrop-blur-sm shadow-sm" title="Edit Trip Details">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </h1>`;
file = file.replace(oldTitle, newTitle);

// 6. Cover photo edit button (only if hasEditAccess)
file = file.replace(
  `        <button 
          onClick={() => { setIsEditingCover(true); setNewCoverUrl(trip.coverImage); }}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all shadow-md border border-white/30"
        >`,
  `        {hasEditAccess && (
          <button 
            onClick={() => { setIsEditingCover(true); setNewCoverUrl(trip.coverImage); }}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all shadow-md border border-white/30"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        )}`
);

// We need to remove the extra closing tag from the previous replace
file = file.replace(
  `            <Edit3 className="w-5 h-5" />
        </button>
`,
  `            <Edit3 className="w-5 h-5" />
          </button>
`
);
// Wait, the replace string for Cover edit was exact, I should be careful. I will write exact replace:
// See the block:

// Let's add modals at the bottom of the component.
const modals = `
      {/* Edit Trip Modal */}
      {isEditTripModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-[#1E293B]">
                Edit Detail Trip
              </h3>
              <button 
                onClick={() => setIsEditTripModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditTripSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Nama Trip</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Destinasi</label>
                <input
                  type="text"
                  required
                  value={editDest}
                  onChange={(e) => setEditDest(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    min={editStart}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editTravelers}
                    onChange={(e) => setEditTravelers(parseInt(e.target.value))}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Total Budget</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editBudget}
                    onChange={(e) => setEditBudget(parseInt(e.target.value))}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary-gradient text-white rounded-xl py-3 text-sm font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Template Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-[#1E293B]">
                Gunakan Template Ini
              </h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Nama Trip Baru</label>
                <input
                  type="text"
                  required
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={importStartDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={importEndDate}
                    onChange={(e) => setImportEndDate(e.target.value)}
                    min={importStartDate}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isImporting}
                  className="w-full bg-primary-gradient text-white rounded-xl py-3 text-sm font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isImporting ? 'Menyalin Template...' : 'Gunakan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

file = file.replace(
  "{/* Delete Confirmation Modal */}",
  modals + "\n\n      {/* Delete Confirmation Modal */}"
);

fs.writeFileSync('src/components/TripWorkspaceView.tsx', file);
