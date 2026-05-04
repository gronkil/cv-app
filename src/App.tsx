import { Toaster } from 'sonner'
import { EditToolbar } from './components/editor/EditToolbar'
import { CvHeader } from './components/cv/CvHeader'
import { CvSummary } from './components/cv/CvSummary'
import { CvExperience } from './components/cv/CvExperience'
import { CvEducation } from './components/cv/CvEducation'
import { CvSkills } from './components/cv/CvSkills'
import { CvLanguages } from './components/cv/CvLanguages'

function App() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] py-10 px-4">
      <Toaster position="top-right" richColors />
      <EditToolbar />

      <div id="cv-document" className="max-w-3xl mx-auto">
        <CvHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-0">
            <CvSummary />
            <CvExperience />
            <CvEducation />
          </div>
          <div className="space-y-0">
            <CvSkills />
            <CvLanguages />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
