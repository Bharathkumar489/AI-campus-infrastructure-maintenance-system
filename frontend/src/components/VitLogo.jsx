import React from 'react';
import vitLogoImg from '../assets/vit_logo.png';

export function VitLogo({ className = "h-9", showText = true, textColor = "text-white" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official VIT Seal from reference image */}
      <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm border border-white/50 flex items-center justify-center shrink-0 overflow-hidden">
        <img 
          src={vitLogoImg} 
          alt="VIT-AP University Emblem" 
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span className={`text-base font-extrabold tracking-wider ${textColor} font-serif uppercase`}>
            VIT-AP
          </span>
          <span className={`text-[9px] font-bold tracking-[0.25em] ${textColor} opacity-90 uppercase`}>
            UNIVERSITY
          </span>
        </div>
      )}
    </div>
  );
}
