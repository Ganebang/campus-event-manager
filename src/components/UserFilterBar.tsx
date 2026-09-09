'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface UserFilterBarProps {
    departments: string[];
}

const ROLES = ['student', 'faculty', 'staff'];

export default function UserFilterBar({ departments }: UserFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch     = searchParams.get('search') || '';
    const currentDepartment = searchParams.get('department') || '';
    const currentRole       = searchParams.get('role') || '';

    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) params.set(key, value);
            else params.delete(key);
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const clearAllFilters = () => router.push(pathname);
    const hasActiveFilters = currentSearch || currentDepartment || currentRole;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* Search */}
            <div className="search-wrapper" style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }}>
                <Search className="search-icon" />
                <input
                    id="user-search-input"
                    type="text"
                    defaultValue={currentSearch}
                    placeholder="Search by name or email..."
                    className="aws-input aws-search-input"
                    onChange={e => updateParam('search', e.target.value)}
                />
            </div>

            {/* Role filter */}
            <select
                id="role-filter-select"
                value={currentRole}
                onChange={e => updateParam('role', e.target.value)}
                className="field-select"
                style={{ width: '130px' }}
            >
                <option value="">All roles</option>
                {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>

            {/* Department filter */}
            <select
                id="department-filter-select"
                value={currentDepartment}
                onChange={e => updateParam('department', e.target.value)}
                className="field-select"
                style={{ width: '220px' }}
            >
                <option value="">All departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>

            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <X size={13} /> Clear
                </button>
            )}
        </div>
    );
}
