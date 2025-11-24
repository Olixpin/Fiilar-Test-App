import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@fiilar/ui';

describe('Card', () => {
  it('renders all subcomponents correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies custom classes', () => {
    render(<Card className="custom-class">Content</Card>);
    // We need to find the card div. Since it doesn't have a role by default, we can use text content or testid if added.
    // Or we can just check if the text is rendered and check its parent.
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-class');
  });
});
