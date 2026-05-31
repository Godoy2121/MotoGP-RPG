import { useState } from 'react';

interface RiderAvatarProps {
  photoUrl?: string;
  name: string;
  number: number;
  teamColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
};

export function RiderAvatar({ photoUrl, name, number, teamColor = '#E40317', size = 'md', className = '' }: RiderAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={`${SIZES[size]} rounded-full overflow-hidden flex-shrink-0 relative ${className}`}
      style={{ border: `2px solid ${teamColor}20` }}>
      {photoUrl && !failed ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center font-orbitron font-black"
          style={{ backgroundColor: `${teamColor}20`, color: teamColor }}
        >
          <span className="leading-none">{initials}</span>
          <span className="text-xs opacity-60 leading-none">#{number}</span>
        </div>
      )}
    </div>
  );
}
