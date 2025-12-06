import React, { useState, useMemo } from 'react';
import { User, AdminRole, Permission, PERMISSIONS, DEFAULT_ADMIN_ROLES, PermissionCategory } from '@fiilar/types';
import { 
    Shield, Users, Search, Plus, Settings, UserPlus, Mail, 
    MoreHorizontal, Edit2, Trash2, CheckCircle, XCircle, Clock,
    ChevronDown, ChevronRight, AlertTriangle, Key, Crown, Eye,
    ShieldCheck, ShieldAlert, Copy, Send, X, UserCog
} from 'lucide-react';
import { cn } from '@fiilar/utils';
import { useToast } from '@fiilar/ui';
import { usePermissions } from './hooks/usePermissions';

type AssignRoleModalMode = 'assign' | 'change';

// Avatar component for admins
const AdminAvatar = ({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg'
    };
    
    if (user.avatar) {
        return <img src={user.avatar} alt={user.name} className={cn("rounded-full object-cover", sizeClasses[size])} />;
    }
    
    return (
        <div className={cn(
            "rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-indigo-400 to-indigo-600",
            sizeClasses[size]
        )}>
            {user.name?.charAt(0).toUpperCase() || user.firstName?.charAt(0).toUpperCase() || 'A'}
        </div>
    );
};

// Role badge component
const RoleBadge = ({ role }: { role: AdminRole }) => {
    const colorClasses: Record<string, string> = {
        red: 'bg-red-100 text-red-700 border-red-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const iconMap: Record<string, React.ReactNode> = {
        super_admin: <Crown size={12} />,
        admin: <ShieldCheck size={12} />,
        finance_admin: <Key size={12} />,
        support_admin: <Users size={12} />,
        content_admin: <Edit2 size={12} />,
        viewer: <Eye size={12} />,
    };

    return (
        <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
            colorClasses[role.color] || colorClasses.gray
        )}>
            {iconMap[role.id] || <Shield size={12} />}
            {role.displayName}
        </span>
    );
};

interface AdminRolesProps {
    users: User[];
    currentUser: User | null;
    onUpdateUserRole?: (userId: string, roleId: string | null) => Promise<boolean> | boolean;
    onInviteAdmin?: (email: string, roleId: string) => void;
    onRemoveAdmin?: (userId: string) => void;
    onSuspendAdmin?: (userId: string) => void;
}

type ViewMode = 'admins' | 'roles';

