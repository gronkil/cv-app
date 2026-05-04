import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCvStore } from '../../store/cvStore'
import { EditableField } from '../editor/EditableField'
import { CvSection } from './CvSection'

export function CvExperience() {
  const { cv, isEditMode, addExperience, updateExperience, removeExperience } = useCvStore()

  return (
    <CvSection title="Doświadczenie" icon={<Briefcase size={16} />} delay={0.2}>
      {isEditMode && (
        <button
          onClick={addExperience}
          className="mb-4 flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#b8973e] font-medium transition-colors"
        >
          <Plus size={15} /> Dodaj doświadczenie
        </button>
      )}
      <div className="space-y-4">
        <AnimatePresence>
          {cv.experience.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative group"
            >
              {isEditMode && (
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                <div className="flex-1">
                  <EditableField
                    value={exp.role}
                    onChange={(v) => updateExperience(exp.id, 'role', v)}
                    isEditing={isEditMode}
                    placeholder="Stanowisko"
                    className="font-semibold text-[#1C2333] text-base block"
                  />
                  <EditableField
                    value={exp.company}
                    onChange={(v) => updateExperience(exp.id, 'company', v)}
                    isEditing={isEditMode}
                    placeholder="Firma"
                    className="text-[#C9A84C] font-medium text-sm block mt-0.5"
                  />
                </div>
                <div className="flex gap-1 text-xs text-gray-400 items-center flex-shrink-0">
                  <EditableField
                    value={exp.startDate}
                    onChange={(v) => updateExperience(exp.id, 'startDate', v)}
                    isEditing={isEditMode}
                    placeholder="np. 2020-01"
                    className="text-xs text-gray-400"
                  />
                  {!isEditMode && <span>–</span>}
                  <EditableField
                    value={exp.endDate}
                    onChange={(v) => updateExperience(exp.id, 'endDate', v)}
                    isEditing={isEditMode}
                    placeholder="obecnie"
                    className="text-xs text-gray-400"
                  />
                </div>
              </div>
              <EditableField
                value={exp.description}
                onChange={(v) => updateExperience(exp.id, 'description', v)}
                isEditing={isEditMode}
                multiline
                placeholder="Opisz swoje obowiązki i osiągnięcia..."
                className="text-gray-500 text-sm leading-relaxed mt-2 block"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CvSection>
  )
}
