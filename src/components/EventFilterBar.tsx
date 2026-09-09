'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface EventFilterBarProps {
    categories: string[];
    tags: string[];
}

export default function EventFilterBar({ categories, tags }: EventFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch    = searchParams.get('search') || '';
    const currentCategory  = searchParams.get('category') || '';
    const currentTag       = searchParams.get('tag') || '';
    const currentTimeframe = searchParams.get('timeframe') || '';

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
    const hasActiveFilters = currentSearch || currentCategory || currentTag || currentTimeframe;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* Search */}
            <div className="search-wrapper" style={{ flex: '1', minWidth: '200px', maxWidth: '320px' }}>
                <Search className="search-icon" />
                <input
                    id="event-search-input"
                    type="text"
                    defaultValue={currentSearch}
                    placeholder="Search by title..."
                    className="aws-input aws-search-input"
                    onChange={e => updateParam('search', e.target.value)}
                />
            </div>

            {/* Timeframe */}
            <select
                id="timeframe-filter-select"
                value={currentTimeframe}
                onChange={e => updateParam('timeframe', e.target.value)}
                className="field-select"
                style={{ width: '140px' }}
            >
                <option value="">All dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
            </select>

            {/* Category */}
            <select
                id="category-filter-select"
                value={currentCategory}
                onChange={e => updateParam('category', e.target.value)}
                className="field-select"
                style={{ width: '150px' }}
            >
                <option value="">All categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {/* Tag */}
            <select
                id="tag-filter-select"
                value={currentTag}
                onChange={e => updateParam('tag', e.target.value)}
                className="field-select"
                style={{ width: '130px' }}
            >
                <option value="">All tags</option>
                {tags.map(tag => <option key={tag} value={tag}>#{tag}</option>)}
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
