
import React from 'react';
import { LocationIcon, SearchIcon } from './Icons';

interface DistrictSelectorProps {
  districts: string[];
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  geolocationStatus: string;
}

export const DistrictSelector: React.FC<DistrictSelectorProps> = React.memo(({
  districts,
  selectedDistrict,
  onDistrictChange,
  geolocationStatus,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <label htmlFor="district-select" className="block text-lg font-semibold text-brand-dark-gray mb-2">
        अपना जिला चुनें (Select your District)
      </label>
      <div className="relative">
        <select
          id="district-select"
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="block w-full bg-gray-50 border border-gray-300 text-brand-dark-gray text-base rounded-lg focus:ring-brand-blue focus:border-brand-blue p-3 appearance-none"
          aria-label="Select your district"
        >
          <option value="">-- जिला चुनें --</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {geolocationStatus && (
        <div className="flex items-center text-sm text-brand-green mt-3 p-2 bg-green-50 rounded-md">
            {geolocationStatus.includes('Detecting') || geolocationStatus.includes('Identifying') ? <SearchIcon className="h-5 w-5 mr-2 animate-pulse" /> : <LocationIcon className="h-5 w-5 mr-2" />}
            <p>{geolocationStatus}</p>
        </div>
      )}
    </div>
  );
});
