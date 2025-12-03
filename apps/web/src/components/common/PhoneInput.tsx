import React, { useState, useEffect } from 'react';
import { Input, Select } from '@fiilar/ui';

interface PhoneInputProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
}

const countryCodes: Record<string, string> = {
    ng: '+234',
    us: '+1',
    uk: '+44',
};

const placeholders: Record<string, string> = {
    ng: 'e.g. +234 906 000 0000',
    us: 'e.g. +1 (555) 000-0000',
    uk: 'e.g. +44 7911 123456',
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    readOnly,
    className
}) => {
    // Initialize country based on value prefix, default to 'ng'
    const [country, setCountry] = useState(() => {
        if (!value) return 'ng';
        if (value.startsWith('+1')) return 'us';
        if (value.startsWith('+44')) return 'uk';
        return 'ng';
    });

    // Update country if value changes externally and doesn't match current country
    useEffect(() => {
        if (value) {
            if (value.startsWith('+234') && country !== 'ng') setCountry('ng');
            else if (value.startsWith('+1') && country !== 'us') setCountry('us');
            else if (value.startsWith('+44') && country !== 'uk') setCountry('uk');
        }
    }, [value, country]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountry = e.target.value;
        setCountry(newCountry);

        const oldCode = countryCodes[country];
        const newCode = countryCodes[newCountry];

        // Replace old code with new code
        let newVal = value;
        // Strip non-digit/plus chars to be safe when checking prefix
        const cleanVal = value.replace(/[^\d+]/g, '');

        if (cleanVal.startsWith(oldCode)) {
            // Remove old code and prepend new code
            // We use the raw value to preserve spaces if possible, but it's safer to rebuild
            const numberPart = value.substring(oldCode.length).trim();
            newVal = newCode + " " + numberPart;
        } else {
            // If it didn't start with old code (maybe empty), just set new code
            newVal = newCode + " ";
        }
        onChange(newVal);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        const code = countryCodes[country];

        // Extract just the number part (after the country code)
        let numberPart = '';
        
        if (newValue.startsWith(code)) {
            // Get everything after the country code
            numberPart = newValue.substring(code.length);
        } else {
            // If country code is missing, treat entire input as the number part
            numberPart = newValue;
        }
        
        // Remove all non-digit characters from the number part
        numberPart = numberPart.replace(/\D/g, '');
        
        // Strip leading zero (common mistake when entering Nigerian numbers)
        if (numberPart.startsWith('0')) {
            numberPart = numberPart.substring(1);
        }
        
        // Reassemble with country code and a space
        newValue = code + ' ' + numberPart;

        onChange(newValue);
    };

    const activePlaceholder = placeholder || placeholders[country] || placeholders.ng;

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-[100px] shrink-0">
                <Select
                    id={id ? `${id}-country` : 'country'}
                    label={label ? "Country" : undefined}
                    value={country}
                    onChange={handleCountryChange}
                    options={[
                        { value: 'ng', label: 'NG' },
                        { value: 'us', label: 'US' },
                        { value: 'uk', label: 'UK' },
                    ]}
                    className={`h-14 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-all ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}
                    disabled={readOnly}
                />
            </div>
            <div className="grow">
                <Input
                    id={id}
                    autoComplete="tel"
                    label={label}
                    type="tel"
                    placeholder={activePlaceholder}
                    className={`h-14 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f9fafb_inset] [&:-webkit-autofill]:-webkit-text-fill-color-black ${className || ''}`}
                    value={value}
                    onChange={handlePhoneChange}
                    readOnly={readOnly}
                />
            </div>
        </div>
    );
};
