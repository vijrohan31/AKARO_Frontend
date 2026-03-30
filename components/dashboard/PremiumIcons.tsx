import React from 'react';
import { Shield, Building2, Plus } from 'lucide-react';

export const ShieldPlusIcon = ({ className = "size-5" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <Shield className="size-full text-white/40" strokeWidth={1.5} />
    <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-white rounded-full flex items-center justify-center shadow-sm">
      <Plus className="size-2 text-blue-600" strokeWidth={4} />
    </div>
  </div>
);

export const BuildingPlusIcon = ({ className = "size-5" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <Building2 className="size-full text-white/40" strokeWidth={1.5} />
    <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-white rounded-full flex items-center justify-center shadow-sm">
      <Plus className="size-2 text-blue-600" strokeWidth={4} />
    </div>
  </div>
);
