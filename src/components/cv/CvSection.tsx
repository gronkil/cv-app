import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  title: string
  icon?: ReactNode
  children: ReactNode
  delay?: number
}

export function CvSection({ title, icon, children, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-[#C9A84C]">{icon}</span>}
        <h2 className="text-[#1C2333] text-lg font-bold tracking-wide uppercase text-sm">
          {title}
        </h2>
        <div className="flex-1 h-px bg-[#C9A84C]/30" />
      </div>
      {children}
    </motion.div>
  )
}
