interface CarouselDotsProps<T extends string | number> {
    items: { id: T; label?: string }[];
    activeId: T;
    onDotClick: (id: T) => void;
    className?: string;
    activeColor?: string;
    inactiveColor?: string;
}

export function CarouselDots<T extends string | number>({
    items,
    activeId,
    onDotClick,
    className = '',
    activeColor = 'bg-blue-600',
    inactiveColor = 'bg-gray-300 hover:bg-gray-400'
}: CarouselDotsProps<T>) {
    return (
        <div className={`flex justify-center gap-1.5 ${className}`}>
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onDotClick(item.id)}
                    className={`transition-all duration-200 rounded-full ${
                        activeId === item.id 
                            ? `w-6 h-2 ${activeColor}` 
                            : `w-2 h-2 ${inactiveColor}`
                    }`}
                    aria-label={item.label ? `Go to ${item.label}` : `Go to item ${item.id}`}
                />
            ))}
        </div>
    );
}

export default CarouselDots;
