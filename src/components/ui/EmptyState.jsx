import { AlertCircle } from 'lucide-react';

export default function EmptyState({ mensaje }) {
    return (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 border-dashed">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <AlertCircle size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-lg">{mensaje}</p>
        </div>
    );
}
