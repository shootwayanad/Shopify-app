'use client';

import { Card, Text, Box, Button, InlineStack } from '@shopify/polaris';

interface LandingPageCardProps {
    section: {
        id: string;
        name: string;
        preview_image_url: string;
        price: number;
        is_free: boolean;
    };
    onViewDetails?: (id: string) => void;
}

export function LandingPageCard({ section, onViewDetails }: LandingPageCardProps) {
    return (
        <div
            style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
            onClick={() => onViewDetails?.(section.id)}
        >
            {/* Price Badge */}
            <div
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: section.is_free ? '#fff' : '#fff',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1,
                }}
            >
                <Text as="span" variant="bodySm" fontWeight="semibold">
                    {section.is_free ? 'FREE' : `$${section.price}`}
                </Text>
            </div>

            {/* Preview Image */}
            <div
                style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    backgroundColor: '#f4f4f5',
                }}
            >
                {section.preview_image_url ? (
                    <img
                        src={section.preview_image_url}
                        alt={section.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            opacity: 0.15,
                        }}
                    >
                        📄
                    </div>
                )}
            </div>

            {/* Card Body */}
            <Box padding="300">
                <Text as="h3" variant="bodyMd" fontWeight="semibold">
                    {section.name}
                </Text>
            </Box>
        </div>
    );
}
