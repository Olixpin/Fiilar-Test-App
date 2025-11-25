import React from 'react';
import { Listing } from '@fiilar/types';
import { Input } from '@fiilar/ui';
import { X } from 'lucide-react';

interface TagsInputProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
}

const TagsInput: React.FC<TagsInputProps> = ({ newListing, setNewListing }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if (val && !newListing.tags?.includes(val)) {
                setNewListing({ ...newListing, tags: [...(newListing.tags || []), val] });
                e.currentTarget.value = '';
            }
        }
    };

    const removeTag = (tag: string) => {
        setNewListing({ ...newListing, tags: newListing.tags?.filter(t => t !== tag) });
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
                {newListing.tags?.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        #{tag}
                        <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500"
                            aria-label={`Remove ${tag} tag`}
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
            <Input
                placeholder="Add a tag (e.g. 'Quiet', 'Luxury', 'Beachfront') and press Enter"
                onKeyDown={handleKeyDown}
                variant="glass"
                helperText="Press Enter to add tags"
                fullWidth
            />
        </div>
    );
};

export default TagsInput;
