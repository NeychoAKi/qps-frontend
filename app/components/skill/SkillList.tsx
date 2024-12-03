'use client'

import { useSelector } from 'react-redux'
import SkillItem from './Skillltem'
import { RootState } from '@/app/store'

export default function SkillList() {
  const { skillList } = useSelector((state: RootState) => state.skill)
  
  return (
    <div className="space-y-6">
      {skillList.length === 0 ? (
        <p className="text-gray-600">You haven&apos;t generated any skills yet.  Use the "Generate Skill" tab to create your first skill!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillList.map(skill => (
            <SkillItem key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}

