import React from 'react';

export function AILogo({ 
  size = 'md', 
  variant = 'full', 
  showText = true, 
  theme = 'light',
  className = '' 
}) {
  const iconSizes = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg'
  };

  const svgDimensions = {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32
  };

  const currentIconSize = iconSizes[size] || iconSizes.md;
  const currentDim = svgDimensions[size] || svgDimensions.md;

  const renderIcon = () => (
    <div className={`relative flex items-center justify-center shrink-0 ${currentIconSize} rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-md shadow-blue-500/25 group`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-xl blur-[2px] opacity-40 group-hover:opacity-75 transition duration-300"></div>
      
      <div className="relative w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6px_6px] opacity-40"></div>
        
        <svg 
          width={currentDim} 
          height={currentDim} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse"
        >
          <circle cx="12" cy="12" r="3.5" fill="url(#ai-grad)" />
          <path d="M12 2V5.5M12 18.5V22M2 12H5.5M18.5 12H22" stroke="#38bdf8" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4.93 4.93L7.4 7.4M16.6 16.6L19.07 19.07M4.93 19.07L7.4 16.6M16.6 7.4L19.07 4.93" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
          
          <defs>
            <linearGradient id="ai-grad" x1="8.5" y1="8.5" x2="15.5" y2="15.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_4px_#38bdf8]"></span>
      </div>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-xs ${
        theme === 'dark'
          ? 'bg-slate-900/90 text-white border-indigo-500/40' 
          : 'bg-white/15 text-white border-white/25 backdrop-blur-xs'
      } ${className}`}>
        {renderIcon()}
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          CampusCare <span className="text-amber-400">AI</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {renderIcon()}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-2xl' : 'text-sm sm:text-base'} ${
              theme === 'dark' ? 'text-slate-900' : 'text-white'
            }`}>
              CampusCare <span className="text-amber-400">AI</span>
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded tracking-wider ${
              theme === 'dark' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-white/20 text-blue-100 border border-white/30'
            }`}>
              TELEMETRY
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-wide ${
            theme === 'dark' ? 'text-slate-500' : 'text-blue-100/80'
          }`}>
            Intelligent Infrastructure Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

export default AILogo;
