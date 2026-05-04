import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCvStore } from '../../store/cvStore'
import { EditableField } from '../editor/EditableField'
import { CvSection } from './CvSection'

export function CvEducation() {
  const { cv, isEditMode, addEducation, updateEducation, removeEducation } = useCvStore()

  return (
    <CvSection title="Wykształcenie" icon={<GraduationCap size={16} />} delay={0.3}>
      {isEditMode && (
        <button
          onClick={addEducation}
          className="mb-4 flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#b8973e] font-medium transition-colors"
        >
          <Plus size={15} /> Dodaj wykształcenie
        </button>
      )}
      <div className="space-y-4">
        <AnimatePresence>
          {cv.education.map((edu) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative"
            >
              {isEditMode && (
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                <div className="flex-1">
                  <EditableField
                    value={edu.school}
                    onChange={(v) => updateEducation(edu.id, 'school', v)}
                    isEditing={isEditMode}
                    placeholder="Uczelnia"
                    className="font-semibold text-[#1C2333] text-base block"
                  />
                  <div className="flex gap-1 mt-0.5">
                    <EditableField
                      value={edu.degree}
                      onChange={(v) => updateEducation(edu.id, 'degree', v)}
                      isEditing={isEditMode}
                      placeholder="Stopień"
                      className="text-[#C9A84C] font-medium text-sm"
                    />
                    {!isEditMode && edu.field && <span className="text-gray-400 text-sm">·</span>}
                    <EditableField
                      value={edu.field}
                      onChange={(v) => updateEducation(edu.id, 'field', v)}
                      isEditing={isEditMode}
                      placeholder="Kierunek"
                      className="text-gray-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-1 text-xs text-gray-400 items-center flex-shrink-0">
                  <EditableField
                    value={edu.startDate}
                    onChange={(v) => updateEducation(edu.id, 'startDate', v)}
                    isEditing={isEditMode}
                    placeholder="2015"
                    className="text-xs text-gray-400"
                  />
                  {!isEditMode && <span>–</span>}
                  <EditableField
                    value={edu.endDate}
                    onChange={(v) => updateEducation(edu.id, 'endDate', v)}
                    isEditing={isEditMode}
                    placeholder="2020"
                    className="text-xs text-gray-400"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CvSection>
  )
}
