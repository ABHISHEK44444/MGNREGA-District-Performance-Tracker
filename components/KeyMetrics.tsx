import React, { useState } from 'react';
import type { PerformanceData } from '../types';
import { DataCard } from './DataCard';
import { UsersIcon, BriefcaseIcon, CalendarIcon, RupeeIcon } from './Icons';
import { MetricExplainerModal } from './MetricExplainerModal';

interface KeyMetricsProps {
  performanceData: PerformanceData;
  language: 'en' | 'hi';
}

type MetricKey = 'households' | 'personDays' | 'avgDays' | 'expenditure';
type MetricContent = { title: string, definition: string, importance: string, interpretation: string };
type MetricExplanations = Record<MetricKey, { en: MetricContent, hi: MetricContent }>;

const metricExplanations: MetricExplanations = {
    households: {
        en: {
            title: "Households Provided Employment",
            definition: "This is the total number of unique families (households) that were given any amount of work under the MGNREGA scheme during the year.",
            importance: "It shows the scheme's reach. A higher number means more families are benefiting from the employment guarantee.",
            interpretation: "A high value is generally good, indicating wide coverage. A low value might mean fewer families need work or there are issues in providing it."
        },
        hi: {
            title: "रोजगार पाने वाले परिवार",
            definition: "यह उन अनूठे परिवारों (घरों) की कुल संख्या है जिन्हें वर्ष के दौरान मनरेगा योजना के तहत कोई भी काम दिया गया था।",
            importance: "यह योजना की पहुंच को दर्शाता है। एक उच्च संख्या का मतलब है कि अधिक परिवार रोजगार गारंटी से लाभान्वित हो रहे हैं।",
            interpretation: "एक उच्च मान आम तौर पर अच्छा होता है, जो व्यापक कवरेज को दर्शाता है। एक कम मान का मतलब यह हो सकता है कि कम परिवारों को काम की आवश्यकता है या इसे प्रदान करने में समस्याएं हैं।"
        }
    },
    personDays: {
        en: {
            title: "Person-Days Generated",
            definition: "This is the total number of days of work provided. If 10 people work for 5 days, that's 50 person-days.",
            importance: "This measures the total volume of employment created. It's a key indicator of the scheme's scale and impact on the local economy.",
            interpretation: "Higher is better, as it reflects more work being done and more wages being paid out in the community."
        },
        hi: {
            title: "कुल काम के दिन (व्यक्ति-दिवस)",
            definition: "यह प्रदान किए गए काम के दिनों की कुल संख्या है। यदि 10 लोग 5 दिनों तक काम करते हैं, तो यह 50 व्यक्ति-दिवस है।",
            importance: "यह बनाए गए रोजगार की कुल मात्रा को मापता है। यह योजना के पैमाने और स्थानीय अर्थव्यवस्था पर इसके प्रभाव का एक प्रमुख संकेतक है।",
            interpretation: "उच्चतर बेहतर है, क्योंकि यह समुदाय में अधिक काम किए जाने और अधिक मजदूरी का भुगतान किए जाने को दर्शाता है।"
        }
    },
    avgDays: {
        en: {
            title: "Average Days of Employment",
            definition: "This is the total person-days generated divided by the number of households employed. MGNREGA guarantees up to 100 days per household.",
            importance: "This shows how close the district is to fulfilling the 100-day promise for each family. It measures the depth of employment.",
            interpretation: "A value closer to 100 is ideal. It means families are getting sustained work, not just a few days here and there."
        },
        hi: {
            title: "प्रति परिवार औसत काम",
            definition: "यह कुल व्यक्ति-दिवस को नियोजित परिवारों की संख्या से विभाजित करके प्राप्त किया जाता है। मनरेगा प्रति परिवार 100 दिनों तक की गारंटी देता है।",
            importance: "यह दर्शाता है कि जिला प्रत्येक परिवार के लिए 100-दिन के वादे को पूरा करने के कितने करीब है। यह रोजगार की गहराई को मापता है।",
            interpretation: "100 के करीब का मान आदर्श है। इसका मतलब है कि परिवारों को कुछ दिनों के बजाय निरंतर काम मिल रहा है।"
        }
    },
    expenditure: {
        en: {
            title: "Total Expenditure",
            definition: "This is the total money spent on the scheme, which includes wages for workers and the cost of materials for the projects.",
            importance: "This shows the financial scale of the program and the amount of money being injected into the rural economy.",
            interpretation: "Higher expenditure usually correlates with more work being done. It's important to see this in relation to the work generated (person-days)."
        },
        hi: {
            title: "कुल खर्च",
            definition: "यह योजना पर खर्च किया गया कुल धन है, जिसमें श्रमिकों के लिए मजदूरी और परियोजनाओं के लिए सामग्री की लागत शामिल है।",
            importance: "यह कार्यक्रम के वित्तीय पैमाने और ग्रामीण अर्थव्यवस्था में डाली जा रही धनराशि को दर्शाता है।",
            interpretation: "उच्च व्यय आमतौर पर अधिक काम किए जाने से संबंधित होता है। इसे उत्पन्न काम (व्यक्ति-दिवस) के संबंध में देखना महत्वपूर्ण है।"
        }
    }
};

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ performanceData, language }) => {
  const { district: districtData, stateAverage } = performanceData;
  const latestData = districtData.data[districtData.data.length - 1];
  const latestAverage = stateAverage.find(d => d.year === latestData.year);
  
  const [modalContentKey, setModalContentKey] = useState<MetricKey | null>(null);

  const handleInfoClick = (metric: MetricKey) => {
    setModalContentKey(metric);
  };

  const modalContent = modalContentKey ? metricExplanations[modalContentKey] : null;

  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataCard 
            icon={<UsersIcon className="h-6 w-6 text-white"/>} 
            title="रोजगार पाने वाले परिवार" 
            value={latestData.householdsProvidedEmployment.toLocaleString('en-IN')}
            numericValue={latestData.householdsProvidedEmployment}
            unit="Families"
            color="bg-blue-500"
            comparisonValue={latestAverage?.householdsProvidedEmployment}
            onInfoClick={() => handleInfoClick('households')}
            language={language}
        />
        <DataCard 
            icon={<BriefcaseIcon className="h-6 w-6 text-white"/>} 
            title="कुल काम के दिन"
            value={latestData.personDaysGenerated.toLocaleString('en-IN')}
            numericValue={latestData.personDaysGenerated}
            unit="Lakh Person-days"
            color="bg-green-500"
            comparisonValue={latestAverage?.personDaysGenerated}
            onInfoClick={() => handleInfoClick('personDays')}
            language={language}
        />
        <DataCard 
            icon={<CalendarIcon className="h-6 w-6 text-white"/>} 
            title="प्रति परिवार औसत काम"
            value={Math.round(latestData.averageDaysOfEmployment).toString()}
            numericValue={latestData.averageDaysOfEmployment}
            unit="Days"
            color="bg-yellow-500"
            comparisonValue={latestAverage?.averageDaysOfEmployment}
            onInfoClick={() => handleInfoClick('avgDays')}
            language={language}
        />
        <DataCard 
            icon={<RupeeIcon className="h-6 w-6 text-white"/>} 
            title="कुल खर्च"
            value={`₹${latestData.totalExpenditure.toLocaleString('en-IN')}`}
            numericValue={latestData.totalExpenditure}
            unit="Crore"
            color="bg-red-500"
            comparisonValue={latestAverage?.totalExpenditure}
            onInfoClick={() => handleInfoClick('expenditure')}
            language={language}
        />
        </div>
        {modalContent && (
            <MetricExplainerModal
                content={modalContent}
                initialLanguage={language}
                onClose={() => setModalContentKey(null)}
            />
        )}
    </>
  );
};
