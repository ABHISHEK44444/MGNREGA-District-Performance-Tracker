import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { PerformanceData, YearlyData } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_API_KEY;

const ai =GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

if (!ai) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is available.
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}


export const getSimpleExplanation = async (performanceData: PerformanceData, language: 'en' | 'hi'): Promise<string> => {
  if (!ai) return "AI features are disabled. API key is missing.";

  const { district: districtData, stateAverage } = performanceData;
  const latestData = districtData.data[districtData.data.length - 1];
  const latestAverage = stateAverage.find(d => d.year === latestData.year);

  if (!latestAverage) {
    return "Could not find state average data for comparison.";
  }

  const districtDataString = `Data for ${districtData.name}:
- Families who got work (रोजगार पाने वाले परिवार): ${latestData.householdsProvidedEmployment.toLocaleString('en-IN')}
- Total workdays created (कुल काम के दिन): ${latestData.personDaysGenerated} lakh
- Average days of work per family (प्रति परिवार औसत काम के दिन): ${Math.round(latestData.averageDaysOfEmployment)}
- Money spent on wages and materials (कुल खर्च): ₹${latestData.totalExpenditure} crore`;

  const stateAverageDataString = `Average Data for a district in the state:
- Families who got work: ${Math.round(latestAverage.householdsProvidedEmployment).toLocaleString('en-IN')}
- Total workdays created: ${latestAverage.personDaysGenerated.toFixed(2)} lakh
- Average days of work per family: ${Math.round(latestAverage.averageDaysOfEmployment)}
- Money spent: ₹${latestAverage.totalExpenditure.toFixed(2)} crore`;
  
  const hindiDataString = `${districtData.name} के लिए डेटा:
- रोजगार पाने वाले परिवार: ${latestData.householdsProvidedEmployment.toLocaleString('hi-IN')}
- कुल काम के दिन (लाख में): ${latestData.personDaysGenerated.toLocaleString('hi-IN')}
- प्रति परिवार औसत काम के दिन: ${Math.round(latestData.averageDaysOfEmployment).toLocaleString('hi-IN')}
- कुल खर्च (करोड़ में): ₹${latestData.totalExpenditure.toLocaleString('hi-IN')}

राज्य का औसत डेटा:
- रोजगार पाने वाले परिवार: ${Math.round(latestAverage.householdsProvidedEmployment).toLocaleString('hi-IN')}
- कुल काम के दिन (लाख में): ${latestAverage.personDaysGenerated.toFixed(2)}
- प्रति परिवार औसत काम के दिन: ${Math.round(latestAverage.averageDaysOfEmployment)}
- कुल खर्च (करोड़ में): ₹${latestAverage.totalExpenditure.toFixed(2)}`;

  const prompt = language === 'en'
    ? `You are an expert at explaining complex government schemes to people with low literacy in rural India. Your persona is a helpful female guide. Your tone should be simple, positive, and encouraging.

Explain the following MGNREGA performance data for ${districtData.name} district for the year ${latestData.year} in SIMPLE ENGLISH, and compare it to the state average.

${districtDataString}

${stateAverageDataString}

Keep the explanation short, in 3-4 simple bullet points. Start with a positive sentence about the district's progress. Clearly state if the district is doing better or worse than the state average on key metrics and explain what that means for the local people in a simple, relatable way.`
    : `आप एक विशेषज्ञ हैं जो ग्रामीण भारत के लोगों को जटिल सरकारी योजनाओं को सरल हिंदी में समझाते हैं। आपकी भूमिका एक मददगार महिला गाइड की है। आपका लहजा सरल, सकारात्मक और उत्साहजनक होना चाहिए। जब आप स्वयं का उल्लेख करती हैं, तो स्त्री व्याकरण का उपयोग करें (उदाहरण के लिए, "मैं समझाती हूँ" न कि "मैं समझाता हूँ")।

${latestData.year} वर्ष के लिए ${districtData.name} जिले के निम्नलिखित मनरेगा प्रदर्शन डेटा को सरल, शुद्ध हिंदी (देवनागरी लिपि) में समझाएं और इसकी तुलना राज्य के औसत से करें।

${hindiDataString}

स्पष्टीकरण को 3-4 सरल बुलेट बिंदुओं में छोटा रखें। जिले की प्रगति के बारे में एक सकारात्मक वाक्य से शुरुआत करें। स्पष्ट रूप से बताएं कि जिला प्रमुख मैट्रिक्स पर राज्य के औसत से बेहतर या खराब प्रदर्शन कर रहा है और सरल, संबंधित तरीके से बताएं कि स्थानीय लोगों के लिए इसका क्या अर्थ है। केवल हिंदी में उत्तर दें।`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching explanation from Gemini:", error);
    return "AI से स्पष्टीकरण प्राप्त करने में एक त्रुटि हुई। कृपया बाद में पुन प्रयास करें। (An error occurred while getting the explanation from the AI. Please try again later.)";
  }
};


