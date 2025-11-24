import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from '@fiilar/ui';

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
    const img = screen.getByRole('img', { name: /user avatar/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders fallback when src is missing', () => {
    render(<Avatar alt="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders custom fallback', () => {
    render(<Avatar fallback="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders fallback on image error', () => {
    render(<Avatar src="invalid-url" alt="John Doe" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<Avatar size="sm" />);
    expect(container.firstChild).toHaveClass('h-8 w-8');

    rerender(<Avatar size="lg" />);
    expect(container.firstChild).toHaveClass('h-12 w-12');
  });
});
