import React, { createContext, useContext, useState } from 'react';

const FieldContext = createContext();

export const FieldProvider = ({ children }) => {
    const [selectedField, setSelectedField] = useState(null); // The basic field info (name, id, polygon)
    const [analysisData, setAnalysisData] = useState(null); // The heavy analysis (risk, ndvi, weather, raw_analysis)
    const [isAnalyzing, setIsAnalyzing] = useState(false);    // Loading state
    const [chatHistory, setChatHistory] = useState([]); // [{id, sender, text, image?}]

    return (
        <FieldContext.Provider value={{
            selectedField,
            setSelectedField,
            analysisData,
            setAnalysisData,
            isAnalyzing,
            setIsAnalyzing,
            chatHistory,
            setChatHistory
        }}>
            {children}
        </FieldContext.Provider>
    );
};

export const useField = () => {
    const context = useContext(FieldContext);
    if (!context) {
        throw new Error('useField must be used within a FieldProvider');
    }
    return context;
};