export const getDistrictFromCoords = async (coords: { latitude: number; longitude: number; }, districts: string[]): Promise<string | null> => {
    if (!ai) return null;

    const prompt = `From the following list of districts in Uttar Pradesh, India, which one is closest to the geographical coordinate latitude: ${coords.latitude}, longitude: ${coords.longitude}? 
    
    Districts: [${districts.join(', ')}]
    
    Respond with only the district name and nothing else.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const districtName = response.text.trim();
        // Validate if the response is one of the districts
        if (districts.includes(districtName)) {
            return districtName;
        }
        return null;
    } catch (error) {
        console.error("Error fetching district from Gemini:", error);
        return null;
    }
};

export const getSpeechAudio = async (text: string): Promise<string | null> => {
    if (!ai) return null;
  
    // Clean up text for better TTS performance
    const cleanedText = text.replace(/[*-\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanedText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                // A neutral, clear voice suitable for both languages
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });
  
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
          return base64Audio;
      }
      return null;
    } catch (error) {
      console.error("Error fetching speech from Gemini TTS:", error);
      return null;
    }
  };

  export async function* getAIAnalysisStream(performanceData: PerformanceData, question: string, language: 'en' | 'hi'): AsyncGenerator<string> {
    if (!ai) {
        yield "AI features are disabled. API key is missing.";
        return;
    }

    const dataContext = JSON.stringify(performanceData, null, 2);
    
    const languageInstruction = language === 'hi' 
      ? 'Your response MUST be in simple, conversational Hindi (Devanagari script). When you refer to yourself, use feminine Hindi grammar (e.g., "मैं समझाती हूँ" instead of "मैं समझाता हूँ").' 
      : 'Your response MUST be in simple, conversational English.';

    const prompt = `You are a helpful and friendly female data analyst specializing in Indian government schemes like MGNREGA. 
You will be provided with performance data for a specific district in JSON format, which includes the district's yearly data and the corresponding state-level averages for each year. 
Your task is to answer the user's question based *only* on the provided data. 
Be concise, clear, and use Markdown for formatting (like '**' for bold text, and '*' for bullet points). 
Do not invent or assume any data not present in the context. 
If the question cannot be answered with the given data, politely state that.
Analyze trends over the years available in the data.
${languageInstruction}

**Data Context:**
\`\`\`json
${dataContext}
\`\`\`

**User Question:**
"${question}"
`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash', // Use Flash model for faster responses
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error fetching analysis from Gemini:", error);
        yield "An error occurred while analyzing the data. Please try again.";
    }
  };

