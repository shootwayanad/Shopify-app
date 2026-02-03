'use client';

import { InlineStack, Box, Button, Text } from '@shopify/polaris';
import {
    StarFilledIcon,
    ChartVerticalIcon,
    MagicIcon,
    DiscountIcon,
    AppsIcon,
    NoteIcon,
    ArrowRightIcon,
    ImageIcon,
    PlayIcon,
    ClockIcon,
    CameraIcon,
    CodeIcon,
} from '@shopify/polaris-icons';

interface CategoryIconGridProps {
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
}

const categories = [
    { id: 'popular', label: 'Popular', icon: StarFilledIcon },
    { id: 'trending', label: 'Trending', icon: ChartVerticalIcon },
    { id: 'newest', label: 'Newest', icon: MagicIcon },
    { id: 'free', label: 'Free', icon: DiscountIcon },
    { id: 'features', label: 'Features', icon: AppsIcon },
    { id: 'testimonial', label: 'Testimonial', icon: NoteIcon },
    { id: 'scrolling', label: 'Scrolling', icon: ArrowRightIcon },
    { id: 'hero', label: 'Hero', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: PlayIcon },
    { id: 'countdown', label: 'Countdown', icon: ClockIcon },
    { id: 'images', label: 'Images', icon: CameraIcon },
    { id: 'snippet', label: 'Snippet', icon: CodeIcon },
];

export function CategoryIconGrid({ selectedCategory, onCategorySelect }: CategoryIconGridProps) {
    return (
        <Box paddingBlock="400">
            <div
                style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBlock: '8px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            minWidth: '80px',
                            padding: '8px',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: selectedCategory === category.id ? '#2c6ecb' : '#f6f6f7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ color: selectedCategory === category.id ? '#fff' : '#202223' }}>
                                <category.icon />
                            </div>
                        </div>
                        <Text
                            as="span"
                            variant="bodySm"
                            fontWeight={selectedCategory === category.id ? 'semibold' : 'regular'}
                        >
                            {category.label}
                        </Text>
                    </button>
                ))}
            </div>
        </Box>
    );
}
