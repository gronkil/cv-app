import { FileText } from 'lucide-react'
import { useCvStore } from '../../store/cvStore'
import { EditableField } from '../editor/EditableField'
import { CvSection } from './CvSection'

export function CvSummary() {
  const { cv, isEditMode, updatePersonal } = useCvStore()

  return (
    <CvSection title="O mnie" icon={<FileText size={16} />} delay={0.1}>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <EditableField
          value={cv.personal.summary}
          onChange={(v) => updatePersonal('summary', v)}
          isEditing={isEditMode}
          multiline
          placeholder="Opisz siebie..."
          className="text-gray-600 leading-relaxed text-sm"
        />
      </div>
    </CvSection>
  )
}