export const getAIForecast = async (
    metricName: string, 
    historicalData: { year: number, value: number }[]
): Promise<{ forecastedValue: number; explanation: string; } | null> => {
    if (!ai) return null;

    const dataString = historicalData.map(d => `${d.year}: ${d.value}`).join(', ');
    const nextYear = historicalData[historicalData.length - 1].year + 1;

    const prompt = `Given the following historical data for the metric "${metricName}": ${dataString}.
Provide a simple, non-financial, trend-based forecast for the year ${nextYear}.
Your response must be a valid JSON object with two keys:
1. "forecastedValue": A single number representing the predicted value for ${nextYear}.
2. "explanation": A very short, one-sentence explanation of the forecast based on the trend (e.g., "The upward trend is expected to continue.").

Do not include any other text, just the JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        forecastedValue: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                    },
                    required: ["forecastedValue", "explanation"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (typeof parsed.forecastedValue === 'number' && typeof parsed.explanation === 'string') {
            return parsed;
        }
        return null;

    } catch (error) {
        console.error("Error fetching forecast from Gemini:", error);
        return null;
    }
};

export const getAIInsight = async (
    latestData: YearlyData,
    districtName: string,
    language: 'en' | 'hi'
): Promise<string | null> => {
    if (!ai) return null;

    const dataString = `
    - District: ${districtName}
    - Households Provided Employment: ${latestData.householdsProvidedEmployment.toLocaleString('en-IN')}
    - Person-Days Generated: ${latestData.personDaysGenerated} lakh
    - Average Days of Employment per Household: ${Math.round(latestData.averageDaysOfEmployment)}
    - Total Expenditure: ₹${latestData.totalExpenditure} crore
    `;

    const languageInstruction = language === 'hi'
        ? `Respond in simple, engaging Hindi (Devanagari script).`
        : `Respond in simple, engaging English.`;

    const prompt = `You are a data storyteller. Based on the following MGNREGA data for ${districtName} district, generate a single, short, interesting "Did you know?" style insight.
Make it relatable by using a simple analogy or comparison (e.g., "the total expenditure is enough to build X km of rural roads", "the person-days generated is like giving a full-time job to Y people for a year"). Be creative.
Do not just repeat the data. Provide a fresh perspective.
Start the response with "Did you know?" in English, or "क्या आप जानते हैं?" in Hindi. The response should be a single sentence.

Data:
${dataString}

Instructions:
- Be very brief and to the point.
- Do not include any preamble or sign-off.
- ${languageInstruction}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching AI insight from Gemini:", error);
        return null;
    }
};

export interface GrievanceDetails {
    name: string;
    village: string;
    complaintType: string;
    details: string;
    district: string;
}

export const generateGrievanceLetter = async (
    grievanceDetails: GrievanceDetails,
    language: 'en' | 'hi'
): Promise<string> => {
    if (!ai) return "AI features are disabled. API key is missing.";

    const { name, village, complaintType, details, district } = grievanceDetails;

    const en_prompt = `
You are a helpful assistant for rural citizens in India. Your task is to draft a formal grievance letter regarding the MGNREGA scheme.
The letter should be addressed to the "Block Development Officer".
It should be polite, clear, and formal.
Incorporate the following details provided by the user:
- Name: ${name}
- Village/Block: ${village}, ${district} District
- Subject of Complaint: MGNREGA Complaint - ${complaintType}
- Detailed Problem: ${details}

Structure the letter as follows:
1. Start with "To, The Block Development Officer, [Block Name placeholder], ${district} District".
2. Write a clear subject line.
3. In the body, respectfully introduce the sender (name, village).
4. Clearly state the problem based on the complaint type and details provided. Be specific.
5. Request a timely investigation and resolution of the issue.
6. End with "Sincerely," followed by the user's name and a space for their signature and date.

Generate the letter in ENGLISH.
`;

    const hi_prompt = `
आप भारत के ग्रामीण नागरिकों के लिए एक सहायक हैं। आपका काम मनरेगा योजना के संबंध में एक औपचारिक शिकायत पत्र का मसौदा तैयार करना है।
पत्र "खंड विकास अधिकारी" को संबोधित होना चाहिए।
यह विनम्र, स्पष्ट और औपचारिक होना चाहिए।
उपयोगकर्ता द्वारा प्रदान किए गए निम्नलिखित विवरण शामिल करें:
- नाम: ${name}
- गाँव/ब्लॉक: ${village}, जिला ${district}
- शिकायत का विषय: मनरेगा शिकायत - ${complaintType}
- विस्तृत समस्या: ${details}

पत्र को इस प्रकार संरचित करें:
1. "सेवा में, खंड विकास अधिकारी, [ब्लॉक का नाम], जिला ${district}" से शुरू करें।
2. एक स्पष्ट विषय लिखें।
3. पत्र में, सम्मानपूर्वक प्रेषक का परिचय दें (नाम, गाँव)।
4. प्रदान की गई शिकायत के प्रकार और विवरण के आधार पर समस्या को स्पष्ट रूप से बताएं। विशिष्ट बनें।
5. इस मुद्दे की समय पर जांच और समाधान का अनुरोध करें।
6. "भवदीय," के साथ समाप्त करें, उसके बाद उपयोगकर्ता का नाम और उनके हस्ताक्षर और तारीख के लिए एक जगह छोड़ दें।

पत्र को केवल हिंदी (देवनागरी लिपि) में उत्पन्न करें।
`;
    
    const prompt = language === 'en' ? en_prompt : hi_prompt;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating grievance letter from Gemini:", error);
        return language === 'en' 
            ? "An error occurred while drafting the letter. Please try again."
            : "पत्र का मसौदा तैयार करते समय एक त्रुटि हुई। कृपया पुन प्रयास करें।";
    }
};

