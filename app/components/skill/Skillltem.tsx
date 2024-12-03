'use client'

import Link from 'next/link'

interface SkillItemProps {
  skillId: number
  name: string
  level: number
  progress: number
  experience: number
  description: number
}

export default function SkillItem({ skill }: SkillItemProps) {
  return (
    <Link href={`/skill/${skill.id}`} className="block">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
        {/* Skill Name */}
        <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>

        {/* Skill Description */}
        <p className="text-gray-600 mb-4 text-sm">{skill.description}</p>

        {/* Skill Level and Progress */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Level {skill.level}</span>
          <span className="text-gray-600">{skill.progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${skill.progress}%` }}
          ></div>
        </div>

        {/* Experience and Icon */}
        <div className="flex items-center text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{skill.experience} XP</span>
        </div>
      </div>
    </Link>
  );
}

