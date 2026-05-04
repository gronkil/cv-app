import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Linkedin, Github, User } from 'lucide-react'
import { useCvStore } from '../../store/cvStore'
import { EditableField } from '../editor/EditableField'

export function CvHeader() {
  const { cv, isEditMode, updatePersonal } = useCvStore()
  const { personal } = cv

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1C2333] text-white rounded-2xl p-8 mb-6"
    >
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-[#C9A84C]/20 border-2 border-[#C9A84C]/40 flex items-center justify-center overflow-hidden">
            {personal.avatarUrl ? (
              <img src={personal.avatarUrl} alt={personal.name} className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-[#C9A84C]/60" />
            )}
          </div>
          {isEditMode && (
            <div className="mt-2">
              <EditableField
                value={personal.avatarUrl}
                onChange={(v) => updatePersonal('avatarUrl', v)}
                isEditing={true}
                placeholder="URL zdjęcia"
                className="text-xs text-[#1C2333] w-full"
              />
            </div>
          )}
        </div>

        {/* Name & Title */}
        <div className="flex-1">
          <EditableField
            value={personal.name}
            onChange={(v) => updatePersonal('name', v)}
            isEditing={isEditMode}
            placeholder="Imię i Nazwisko"
            className="text-3xl md:text-4xl font-bold text-white tracking-tight block mb-1"
          />
          <EditableField
            value={personal.title}
            onChange={(v) => updatePersonal('title', v)}
            isEditing={isEditMode}
            placeholder="Stanowisko"
            className="text-[#C9A84C] text-lg font-medium block"
          />
        </div>
      </div>

      {/* Contact row */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4">
        <ContactItem icon={<Mail size={14} />} isEditing={isEditMode} value={personal.email}
          onChange={(v) => updatePersonal('email', v)} placeholder="email@example.com" href={`mailto:${personal.email}`} />
        <ContactItem icon={<Phone size={14} />} isEditing={isEditMode} value={personal.phone}
          onChange={(v) => updatePersonal('phone', v)} placeholder="+48 000 000 000" />
        <ContactItem icon={<MapPin size={14} />} isEditing={isEditMode} value={personal.location}
          onChange={(v) => updatePersonal('location', v)} placeholder="Miasto, Kraj" />
      </div>

      {/* Social links */}
      <div className="mt-4 flex flex-wrap gap-3">
        <SocialLink
          icon={<Linkedin size={15} />}
          label="LinkedIn"
          value={personal.linkedin}
          isEditing={isEditMode}
          onChange={(v) => updatePersonal('linkedin', v)}
          placeholder="https://linkedin.com/in/profil"
        />
        <SocialLink
          icon={<Github size={15} />}
          label="GitHub"
          value={personal.github}
          isEditing={isEditMode}
          onChange={(v) => updatePersonal('github', v)}
          placeholder="https://github.com/profil"
        />
      </div>
    </motion.div>
  )
}

function ContactItem({ icon, value, onChange, isEditing, placeholder, href }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void
  isEditing: boolean; placeholder: string; href?: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <span className="text-[#C9A84C]">{icon}</span>
      {isEditing ? (
        <EditableField value={value} onChange={onChange} isEditing={true}
          placeholder={placeholder} className="text-white/90 text-sm" />
      ) : href ? (
        <a href={href} className="hover:text-white transition-colors">{value}</a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  )
}

function SocialLink({ icon, label, value, isEditing, onChange, placeholder }: {
  icon: React.ReactNode; label: string; value: string
  isEditing: boolean; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10 min-w-64">
          <span className="text-[#C9A84C] flex-shrink-0">{icon}</span>
          <span className="text-white/50 text-xs flex-shrink-0">{label}:</span>
          <EditableField value={value} onChange={onChange} isEditing={true}
            placeholder={placeholder} className="text-white/90 text-sm flex-1" />
        </div>
      ) : value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/5 hover:bg-[#C9A84C]/10 border border-white/10 hover:border-[#C9A84C]/40 rounded-lg px-4 py-2 text-sm text-white/80 hover:text-white transition-all group"
        >
          <span className="text-[#C9A84C] group-hover:scale-110 transition-transform">{icon}</span>
          {label}
        </a>
      ) : null}
    </div>
  )
}
