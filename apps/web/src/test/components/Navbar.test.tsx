import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../../components/common/Navbar';
import { BrowserRouter } from 'react-router-dom';
import { User, Role } from '@fiilar/types';
import * as storageService from '@fiilar/storage';
import * as notificationService from '@fiilar/notifications';
import { ToastProvider } from '@fiilar/ui';

// Mock storage service
vi.mock('@fiilar/storage', () => ({
  getAllUsers: vi.fn(),
  getCurrentUser: vi.fn(),
  STORAGE_KEYS: { USERS_DB: 'users', USER: 'user' },
}));

// Mock notifications service
vi.mock('@fiilar/notifications', () => ({
  getUnreadCount: vi.fn().mockReturnValue(0),
}));

// Mock NotificationCenter
vi.mock('../../features/Notifications/components/NotificationCenter', () => ({
  default: () => <div data-testid="notification-center">Notification Center</div>,
}));

// Helper to wrap component with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {ui}
      </ToastProvider>
    </BrowserRouter>
  );
};

const mockUser: User = {
  id: 'user1',
  name: 'Test User',
  firstName: 'Test',
  email: 'test@example.com',
  password: 'password',
  role: Role.USER,
  isHost: false,
  walletBalance: 0,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  avatar: 'avatar.jpg',
  favorites: []
};

