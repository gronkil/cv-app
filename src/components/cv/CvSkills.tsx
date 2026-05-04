import { Zap, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCvStore } from '../../store/cvStore'
import { EditableField } from '../editor/EditableField'
import { CvSection } from './CvSection'

const LEVEL_LABELS = ['', 'Podstawowy', 'Średni', 'Dobry', 'Zaawansowany', 'Ekspert']

export function CvSkills() {
  const { cv, isEditMode, addSkill, updateSkill, removeSkill } = useCvStore()

  return (
    <CvSection title="Umiejętności" icon={<Zap size={16} />} delay={0.4}>
      {isEditMode && (
        <button
          onClick={addSkill}
          className="mb-4 flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#b8973e] font-medium transition-colors"
        >
          <Plus size={15} /> Dodaj umiejętność
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence>
          {cv.skills.map((skill) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 relative"
            >
              {isEditMode && (
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
              <div className="flex items-center justify-between mb-2 pr-4">
                <EditableField
                  value={skill.name}
                  onChange={(v) => updateSkill(skill.id, 'name', v)}
                  isEditing={isEditMode}
                  placeholder="Umiejętność"
                  className="font-medium text-[#1C2333] text-sm"
                />
                <span className="text-xs text-gray-400">{LEVEL_LABELS[skill.level]}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <button
                    key={l}
                    disabled={!isEditMode}
                    onClick={() => isEditMode && updateSkill(skill.id, 'level', l)}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      l <= skill.level ? 'bg-[#C9A84C]' : 'bg-gray-200'
                    } ${isEditMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CvSection>
  )
}
