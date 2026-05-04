import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Check, Download, RotateCcw } from 'lucide-react'
import { useCvStore } from '../../store/cvStore'
import { usePdfExport } from '../../hooks/usePdfExport'
import { toast } from 'sonner'

export function EditToolbar() {
  const { isEditMode, toggleEditMode, resetCv } = useCvStore()
  const { exportPdf } = usePdfExport()

  const handleToggle = () => {
    toggleEditMode()
    if (isEditMode) toast.success('Zmiany zapisane')
  }

  const handleExport = async () => {
    toast.promise(exportPdf(), {
      loading: 'Generowanie PDF...',
      success: 'PDF pobrany!',
      error: 'Błąd eksportu',
    })
  }

  const handleReset = () => {
    if (confirm('Zresetować CV do domyślnych danych?')) {
      resetCv()
      toast.info('CV zresetowane')
    }
  }

  return (
    <div className="no-print fixed top-6 right-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {isEditMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 shadow-lg transition-all text-sm font-medium"
          >
            <RotateCcw size={15} />
            Reset
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur border border-gray-200 text-[#1C2333] hover:border-[#C9A84C] shadow-lg transition-all text-sm font-medium"
      >
        <Download size={15} />
        PDF
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleToggle}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all text-sm font-semibold ${
          isEditMode
            ? 'bg-[#C9A84C] text-white hover:bg-[#b8973e]'
            : 'bg-[#1C2333] text-white hover:bg-[#2a3347]'
        }`}
      >
        {isEditMode ? <><Check size={15} /> Zapisz</> : <><Pencil size={15} /> Edytuj CV</>}
      </motion.button>
    </div>
  )
}
