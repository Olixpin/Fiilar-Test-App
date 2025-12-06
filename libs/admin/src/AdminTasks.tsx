import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Search, Plus, Calendar, User, X } from 'lucide-react';
import { Button } from '@fiilar/ui';
import { cn } from '@fiilar/utils';

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
    assignee?: string;
    createdAt: string;
}

type TabType = 'all' | 'pending' | 'in_progress' | 'completed';

// Mock data for demonstration
const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Review pending KYC verifications',
        description: 'Check and approve or reject pending identity verification requests',
        priority: 'high',
        status: 'pending',
        dueDate: new Date().toISOString(),
        assignee: 'Admin',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '2',
        title: 'Process host payouts',
        description: 'Release escrow funds to verified hosts',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        assignee: 'Admin',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: '3',
        title: 'Update platform documentation',
        description: 'Review and update help documentation for new features',
        priority: 'low',
        status: 'completed',
        assignee: 'Admin',
        createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
    {
        id: '4',
        title: 'Resolve open disputes',
        description: 'Review and make decisions on open booking disputes',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        assignee: 'Admin',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
];

export const AdminTasks: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [tasks] = useState<Task[]>(mockTasks);

    const getFilteredTasks = () => {
        let filtered = tasks;

        switch (activeTab) {
            case 'pending':
                filtered = tasks.filter(t => t.status === 'pending');
                break;
            case 'in_progress':
                filtered = tasks.filter(t => t.status === 'in_progress');
                break;
            case 'completed':
                filtered = tasks.filter(t => t.status === 'completed');
                break;
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(search) ||
                t.description?.toLowerCase().includes(search)
            );
        }

        return filtered;
    };

    const filteredTasks = getFilteredTasks();

    useEffect(() => {
        if (filteredTasks.length > 0 && !selectedTask) {
            setSelectedTask(filteredTasks[0]);
        }
    }, [filteredTasks, selectedTask]);

    const tabs = [
        { id: 'all' as TabType, label: 'All Tasks', count: tasks.length },
        { id: 'pending' as TabType, label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
        { id: 'in_progress' as TabType, label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
        { id: 'completed' as TabType, label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
    ];

    const getPriorityBadge = (priority: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            'high': { bg: 'bg-red-100', text: 'text-red-700' },
            'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            'low': { bg: 'bg-green-100', text: 'text-green-700' },
        };
        const c = config[priority] || { bg: 'bg-gray-100', text: 'text-gray-700' };
        return (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", c.bg, c.text)}>
                {priority}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'in_progress':
                return <Clock size={16} className="text-blue-600" />;
            default:
                return <Circle size={16} className="text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            'pending': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
            'in_progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
            'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
        };
        const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        return (
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", c.bg, c.text)}>
                {c.label}
            </span>
        );
    };

    return (
        <div className="flex h-[calc(100vh-180px)] gap-6">
            {/* Left Panel - Task List */}
            <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                        <Button variant="primary" size="sm" className="h-8">
                            <Plus size={14} className="mr-1" />
                            New Task
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500">Manage admin tasks and assignments</p>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 border-b border-gray-100">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedTask(null); }}
                                className={cn(
                                    "px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all",
                                    activeTab === tab.id
                                        ? "border-brand-500 text-brand-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                                    activeTab === tab.id ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-600"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No tasks found</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className={cn(
                                    "p-4 border-b border-gray-100 cursor-pointer transition-all border-l-2",
                                    selectedTask?.id === task.id
                                        ? "bg-gray-100 border-l-gray-400"
                                        : "border-l-transparent hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        {getStatusIcon(task.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900 text-sm truncate">{task.title}</h4>
                                            {getPriorityBadge(task.priority)}
                                        </div>
                                        {task.description && (
                                            <p className="text-xs text-gray-500 truncate mb-2">{task.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            {task.dueDate && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {task.assignee && (
                                                <span className="flex items-center gap-1">
                                                    <User size={12} />
                                                    {task.assignee}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Task Detail */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                {selectedTask ? (
                    <div className="flex-1 overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {getStatusIcon(selectedTask.status)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{selectedTask.title}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            {getStatusBadge(selectedTask.status)}
                                            {getPriorityBadge(selectedTask.priority)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Description */}
                            {selectedTask.description && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                                </div>
                            )}

                            {/* Details */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4">Details</h4>
                                <div className="space-y-3">
                                    {selectedTask.assignee && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Assignee</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{selectedTask.assignee}</span>
                                        </div>
                                    )}
                                    {selectedTask.dueDate && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Due Date</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">Created</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(selectedTask.createdAt).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedTask.status !== 'completed' && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Actions</h4>
                                    <div className="flex gap-3">
                                        {selectedTask.status === 'pending' && (
                                            <Button variant="primary" className="flex-1">
                                                <Clock size={16} className="mr-2" />
                                                Start Task
                                            </Button>
                                        )}
                                        {selectedTask.status === 'in_progress' && (
                                            <Button variant="primary" className="flex-1">
                                                <CheckCircle size={16} className="mr-2" />
                                                Mark Complete
                                            </Button>
                                        )}
                                        <Button variant="outline">
                                            Edit Task
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedTask.status === 'completed' && (
                                <div className="bg-green-50 rounded-xl p-6 border border-green-200 text-center">
                                    <CheckCircle size={32} className="text-green-600 mx-auto mb-3" />
                                    <h4 className="font-semibold text-green-800">Task Completed</h4>
                                    <p className="text-sm text-green-600 mt-1">This task has been successfully completed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={28} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Task</h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            Choose a task from the list to view details, update status, or make changes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTasks;
