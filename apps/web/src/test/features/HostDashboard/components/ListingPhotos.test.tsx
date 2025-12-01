import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ListingPhotos from '../../../../features/HostDashboard/components/CreateListingWizard/ListingPhotos';
import { Listing } from '@fiilar/types';

describe('ListingPhotos', () => {
    const mockSetStep = vi.fn();
    const mockHandleImageUpload = vi.fn();
    const mockHandleImageDragStart = vi.fn();
    const mockHandleImageDragOver = vi.fn();
    const mockHandleImageDragEnd = vi.fn();
    const mockRemoveImage = vi.fn();

    const defaultProps = {
        newListing: { images: [] } as Partial<Listing>,
        setStep: mockSetStep,
        handleImageUpload: mockHandleImageUpload,
        handleImageDragStart: mockHandleImageDragStart,
        handleImageDragOver: mockHandleImageDragOver,
        handleImageDragEnd: mockHandleImageDragEnd,
        removeImage: mockRemoveImage,
        draggedImageIndex: null
    };

    it('renders empty state when no images are present', () => {
        render(<ListingPhotos {...defaultProps} />);
        expect(screen.getByText(/Drag & drop photos here/i)).toBeInTheDocument();
        expect(screen.getByText(/Photo Tips for Success/i)).toBeInTheDocument();
    });

    it('renders photo grid when images are present', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['img1.jpg', 'img2.jpg'] }
        };
        render(<ListingPhotos {...props} />);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(screen.getByText(/Cover/i)).toBeInTheDocument();
    });

    it('calls setStep(1) when Back button is clicked', () => {
        render(<ListingPhotos {...defaultProps} />);
        const backButtons = screen.getAllByRole('button', { name: /back/i });
        fireEvent.click(backButtons[0]);
        expect(mockSetStep).toHaveBeenCalledWith(1);
    });

    it('enables Continue button even when less than 5 images', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'] }
        };
        render(<ListingPhotos {...props} />);
        const continueButton = screen.getByRole('button', { name: /continue to availability/i });
        expect(continueButton).not.toBeDisabled();
    });

    it('enables Continue button when 5 or more images', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['1', '2', '3', '4', '5'] }
        };
        render(<ListingPhotos {...props} />);
        const continueButton = screen.getByRole('button', { name: /continue to availability/i });
        expect(continueButton).not.toBeDisabled();
    });

    it('calls setStep(3) when Continue button is clicked', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['1', '2', '3', '4', '5'] }
        };
        render(<ListingPhotos {...props} />);
        const continueButton = screen.getByRole('button', { name: /continue to availability/i });
        fireEvent.click(continueButton);
        expect(mockSetStep).toHaveBeenCalledWith(3);
    });

    it('calls removeImage when trash icon is clicked', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['img1.jpg'] }
        };
        render(<ListingPhotos {...props} />);
        const removeButton = screen.getByTitle(/Remove photo/i);
        fireEvent.click(removeButton);
        expect(mockRemoveImage).toHaveBeenCalledWith(0);
    });

    it('handles drag and drop events', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['img1.jpg', 'img2.jpg'] }
        };
        render(<ListingPhotos {...props} />);
        
        // Find the draggable container. The image is inside it.
        const images = screen.getAllByRole('img');
        // The parent div of the image is the draggable element
        const firstImageContainer = images[0].parentElement;
        
        if (!firstImageContainer) throw new Error('Draggable container not found');

        fireEvent.dragStart(firstImageContainer);
        expect(mockHandleImageDragStart).toHaveBeenCalledWith(0);

        fireEvent.dragOver(firstImageContainer);
        expect(mockHandleImageDragOver).toHaveBeenCalledWith(expect.anything(), 0);

        fireEvent.dragEnd(firstImageContainer);
        expect(mockHandleImageDragEnd).toHaveBeenCalled();
    });

    it('calls handleImageUpload when file is selected in empty state', () => {
        const { container } = render(<ListingPhotos {...defaultProps} />);
        const fileInput = container.querySelector('input[type="file"]');
        
        if (!fileInput) throw new Error('File input not found');

        fireEvent.change(fileInput, {
            target: { files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })] }
        });
        
        expect(mockHandleImageUpload).toHaveBeenCalled();
    });

    it('calls handleImageUpload when file is selected in "Add More"', () => {
        const props = {
            ...defaultProps,
            newListing: { images: ['img1.jpg'] }
        };
        const { container } = render(<ListingPhotos {...props} />);
        // There might be multiple inputs if we are not careful, but in non-empty state, the empty state one is gone.
        // But wait, the empty state is conditional: {(!newListing.images || newListing.images.length === 0) ? ... : ...}
        // So only one input exists at a time.
        
        const fileInput = container.querySelector('input[type="file"]');
        
        if (!fileInput) throw new Error('File input not found');

        fireEvent.change(fileInput, {
            target: { files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })] }
        });
        
        expect(mockHandleImageUpload).toHaveBeenCalled();
    });
});
