import { Globe, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCvStore } from '../../store/cvStore'
import { EditableField } from '../editor/EditableField'
import { CvSection } from './CvSection'

export function CvLanguages() {
  const { cv, isEditMode, addLanguage, updateLanguage, removeLanguage } = useCvStore()

  return (
    <CvSection title="Języki" icon={<Globe size={16} />} delay={0.5}>
      {isEditMode && (
        <button
          onClick={addLanguage}
          className="mb-4 flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#b8973e] font-medium transition-colors"
        >
          <Plus size={15} /> Dodaj język
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AnimatePresence>
          {cv.languages.map((lang) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 relative"
            >
              {isEditMode && (
                <button
                  onClick={() => removeLanguage(lang.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <EditableField
                value={lang.language}
                onChange={(v) => updateLanguage(lang.id, 'language', v)}
                isEditing={isEditMode}
                placeholder="Język"
                className="font-semibold text-[#1C2333] text-sm block"
              />
              <EditableField
                value={lang.level}
                onChange={(v) => updateLanguage(lang.id, 'level', v)}
                isEditing={isEditMode}
                placeholder="Poziom (np. C1)"
                className="text-[#C9A84C] text-xs mt-0.5 block"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CvSection>
  )
}
