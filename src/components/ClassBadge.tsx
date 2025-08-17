type Props = { className: string }

const classConfig: Record<string, { gradient: string; border: string; icon: string }> = {
  Fighter: { 
    gradient: 'from-red-600 to-red-800', 
    border: 'border-red-500',
    icon: '⚔️'
  },
  Assassin: { 
    gradient: 'from-purple-600 to-purple-800', 
    border: 'border-purple-500',
    icon: '🗡️'
  },
  'Healer/Mage': { 
    gradient: 'from-green-600 to-green-800', 
    border: 'border-green-500',
    icon: '✨'
  },
  Tank: { 
    gradient: 'from-blue-600 to-blue-800', 
    border: 'border-blue-500',
    icon: '🛡️'
  },
  Ranger: { 
    gradient: 'from-yellow-600 to-yellow-800', 
    border: 'border-yellow-500',
    icon: '🏹'
  }
}

export function ClassBadge({ className }: Props) {
  const config = classConfig[className] ?? { 
    gradient: 'from-gray-600 to-gray-800', 
    border: 'border-gray-500',
    icon: '❓'
  }
  
  return (
    <div className="relative inline-flex">
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} blur-lg opacity-50`} />
      <div className={`relative flex items-center gap-2 px-4 py-2 bg-black/80 border-2 ${config.border} rounded-lg`}>
        <span className="text-xl">{config.icon}</span>
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-60">Class</div>
          <div className="text-sm font-bold title-font uppercase">{className}</div>
        </div>
      </div>
    </div>
  )
}


