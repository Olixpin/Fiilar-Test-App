import React, { useState, useRef } from 'react';
import { 
    Settings, 
    Bell, 
    Shield, 
    User, 
    Globe,
    Moon,
    Sun,
    Save,
    Check,
    Upload
} from 'lucide-react';
import { cn } from '@fiilar/utils';
import { Button, useToast } from '@fiilar/ui';

interface SettingSection {
    id: string;
    label: string;
    icon: React.ElementType;
}

const settingSections: SettingSection[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Moon },
];

export const AdminSettings: React.FC = () => {
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = useState('profile');
    const [saved, setSaved] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    
    // Settings state
    const [notifyNewUsers, setNotifyNewUsers] = useState(true);
    const [notifyDisputes, setNotifyDisputes] = useState(true);
    const [notifyListings, setNotifyListings] = useState(true);
    const [notifyPayouts, setNotifyPayouts] = useState(false);
    const [emailSummary, setEmailSummary] = useState('daily');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

    const handleSave = () => {
        // TODO: Save settings to backend
        setSaved(true);
        showToast({ message: 'Settings saved successfully', type: 'success' });
        setTimeout(() => setSaved(false), 2000);
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                showToast({ message: 'File size must be less than 2MB', type: 'error' });
                return;
            }
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                showToast({ message: 'Please upload a JPG, PNG, or GIF image', type: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result as string);
                showToast({ message: 'Profile photo updated', type: 'success' });
            };
            reader.readAsDataURL(file);
        }
    };

    const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (v: boolean) => void; label: string }> = ({ enabled, onChange, label }) => (
        <button
            type="button"
            title={label}
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                enabled ? "bg-brand-500" : "bg-gray-200"
            )}
        >
            <span 
                className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                    enabled ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Admin Profile</h3>
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={handlePhotoChange}
                                className="hidden"
                                id="profile-photo-input"
                                aria-label="Upload profile photo"
                            />
                            <label htmlFor="profile-photo-input" className="sr-only">Upload profile photo</label>
                            <button
                                type="button"
                                onClick={handlePhotoClick}
                                className="flex items-center gap-4 mb-6 group cursor-pointer w-full text-left hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                            >
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden relative group-hover:ring-2 group-hover:ring-brand-500/30 transition-all">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-gray-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload size={20} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-brand-500 group-hover:text-brand-600">
                                        Change photo
                                    </span>
                                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input 
                                        id="firstName"
                                        type="text" 
                                        defaultValue="Admin" 
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input 
                                        id="lastName"
                                        type="text" 
                                        defaultValue="User" 
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input 
                                        id="email"
                                        type="email" 
                                        defaultValue="admin@fiilar.com" 
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <input 
                                        id="role"
                                        type="text" 
                                        value="Super Admin" 
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Push Notifications</h3>
                            <p className="text-xs text-gray-500 mb-4">Configure which notifications you receive</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New User Registrations</p>
                                        <p className="text-xs text-gray-500">Get notified when new users sign up</p>
                                    </div>
                                    <ToggleSwitch enabled={notifyNewUsers} onChange={setNotifyNewUsers} label="Toggle new user registration notifications" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Dispute Alerts</p>
                                        <p className="text-xs text-gray-500">Notify when disputes are opened</p>
                                    </div>
                                    <ToggleSwitch enabled={notifyDisputes} onChange={setNotifyDisputes} label="Toggle dispute alert notifications" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Listing Submissions</p>
                                        <p className="text-xs text-gray-500">Notify when listings need review</p>
                                    </div>
                                    <ToggleSwitch enabled={notifyListings} onChange={setNotifyListings} label="Toggle listing submission notifications" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Payout Processing</p>
                                        <p className="text-xs text-gray-500">Notify when payouts are processed</p>
                                    </div>
                                    <ToggleSwitch enabled={notifyPayouts} onChange={setNotifyPayouts} label="Toggle payout processing notifications" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Email Digest</h3>
                            <p className="text-xs text-gray-500 mb-4">How often to receive email summaries</p>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {['daily', 'weekly', 'never'].map((freq) => (
                                    <button
                                        key={freq}
                                        onClick={() => setEmailSummary(freq)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-colors",
                                            emailSummary === freq 
                                                ? "border-brand-500 bg-brand-50 text-brand-600" 
                                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        {freq}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            
            case 'security':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Password</h3>
                            <p className="text-xs text-gray-500 mb-4">Change your password</p>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input 
                                        type="password" 
                                        placeholder="Enter current password"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input 
                                        type="password" 
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Two-Factor Authentication</h3>
                            <p className="text-xs text-gray-500 mb-4">Add an extra layer of security to your account</p>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        twoFactorEnabled ? "bg-green-100" : "bg-gray-200"
                                    )}>
                                        <Shield size={20} className={twoFactorEnabled ? "text-green-600" : "text-gray-500"} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {twoFactorEnabled ? 'Your account is protected' : 'Enable for better security'}
                                        </p>
                                    </div>
                                </div>
                                <Button 
                                    variant={twoFactorEnabled ? "ghost" : "primary"}
                                    size="sm"
                                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                >
                                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Active Sessions</h3>
                            <p className="text-xs text-gray-500 mb-4">Manage your active login sessions</p>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Current Session</p>
                                            <p className="text-xs text-gray-500">Chrome on macOS · Lagos, Nigeria</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Theme</h3>
                            <p className="text-xs text-gray-500 mb-4">Choose your preferred color scheme</p>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                                        theme === 'light' 
                                            ? "border-brand-500 bg-brand-50" 
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                    )}
                                >
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                        <Sun size={20} className="text-yellow-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                                        theme === 'dark' 
                                            ? "border-brand-500 bg-brand-50" 
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                    )}
                                >
                                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                                        <Moon size={20} className="text-gray-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                                        theme === 'system' 
                                            ? "border-brand-500 bg-brand-50" 
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                    )}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-900 rounded-lg flex items-center justify-center border border-gray-200">
                                        <Globe size={20} className="text-gray-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">System</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label htmlFor="language" className="block text-sm font-semibold text-gray-900 mb-1">Language</label>
                            <p className="text-xs text-gray-500 mb-4">Select your preferred language</p>
                            
                            <select id="language" aria-label="Select language" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="yo">Yorùbá</option>
                                <option value="ig">Igbo</option>
                                <option value="ha">Hausa</option>
                            </select>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-56 border-r border-gray-100 p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Settings size={20} />
                            Settings
                        </h2>
                        <nav className="space-y-1">
                            {settingSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                        activeSection === section.id 
                                            ? "bg-brand-50 text-brand-600" 
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <section.icon size={18} />
                                    <span className="text-sm font-medium">{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                        {renderContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                    {saved && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                            <Check size={16} />
                            Changes saved
                        </div>
                    )}
                    <Button variant="ghost" size="sm">
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        <Save size={16} className="mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