export async function* getRightsInformationStream(question: string, language: 'en' | 'hi'): AsyncGenerator<string> {
    if (!ai) {
        yield "AI features are disabled. API key is missing.";
        return;
    }
    
    const languageInstruction = language === 'hi' 
      ? 'Your response MUST be in simple, conversational Hindi (Devanagari script). Use analogies and simple examples. When you refer to yourself, use feminine Hindi grammar (e.g., "मैं बताती हूँ").' 
      : 'Your response MUST be in simple, conversational English. Use analogies and simple examples.';

    const prompt = `You are a very patient and helpful female guide named 'Sahayika' who explains the rights of citizens under the Indian MGNREGA scheme. Your audience has low literacy, so your language must be extremely simple and clear.

Your task is to answer the user's question based on your general knowledge of the MGNREGA Act.
- Break down complex topics into small, easy-to-understand points.
- Use bullet points or numbered lists.
- Use simple, everyday analogies to explain concepts (e.g., "A job card is like your passbook for work...").
- Do not use jargon or complex legal terms.
- Keep your tone encouraging and empowering.
- End your answer with a disclaimer: "This is for informational purposes only. For official matters, please contact your Gram Panchayat." (or its Hindi equivalent: "यह केवल जानकारी के लिए है। आधिकारिक मामलों के लिए, कृपया अपनी ग्राम पंचायत से संपर्क करें।").

${languageInstruction}

**User's Question:**
"${question}"
`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error fetching rights info from Gemini:", error);
        yield "An error occurred while getting information. Please try again.";
    }
}

// FIX: Add missing function `getPensionSchemeInfoStream` to resolve import error.
export async function* getPensionSchemeInfoStream(question: string, language: 'en' | 'hi'): AsyncGenerator<string> {
    if (!ai) {
        yield "AI features are disabled. API key is missing.";
        return;
    }
    
    const languageInstruction = language === 'hi' 
      ? 'Your response MUST be in simple, conversational Hindi (Devanagari script). Use analogies and simple examples. When you refer to yourself, use feminine Hindi grammar (e.g., "मैं बताती हूँ").' 
      : 'Your response MUST be in simple, conversational English. Use analogies and simple examples.';

    const prompt = `You are a very patient and helpful female guide named 'Sahayika' who explains Indian pension schemes (like old-age, widow, and disability pensions). Your audience has low literacy, so your language must be extremely simple and clear.

Your task is to answer the user's question based on your general knowledge of common Indian social security pension schemes.
- Break down complex topics into small, easy-to-understand points.
- Use bullet points or numbered lists.
- Use simple, everyday analogies to explain concepts.
- Do not use jargon or complex legal terms.
- Keep your tone encouraging and empowering.
- End your answer with a disclaimer: "This is for informational purposes only. For official matters, please contact your local social welfare office." (or its Hindi equivalent: "यह केवल जानकारी के लिए है। आधिकारिक मामलों के लिए, कृपया अपने स्थानीय समाज कल्याण कार्यालय से संपर्क करें।").

${languageInstruction}

**User's Question:**
"${question}"
`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error fetching pension info from Gemini:", error);
        yield "An error occurred while getting information. Please try again.";
    }
}

