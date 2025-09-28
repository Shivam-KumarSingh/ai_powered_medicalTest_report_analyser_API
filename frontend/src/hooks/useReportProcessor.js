import { useState, useCallback, useRef } from 'react';
import { STEPS } from '../components/constants';

export const useReportProcessor = () => {
    // --- State Management ---
    const [file, setFile] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [results, setResults] = useState(null);
    const [status, setStatus] = useState({
        isProcessing: false,
        currentStep: 0,
        message: '',
        error: null,
    });
    const fileInputRef = useRef(null);

    // --- Handlers ---
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setTextInput('');
        setResults(null);
        setStatus({ ...status, error: null });
    };

    const handleTextChange = (event) => {
        setTextInput(event.target.value);
        setFile(null);
        setResults(null);
        setStatus({ ...status, error: null });
    };

    const buildFormData = useCallback(() => {
        const formData = new FormData();
        if (file) {
            formData.append('file', file, file.name);
        } else if (textInput.trim()) {
            formData.append('text', textInput.trim());
        } else {
            throw new Error("Please upload a file or paste text to analyze.");
        }
        return formData;
    }, [file, textInput]);

    const updateProgressState = useCallback(async (step) => {
        setStatus(prev => ({
            ...prev,
            currentStep: step,
            message: STEPS[step] ? `Step ${step}: ${STEPS[step].name} is running...` : ''
        }));
        await new Promise(resolve => setTimeout(resolve, 500));
    }, []);

    const processReport = async () => {
        setStatus({ isProcessing: true, currentStep: 0, message: 'Starting process...', error: null });
        setResults(null);

        try {
            const formData = buildFormData();
            
            await updateProgressState(1); 
            const response = await fetch('https://ai-powered-medicaltest-report-analyser.onrender.com/api/simplify-report', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server responded with an unknown error.' }));
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            
            await updateProgressState(2); 
            await updateProgressState(3); 
            await updateProgressState(4); 

            if (data.status === 'ok') {
                setResults(data);
                setStatus({ isProcessing: false, currentStep: 4, message: 'Analysis Complete.', error: null });
            } else if (data.status === 'unprocessed') {
                setStatus({
                    isProcessing: false,
                    currentStep: 3,
                    message: 'Process halted by Guardrail.',
                    error: `GUARDRAIL ACTIVATED: ${data.reason || 'Content deemed unsafe by server.'}`,
                });
            } else {
                throw new Error(data.message || 'An unknown processing error occurred on the server.');
            }

        } catch (error) {
            console.error("Processing Error:", error);
            setStatus({ 
                isProcessing: false, 
                currentStep: 0, 
                message: 'Failed.', 
                error: error.message || 'Network error or invalid input.',
            });
        }
    };

    return {
        file,
        textInput,
        results,
        status,
        fileInputRef,
        handleFileChange,
        handleTextChange,
        processReport,
        STEPS
    };
};
