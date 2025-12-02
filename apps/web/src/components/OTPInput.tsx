import React, {
    useRef,
    useEffect,
    useMemo,
    ChangeEvent,
    KeyboardEvent,
    ClipboardEvent,
} from 'react';

interface OTPInputProps {
    value: string;
    length?: number;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    onSubmit?: () => void;
    variant?: 'default' | 'glass' | 'glass-dark';
    /** Allow alphanumeric input (for guest codes). Default is digits only. */
    alphanumeric?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    value = '',
    length = 6,
    onChange,
    onComplete,
    onSubmit,
    variant = 'default',
    alphanumeric = false,
}) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Helper: Detect Safari
    const isSafari = useMemo(() => {
        if (typeof navigator === 'undefined') return false;
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }, []);

    // Focus the first empty input on mount
    useEffect(() => {
        const firstEmptyInput = value.length < length ? value.length : -1;
        if (firstEmptyInput !== -1 && inputRefs.current[firstEmptyInput]) {
            inputRefs.current[firstEmptyInput]?.focus();
        }
    }, []);

    const handleInput = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const target = e.target;
        let val = target.value;

        // Keep only allowed characters (digits, or alphanumeric if enabled)
        val = alphanumeric 
            ? val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
            : val.replace(/\D/g, '');

        // Construct new value
        const currentData = value.split('');
        // Pad if needed
        while (currentData.length < length) currentData.push('');

        if (val === '') {
            // Deletion
            currentData[index] = '';
        } else {
            // Take last char
            currentData[index] = val.slice(-1);

            // Auto-focus next
            if (index < length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }

        const newValue = currentData.join('').slice(0, length);
        onChange(newValue);

        if (newValue.length === length && onComplete) {
            onComplete(newValue);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        const target = e.target as HTMLInputElement;

        if (e.key === 'Enter' && onSubmit) {
            e.preventDefault();
            onSubmit();
            return;
        }

        if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'Backspace' && !target.value && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const rawPaste = e.clipboardData.getData('text');
        const pasteData = alphanumeric
            ? rawPaste.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
            : rawPaste.replace(/\D/g, '');

        const currentData = value.split('');
        while (currentData.length < length) currentData.push('');

        let currentIndex = index;

        for (let i = 0; i < pasteData.length; i++) {
            if (currentIndex < length) {
                currentData[currentIndex] = pasteData[i];
                currentIndex++;
            }
        }

        const newValue = currentData.join('').slice(0, length);
        onChange(newValue);

        if (newValue.length === length && onComplete) {
            onComplete(newValue);
        }

        const nextFocusIndex = Math.min(currentIndex, length - 1);
        setTimeout(() => {
            inputRefs.current[nextFocusIndex]?.focus();
        }, 0);
    };

    // Prepare display values
    const valueArray = value.split('');
    while (valueArray.length < length) valueArray.push('');

    const isGlass = variant === 'glass' || variant === 'glass-dark';

    return (
        <div className="flex gap-2 justify-between w-full">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    id={`otp-${index}`}
                    name={`otp-${index}`}
                    value={valueArray[index] || ''}
                    type="text"
                    inputMode={alphanumeric ? "text" : "numeric"}
                    autoComplete="one-time-code"
                    aria-label={`Digit ${index + 1} of ${length}`}
                    placeholder="·"
                    className={`
            w-12 h-14 
            text-center text-2xl font-bold 
            border rounded-xl 
            outline-none 
            transition-all duration-200
            ${isGlass
                            ? valueArray[index]
                                ? 'border-transparent bg-white/20 text-white shadow-lg shadow-black/10 text-3xl'
                                : 'border-white/20 bg-white/5 text-white hover:border-white/40'
                            : valueArray[index]
                                ? 'border-transparent bg-gray-50 text-gray-900 shadow-md text-3xl'
                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }
            ${isGlass
                            ? 'focus:border-white focus:ring-1 focus:ring-white/30 placeholder-white/50'
                            : 'focus:border-brand-500 focus:ring-2 focus:ring-brand-200'
                        }
            ${isSafari ? 'text-[2rem]' : ''}
          `}
                    onChange={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                />
            ))}
        </div>
    );
};
