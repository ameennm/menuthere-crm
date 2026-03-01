import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(onRemove, 3000);
        return () => clearTimeout(timer);
    }, [onRemove]);

    return (
        <div className={`toast toast-${toast.type}`} onClick={onRemove}>
            {toast.type === 'success' ? (
                <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
            ) : (
                <XCircle size={18} style={{ color: 'var(--accent-red)' }} />
            )}
            <span className="toast-message">{toast.message}</span>
        </div>
    );
}