export async function* findWorksiteInfoStream(district: string, question: string, language: 'en' | 'hi'): AsyncGenerator<string> {
    if (!ai) {
        yield "AI features are disabled. API key is missing.";
        return;
    }
    
    const languageInstruction = language === 'hi' 
      ? 'Your response MUST be in simple, conversational Hindi (Devanagari script). When you refer to yourself, use feminine grammar (e.g., "मैं बताती हूँ").' 
      : 'Your response MUST be in simple, conversational English.';

    const prompt = `You are a helpful female guide for the MGNREGA scheme. Your name is 'Sahayika'. A user is asking where they can find work in the ${district} district.
You DO NOT have access to real-time worksite data. Your role is to provide helpful, generic examples of the *types* of work that might be available and guide the user to the correct official source.

- Based on the user's question, provide 2-3 examples of common MGNREGA work (e.g., pond construction, road building, tree plantation).
- Emphasize that these are just examples.
- **Crucially, you must always end your response by telling the user to contact their Gram Panchayat (ग्राम पंचायत) for the exact location and availability of current worksites.**
- Keep your tone supportive and clear.

${languageInstruction}

**User's Question:**
"${question}"
`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error fetching worksite info from Gemini:", error);
        yield "An error occurred while getting information. Please try again.";
    }
}

export const generateSuccessStory = async (
    performanceData: PerformanceData,
    language: 'en' | 'hi'
): Promise<string> => {
    if (!ai) return "AI features are disabled. API key is missing.";
    
    const { district, stateAverage } = performanceData;
    const latestData = district.data[district.data.length - 1];
    const latestAverage = stateAverage.find(s => s.year === latestData.year);
    
    const dataSummary = `District: ${district.name}, Year: ${latestData.year}, Average days of employment per family: ${Math.round(latestData.averageDaysOfEmployment)}. This is compared to the state average of ${Math.round(latestAverage?.averageDaysOfEmployment || 0)} days.`;

    const en_prompt = `
You are a positive storyteller. Based on the provided MGNREGA data summary, write a short, heartwarming, and fictional success story (2-3 paragraphs).
The story should be about a fictional family from the ${district.name} district who benefited from the scheme.
- Create anonymous characters (e.g., "Sunita and her family", "Ramesh").
- If the district's average days of employment is high, focus on how the consistent work helped the family (e.g., send a child to school, repair their house, buy livestock).
- If it's low but improving, focus on the hope and positive change it brought.
- The tone should be inspiring and relatable for a rural audience.
- Do not just state the data; weave it into a narrative.
- End on a hopeful note.
- The response should be in ENGLISH.

Data Summary: ${dataSummary}
`;

    const hi_prompt = `
आप एक सकारात्मक कहानीकार हैं। प्रदान किए गए मनरेगा डेटा सारांश के आधार पर, एक छोटी, दिल को छू लेने वाली और काल्पनिक सफलता की कहानी (2-3 पैराग्राफ) लिखें।
कहानी ${district.name} जिले के एक काल्पनिक परिवार के बारे में होनी चाहिए जिसे इस योजना से लाभ हुआ।
- गुमनाम पात्र बनाएं (जैसे, "सुनीता और उसका परिवार", "रमेश")।
- यदि जिले में प्रति परिवार औसत रोजगार के दिन अधिक हैं, तो इस पर ध्यान केंद्रित करें कि कैसे निरंतर काम ने परिवार की मदद की (जैसे, बच्चे को स्कूल भेजना, घर की मरम्मत करना, पशु खरीदना)।
- यदि यह कम है लेकिन सुधार हो रहा है, तो आशा और सकारात्मक बदलाव पर ध्यान केंद्रित करें।
- लहजा ग्रामीण दर्शकों के लिए प्रेरणादायक और संबंधित होना चाहिए।
- सिर्फ डेटा न बताएं; इसे एक कहानी में बुनें।
- एक आशाजनक नोट पर समाप्त करें।
- प्रतिक्रिया केवल हिंदी (देवनागरी लिपि) में होनी चाहिए।

डेटा सारांश: ${dataSummary}
`;
    
    const prompt = language === 'en' ? en_prompt : hi_prompt;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating success story from Gemini:", error);
        return language === 'en' 
            ? "An error occurred while creating the story. Please try again."
            : "कहानी बनाते समय एक त्रुटि हुई। कृपया पुन प्रयास करें।";
    }
};