export const AdminRoles: React.FC<AdminRolesProps> = ({ 
    users, 
    currentUser,
    onUpdateUserRole,
    onInviteAdmin,
    onRemoveAdmin,
    onSuspendAdmin
}) => {
    const { showToast } = useToast();
    const { hasPermission, isSuperAdmin, canManageRole, allRoles } = usePermissions(currentUser);
    
    const [viewMode, setViewMode] = useState<ViewMode>('admins');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
    const [assignRoleModalMode, setAssignRoleModalMode] = useState<AssignRoleModalMode>('assign');
    const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
    const [assignRoleSearch, setAssignRoleSearch] = useState('');
    const [selectedRoleToAssign, setSelectedRoleToAssign] = useState<string>('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('support_admin');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['users', 'hosts', 'listings']);

    // Get admin users (those with adminRoleId)
    const adminUsers = useMemo(() => {
        return users.filter(u => u.role === 'ADMIN' || u.adminRoleId);
    }, [users]);

    // Get non-admin users (for role assignment)
    const nonAdminUsers = useMemo(() => {
        return users.filter(u => u.role !== 'ADMIN' && !u.adminRoleId);
    }, [users]);

    // Filter based on search
    const filteredAdmins = useMemo(() => {
        if (!searchTerm) return adminUsers;
        const term = searchTerm.toLowerCase();
        return adminUsers.filter(u => 
            u.name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term) ||
            u.firstName?.toLowerCase().includes(term) ||
            u.lastName?.toLowerCase().includes(term)
        );
    }, [adminUsers, searchTerm]);

    // Filter users for role assignment modal
    const filteredUsersForAssignment = useMemo(() => {
        if (!assignRoleSearch) return nonAdminUsers.slice(0, 10); // Show first 10 by default
        const term = assignRoleSearch.toLowerCase();
        return nonAdminUsers.filter(u => 
            u.name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term) ||
            u.firstName?.toLowerCase().includes(term) ||
            u.lastName?.toLowerCase().includes(term)
        ).slice(0, 20);
    }, [nonAdminUsers, assignRoleSearch]);

    // Group permissions by category
    const permissionsByCategory = useMemo(() => {
        const grouped: Record<PermissionCategory, Permission[]> = {
            users: [],
            hosts: [],
            listings: [],
            bookings: [],
            financials: [],
            disputes: [],
            system: [],
            reports: [],
        };
        PERMISSIONS.forEach(p => {
            grouped[p.category].push(p);
        });
        return grouped;
    }, []);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleInvite = () => {
        if (!inviteEmail || !inviteRole) {
            showToast({ message: 'Please enter email and select role', type: 'error' });
            return;
        }
        
        if (onInviteAdmin) {
            onInviteAdmin(inviteEmail, inviteRole);
            showToast({ message: `Invitation sent to ${inviteEmail}`, type: 'success' });
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('support_admin');
        }
    };

    const openAssignRoleModal = (mode: AssignRoleModalMode, user?: User) => {
        setAssignRoleModalMode(mode);
        if (mode === 'change' && user) {
            setSelectedUserForRole(user);
            setSelectedRoleToAssign(user.adminRoleId || '');
        } else {
            setSelectedUserForRole(null);
            setSelectedRoleToAssign('');
        }
        setAssignRoleSearch('');
        setShowAssignRoleModal(true);
    };

    const handleAssignRole = async () => {
        if (!selectedUserForRole || !selectedRoleToAssign) {
            showToast({ message: 'Please select a user and role', type: 'error' });
            return;
        }

        if (onUpdateUserRole) {
            const result = await onUpdateUserRole(selectedUserForRole.id, selectedRoleToAssign);
            if (result) {
                const roleName = allRoles.find(r => r.id === selectedRoleToAssign)?.displayName || selectedRoleToAssign;
                showToast({ 
                    message: `${getDisplayName(selectedUserForRole)} is now ${roleName}`, 
                    type: 'success' 
                });
                setShowAssignRoleModal(false);
                setSelectedUserForRole(null);
                setSelectedRoleToAssign('');
                setAssignRoleSearch('');
            }
        } else {
            showToast({ message: 'Role assignment not configured', type: 'error' });
        }
    };

    const handleRemoveRole = async (user: User) => {
        if (onUpdateUserRole) {
            const result = await onUpdateUserRole(user.id, null);
            if (result) {
                showToast({ 
                    message: `Removed admin role from ${getDisplayName(user)}`, 
                    type: 'success' 
                });
            }
        }
    };

    const getDisplayName = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.name || 'Unknown';
    };

    const getRoleForUser = (user: User): AdminRole | undefined => {
        return allRoles.find(r => r.id === user.adminRoleId);
    };

    const getRiskBadge = (level: string) => {
        const classes: Record<string, string> = {
            low: 'bg-green-100 text-green-700',
            medium: 'bg-amber-100 text-amber-700',
            high: 'bg-orange-100 text-orange-700',
            critical: 'bg-red-100 text-red-700',
        };
        return (
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium uppercase", classes[level])}>
                {level}
            </span>
        );
    };

    const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
        users: { label: 'Users', icon: <Users size={14} /> },
        hosts: { label: 'Hosts', icon: <Users size={14} /> },
        listings: { label: 'Listings', icon: <Settings size={14} /> },
        bookings: { label: 'Bookings', icon: <Clock size={14} /> },
        financials: { label: 'Financials', icon: <Key size={14} /> },
        disputes: { label: 'Disputes', icon: <AlertTriangle size={14} /> },
        system: { label: 'System', icon: <Shield size={14} /> },
        reports: { label: 'Reports', icon: <Eye size={14} /> },
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Roles & Permissions</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage admin users and their access levels</p>
                </div>
                
                {hasPermission('system.admins') && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openAssignRoleModal('assign')}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <UserCog size={16} />
                            Assign Role
                        </button>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <UserPlus size={16} />
                            Invite Admin
                        </button>
                    </div>
                )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                <button
                    onClick={() => setViewMode('admins')}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        viewMode === 'admins' 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-600 hover:text-gray-900"
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Users size={16} />
                        Admin Users ({adminUsers.length})
                    </span>
                </button>
                <button
                    onClick={() => setViewMode('roles')}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        viewMode === 'roles' 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-600 hover:text-gray-900"
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Shield size={16} />
                        Roles ({allRoles.length})
                    </span>
                </button>
            </div>

            {/* Content */}
            {viewMode === 'admins' ? (
                <div className="flex gap-6">
                    {/* Admin List */}
                    <div className="flex-1">
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search admins..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none"
                            />
                        </div>

                        {/* Admin Table */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Active</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                        <Users size={20} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-sm text-gray-500">No admin users found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmins.map((admin) => {
                                            const role = getRoleForUser(admin);
                                            const isCurrentUser = admin.id === currentUser?.id;
                                            
                                            return (
                                                <tr key={admin.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <AdminAvatar user={admin} size="sm" />
                                                            <div>
                                                                <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                                                    {getDisplayName(admin)}
                                                                    {isCurrentUser && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">You</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{admin.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {role ? <RoleBadge role={role} /> : (
                                                            <span className="text-xs text-gray-400">No role assigned</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                            admin.adminStatus === 'active' || !admin.adminStatus ? "bg-green-100 text-green-700" :
                                                            admin.adminStatus === 'suspended' ? "bg-red-100 text-red-700" :
                                                            "bg-amber-100 text-amber-700"
                                                        )}>
                                                            {admin.adminStatus === 'active' || !admin.adminStatus ? (
                                                                <><CheckCircle size={10} /> Active</>
                                                            ) : admin.adminStatus === 'suspended' ? (
                                                                <><XCircle size={10} /> Suspended</>
                                                            ) : (
                                                                <><Clock size={10} /> Pending</>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {admin.adminLastActiveAt 
                                                            ? new Date(admin.adminLastActiveAt).toLocaleDateString()
                                                            : 'Never'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {!isCurrentUser && hasPermission('system.admins') && (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => openAssignRoleModal('change', admin)}
                                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                                    title="Change role"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => onSuspendAdmin?.(admin.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                                    title="Suspend"
                                                                >
                                                                    <ShieldAlert size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveRole(admin)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Remove admin role"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Roles View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Role List */}
                    <div className="lg:col-span-1 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Roles</h3>
                        {allRoles.map((role) => (
                            <div
                                key={role.id}
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all",
                                    selectedRole?.id === role.id 
                                        ? "border-gray-300 bg-gray-50" 
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <RoleBadge role={role} />
                                    {role.isSystem && (
                                        <span className="text-[10px] text-gray-400 font-medium">SYSTEM</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{role.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {role.permissions.length} permissions
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Priority: {role.priority}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {hasPermission('system.roles') && (
                            <button className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                                <Plus size={16} />
                                Create Custom Role
                            </button>
                        )}
                    </div>

                    {/* Permission Details */}
                    <div className="lg:col-span-2">
                        {selectedRole ? (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{selectedRole.displayName}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{selectedRole.description}</p>
                                        </div>
                                        {hasPermission('system.roles') && !selectedRole.isSystem && (
                                            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                                                <Edit2 size={14} />
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 max-h-[500px] overflow-y-auto">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h4>
                                    <div className="space-y-2">
                                        {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                                            const hasAnyInCategory = permissions.some(p => selectedRole.permissions.includes(p.id));
                                            const allInCategory = permissions.every(p => selectedRole.permissions.includes(p.id));
                                            const isExpanded = expandedCategories.includes(category);
                                            const catInfo = categoryLabels[category];

                                            return (
                                                <div key={category} className="border border-gray-100 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => toggleCategory(category)}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">{catInfo?.icon}</span>
                                                            <span className="font-medium text-gray-900 text-sm capitalize">{catInfo?.label || category}</span>
                                                            <span className={cn(
                                                                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                                                allInCategory ? "bg-green-100 text-green-700" :
                                                                hasAnyInCategory ? "bg-amber-100 text-amber-700" :
                                                                "bg-gray-100 text-gray-500"
                                                            )}>
                                                                {permissions.filter(p => selectedRole.permissions.includes(p.id)).length}/{permissions.length}
                                                            </span>
                                                        </div>
                                                        {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="border-t border-gray-100 p-3 bg-gray-50/50 space-y-2">
                                                            {permissions.map((permission) => {
                                                                const hasPermission = selectedRole.permissions.includes(permission.id);
                                                                return (
                                                                    <div key={permission.id} className="flex items-center justify-between py-1.5">
                                                                        <div className="flex items-center gap-2">
                                                                            {hasPermission ? (
                                                                                <CheckCircle size={14} className="text-green-500" />
                                                                            ) : (
                                                                                <XCircle size={14} className="text-gray-300" />
                                                                            )}
                                                                            <div>
                                                                                <span className={cn("text-sm", hasPermission ? "text-gray-900" : "text-gray-400")}>
                                                                                    {permission.name}
                                                                                </span>
                                                                                <p className="text-xs text-gray-400">{permission.description}</p>
                                                                            </div>
                                                                        </div>
                                                                        {getRiskBadge(permission.riskLevel)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 h-full min-h-[400px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Shield size={20} className="text-gray-400" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Select a Role</h3>
                                    <p className="text-sm text-gray-500">Click on a role to view its permissions</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowInviteModal(false);
                    }}
                >
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Invite Admin</h3>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none bg-white"
                                >
                                    {allRoles.filter(r => canManageRole(r.id)).map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={!inviteEmail}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send size={14} />
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Role Modal */}
            {showAssignRoleModal && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowAssignRoleModal(false);
                    }}
                >
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
                        {/* Header - Fixed */}
                        <div className="p-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {assignRoleModalMode === 'change' ? 'Change Role' : 'Assign Admin Role'}
                                </h3>
                                <button
                                    onClick={() => setShowAssignRoleModal(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* User Selection (only for assign mode) */}
                            {assignRoleModalMode === 'assign' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">User</label>
                                    <div className="relative mb-2">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={assignRoleSearch}
                                            onChange={(e) => setAssignRoleSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none"
                                        />
                                    </div>
                                    <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg">
                                        {filteredUsersForAssignment.length === 0 ? (
                                            <div className="p-3 text-center text-xs text-gray-500">
                                                {assignRoleSearch ? 'No users found' : 'Start typing to search'}
                                            </div>
                                        ) : (
                                            filteredUsersForAssignment.map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => setSelectedUserForRole(
                                                        selectedUserForRole?.id === user.id ? null : user
                                                    )}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0",
                                                        selectedUserForRole?.id === user.id && "bg-blue-50"
                                                    )}
                                                >
                                                    <AdminAvatar user={user} size="sm" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-gray-900 truncate">
                                                            {getDisplayName(user)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                    </div>
                                                    {selectedUserForRole?.id === user.id && (
                                                        <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Selected User Display (for change mode) */}
                            {assignRoleModalMode === 'change' && selectedUserForRole && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <AdminAvatar user={selectedUserForRole} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900">{getDisplayName(selectedUserForRole)}</div>
                                        <div className="text-xs text-gray-500">{selectedUserForRole.email}</div>
                                    </div>
                                </div>
                            )}

                            {/* Role Selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {allRoles.filter(r => canManageRole(r.id)).map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => setSelectedRoleToAssign(
                                                selectedRoleToAssign === role.id ? '' : role.id
                                            )}
                                            className={cn(
                                                "p-2.5 rounded-lg border text-left transition-all",
                                                selectedRoleToAssign === role.id 
                                                    ? "border-blue-400 bg-blue-50 ring-1 ring-blue-400" 
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-900">{role.displayName}</span>
                                                {selectedRoleToAssign === role.id && (
                                                    <CheckCircle size={14} className="text-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 line-clamp-2">{role.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50 flex-shrink-0">
                            <button
                                onClick={() => setShowAssignRoleModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignRole}
                                disabled={!selectedUserForRole || !selectedRoleToAssign}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {assignRoleModalMode === 'change' ? 'Update' : 'Assign Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoles;
