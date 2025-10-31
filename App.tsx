import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DistrictSelector } from './components/DistrictSelector';
import { Dashboard } from './components/Dashboard';
import { Loader } from './components/Loader';
import { getDistricts, getDistrictData, getAllDistrictsLatestData } from './services/mgnregaService';
import { getDistrictFromCoords } from './services/geminiService';
import { useGeolocation } from './hooks/useGeolocation';
import type { PerformanceData, YearlyData } from './types';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { UsersIcon, LocationIcon } from './components/Icons';
import { Modal } from './components/Modal';
import { DataResourceCard } from './components/DataResourceCard';


function App() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [allDistrictsData, setAllDistrictsData] = useState<{name: string, data: YearlyData}[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<string>('');
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [geolocationTriggered, setGeolocationTriggered] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  const geolocation = useGeolocation(geolocationTriggered);

  useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const districtList = await getDistricts();
            setDistricts(districtList);
            const allData = await getAllDistrictsLatestData();
            setAllDistrictsData(allData);
        } catch (err) {
            setError("Failed to load initial application data.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (!geolocationTriggered) {
        setGeolocationStatus('');
        return;
    }
    if (geolocation.loading) {
      setGeolocationStatus('Detecting your location...');
      return;
    }
    if (geolocation.error) {
      setGeolocationStatus(`Location detection failed: ${geolocation.error.message}`);
      return;
    }
    if (geolocation.data && districts.length > 0 && !selectedDistrict) {
        setGeolocationStatus('Location detected. Identifying district...');
        const findDistrict = async () => {
            const detectedDistrict = await getDistrictFromCoords(geolocation.data!, districts);
            if (detectedDistrict && districts.includes(detectedDistrict)) {
                setSelectedDistrict(detectedDistrict);
                setGeolocationStatus(`Your district appears to be ${detectedDistrict}.`);
            } else {
                setGeolocationStatus('Could not automatically identify your district.');
            }
        };
        findDistrict();
    }
  }, [geolocation.loading, geolocation.data, geolocation.error, districts, selectedDistrict, geolocationTriggered]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchData = async () => {
        setIsDataLoading(true);
        setError(null);
        setPerformanceData(null);
        try {
          const data = await getDistrictData(selectedDistrict);
          if (data) {
            setPerformanceData(data);
          } else {
            setError(`No data found for ${selectedDistrict}.`);
          }
        } catch (err) {
          setError("Failed to fetch district data.");
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    } else {
      setPerformanceData(null);
    }
  }, [selectedDistrict]);

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

  const renderDashboardContent = () => {
    if (isDataLoading) {
        return <DashboardSkeleton />;
    }
    if (error && selectedDistrict) {
        return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }
    if (performanceData) {
        return <Dashboard performanceData={performanceData} allDistrictsData={allDistrictsData} language={language} />;
    }
    if (!selectedDistrict) {
      return (
        <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow-md flex flex-col items-center animate-fade-in">
          <UsersIcon className="h-16 w-16 text-brand-blue mb-4" />
          <h2 className="text-2xl font-bold text-brand-blue mb-2">MGNREGA प्रदर्शन देखें</h2>
          <p>अपने जिले का प्रदर्शन देखने के लिए, ऊपर दिए गए ड्रॉपडाउन से अपना जिला चुनें।</p>
          <p className="text-sm mt-2">(To see your district's performance, select it from the dropdown above.)</p>
          <div className="my-4 text-gray-400">OR</div>
          <button
            onClick={() => setGeolocationTriggered(true)}
            disabled={geolocationTriggered}
            className="flex items-center gap-2 px-6 py-3 bg-white text-brand-blue font-semibold rounded-full border-2 border-brand-blue shadow-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
             <LocationIcon className="h-5 w-5" />
             Use My Location
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-brand-light-gray font-sans">
      <Header 
        onOpenResources={() => setIsResourceModalOpen(true)} 
        language={language}
        setLanguage={setLanguage}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <DistrictSelector
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={handleDistrictChange}
          geolocationStatus={geolocationStatus}
        />
        
        {isLoading && <div className="flex justify-center items-center h-64 mt-6"><Loader /></div>}

        {!isLoading && (
            <div className="mt-6">
                {renderDashboardContent()}
            </div>
        )}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Data is illustrative. Not for official use.</p>
      </footer>
      
      {isResourceModalOpen && (
        <Modal onClose={() => setIsResourceModalOpen(false)}>
            <DataResourceCard 
                performanceData={performanceData}
                setSelectedDistrict={setSelectedDistrict}
                closeModal={() => setIsResourceModalOpen(false)}
            />
        </Modal>
      )}
    </div>
  );
}

export default App;
