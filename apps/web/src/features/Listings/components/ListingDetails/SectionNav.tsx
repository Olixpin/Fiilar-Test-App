import React, { useEffect, useState } from 'react';
import { cn } from '@fiilar/utils';

interface Section {
    id: string;
    label: string;
}

const SECTIONS: Section[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'policies', label: 'Policies' },
    { id: 'location', label: 'Location' },
];

export const SectionNav: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('overview');
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Check if nav is sticky
            const nav = document.getElementById('section-nav');
            if (nav) {
                const rect = nav.getBoundingClientRect();
                setIsSticky(rect.top <= 0);
            }

            // Determine active section
            const scrollPosition = window.scrollY + 150; // Offset for header

            for (const section of SECTIONS) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Height of nav + buffer
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(id);
        }
    };

    return (
        <div
            id="section-nav"
            className={cn(
                "sticky top-0 z-40 bg-white transition-all duration-300 border-b border-gray-100",
                isSticky ? "shadow-sm" : ""
            )}
        >
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={cn(
                                "text-sm font-semibold whitespace-nowrap transition-colors relative py-1",
                                activeSection === section.id
                                    ? "text-gray-900"
                                    : "text-gray-500 hover:text-gray-800"
                            )}
                        >
                            {section.label}
                            {activeSection === section.id && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