const mockHostUser: User = {
  ...mockUser,
  role: Role.HOST,
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly for guest user', () => {
    renderWithProviders(<Navbar user={null} onLogout={vi.fn()} />);

    // Open the account menu to see guest options
    const accountButton = screen.getByRole('button', { name: /account/i });
    fireEvent.click(accountButton);

    expect(screen.getByText('Become a host')).toBeInTheDocument();
  });

  it('renders correctly for logged in user', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    // First name is shown in the UI - it appears in the button aria-label and title
    expect(screen.getByRole('button', { name: /Account menu — Test/i })).toBeInTheDocument();
    // Avatar image has alt text of user's firstName
    expect(screen.getByRole('img', { name: 'Test' })).toHaveAttribute('src', 'avatar.jpg');
  });

  it('opens account menu when clicked', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    const accountButton = screen.getByRole('button', { name: /account/i });
    fireEvent.click(accountButton);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('calls onLogout when logout is clicked', () => {
    const handleLogout = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={handleLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    fireEvent.click(screen.getByText('Log out'));

    expect(handleLogout).toHaveBeenCalled();
  });

  it('calls onSearch when search input changes', () => {
    const handleSearch = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} onSearch={handleSearch} searchTerm="" />);

    const input = screen.getByPlaceholderText(/try 'studio in lagos/i);
    fireEvent.change(input, { target: { value: 'test search' } });

    expect(handleSearch).toHaveBeenCalledWith('test search');
  });

  it('shows notification badge when there are unread notifications', () => {
    (notificationService.getUnreadCount as any).mockReturnValue(5);
    
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('opens notification center when bell is clicked', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    const bellButton = screen.getByTitle('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
  });

  // --- New Tests for Coverage ---

  it('toggles mobile menu', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    const toggleButton = screen.getByTitle('Toggle menu');
    fireEvent.click(toggleButton);

    // Check for mobile menu items
    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();

    // Close menu
    fireEvent.click(toggleButton);
    expect(screen.queryByText('My Bookings')).not.toBeInTheDocument();
  });

  it('renders mobile menu for guest', () => {
    renderWithProviders(<Navbar user={null} onLogout={vi.fn()} />);

    const toggleButton = screen.getByTitle('Toggle menu');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('handles mobile search modal', () => {
    const handleSearch = vi.fn();
    const handleNavigate = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} onSearch={handleSearch} onNavigate={handleNavigate} searchTerm="" />);

    // Open mobile search
    const searchButton = screen.getByTitle('Search');
    fireEvent.click(searchButton);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Type in search
    const input = screen.getAllByPlaceholderText(/try 'studio in lagos/i)[1]; // Second one is in modal
    fireEvent.change(input, { target: { value: 'mobile search' } });
    expect(handleSearch).toHaveBeenCalledWith('mobile search');

    // Clear search
    // We need to re-render or update props to simulate state change if it was controlled, 
    // but here we are testing the callback. 
    // Let's simulate the clear button appearance by forcing a re-render with searchTerm prop if needed,
    // but the component uses the prop.
  });

  it('clears mobile search', () => {
    const handleSearch = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} onSearch={handleSearch} searchTerm="something" />);

    const searchButton = screen.getByTitle('Search');
    fireEvent.click(searchButton);

    const clearButton = screen.getByTitle('Clear search');
    fireEvent.click(clearButton);
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('closes mobile search on cancel', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByTitle('Search'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders guest account menu items', () => {
    const handleLogin = vi.fn();
    renderWithProviders(<Navbar user={null} onLogout={vi.fn()} onLogin={handleLogin} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));

    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Log in'));
    expect(handleLogin).toHaveBeenCalled();
  });

  it('handles role switching', () => {
    const handleSwitchRole = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} onSwitchRole={handleSwitchRole} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    const switchBtn = screen.getByText('Switch to hosting');
    fireEvent.click(switchBtn);

    expect(handleSwitchRole).toHaveBeenCalledWith(Role.HOST);
  });

  it('handles role switching for host', () => {
    const handleSwitchRole = vi.fn();
    renderWithProviders(<Navbar user={mockHostUser} onLogout={vi.fn()} onSwitchRole={handleSwitchRole} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    const switchBtn = screen.getByText('Switch to traveling');
    fireEvent.click(switchBtn);

    expect(handleSwitchRole).toHaveBeenCalledWith(Role.USER);
  });

  it('closes account menu on Escape key', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    expect(screen.getByText('Log out')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Log out')).not.toBeInTheDocument();
  });

  it('closes account menu when clicking outside', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    expect(screen.getByText('Log out')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Log out')).not.toBeInTheDocument();
  });

  it('loads guest favorites count from localStorage', () => {
    localStorage.setItem('fiilar_guest_favorites', JSON.stringify(['1', '2']));
    renderWithProviders(<Navbar user={null} onLogout={vi.fn()} />);
    
    // We need to open the menu to see the count? No, the count is in the menu which is conditionally rendered.
    // But the state is set in useEffect.
    // Let's open the menu.
    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('handles avatar upload', async () => {
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    
    // Mock FileReader
    const originalFileReader = window.FileReader;
    
    const readerMock = {
      readAsDataURL: vi.fn().mockImplementation(function(this: any) {
        // Use setTimeout to simulate async behavior and ensure onload is available
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 0);
      }),
      onload: null as any, // Will be assigned by component
      result: 'data:image/png;base64,fake',
    };

    // Use a standard function for the mock to allow 'new'
    window.FileReader = vi.fn().mockImplementation(function() {
        return readerMock;
    }) as any;

    // Mock storage calls inside the component
    (storageService.getAllUsers as any).mockReturnValue([{ id: 'user1', avatar: '' }]);
    (storageService.getCurrentUser as any).mockReturnValue({ id: 'user1', avatar: '' });

    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /account/i }));
    
    // The input is hidden, but we can select it by aria-label or type
    const input = screen.getByLabelText('Upload profile photo');
    
    // Trigger change
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(window.FileReader).toHaveBeenCalled();
    
    // Wait for the async operation
    await waitFor(() => {
        const avatar = screen.getByRole('img', { name: /profile/i });
        expect(avatar).toHaveAttribute('src', 'data:image/png;base64,fake');
    });
    
    // Restore
    window.FileReader = originalFileReader;
  });

  it('navigates on Enter in mobile search', () => {
    const handleNavigate = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} onNavigate={handleNavigate} searchTerm="test" />);

    fireEvent.click(screen.getByTitle('Search'));
    const input = screen.getAllByPlaceholderText(/try 'studio in lagos/i)[1];
    
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates on clicking result in mobile search', () => {
    const handleNavigate = vi.fn();
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} onNavigate={handleNavigate} searchTerm="test" />);

    fireEvent.click(screen.getByTitle('Search'));
    const resultBtn = screen.getByText(/See results for "test"/i);
    
    fireEvent.click(resultBtn);
    expect(handleNavigate).toHaveBeenCalledWith('home');
  });

  it('closes notification center when clicking outside', () => {
    renderWithProviders(<Navbar user={mockUser} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByTitle('Notifications'));
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
  });
});
