'use client';

import { Box, Text } from '@shopify/polaris';
import { LandingPageCard } from './LandingPageCard';

interface Section {
    id: string;
    name: string;
    preview_image_url: string;
    price: number;
    is_free: boolean;
}

interface SectionShowcaseProps {
    title: string;
    sections: Section[];
    onViewDetails?: (id: string) => void;
}

export function SectionShowcase({ title, sections, onViewDetails }: SectionShowcaseProps) {
    return (
        <Box paddingBlockEnd="600">
            <Box paddingBlockEnd="400">
                <Text as="h2" variant="headingLg" fontWeight="bold">
                    {title}
                </Text>
            </Box>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px',
                }}
            >
                {sections.map((section) => (
                    <LandingPageCard
                        key={section.id}
                        section={section}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        </Box>
    );
}
