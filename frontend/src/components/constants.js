import { FileText, CheckCircle, MessageSquare, BarChart2 } from 'lucide-react';

export const STEPS = {
    1: { name: 'OCR & Extraction', icon: FileText, width: 25 },
    2: { name: 'Normalization (Gemini)', icon: BarChart2, width: 50 },
    3: { name: 'Guardrail Check', icon: CheckCircle, width: 75 },
    4: { name: 'Summary Generation', icon: MessageSquare, width: 100 }
};
export const API_ENDPOINT = '/api/simplify-report';
