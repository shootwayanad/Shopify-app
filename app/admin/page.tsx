'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Page,
    Card,
    IndexTable,
    Button,
    Text,
    Box,
    InlineStack,
    Modal,
    TextField,
    Select,
    Checkbox,
    FormLayout,
    Toast,
    Frame,
    Spinner,
    BlockStack,
    Badge,
    Layout,
    EmptyState,
    Icon,
    Grid
} from '@shopify/polaris';
import {
    PlusIcon,
    EditIcon,
    DeleteIcon,
    AppsIcon,
    StarIcon,
    ImportIcon,
    SearchIcon
} from '@shopify/polaris-icons';

interface Section {
    id: string;
    name: string;
    description: string;
    category_id: string;
    is_free: boolean;
    price: number;
    downloads_count: number;
    is_active: boolean;
    liquid_code: string;
    schema_json: string | object;
    css_code: string;
    js_code: string;
    preview_image_url: string;
    categories: {
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function AdminDashboard() {
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState({ total: 0, free: 0, paid: 0, installs: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        price: 0,
        is_free: true,
        liquid_code: '',
        schema_json: '',
        css_code: '',
        js_code: '',
        preview_image_url: '',
    });

    const [schemaError, setSchemaError] = useState<string | null>(null);

    const fetchSections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/sections');
            const data = await res.json();
            setSections(data.sections || []);

            const total = data.sections?.length || 0;
            const free = data.sections?.filter((s: Section) => s.is_free).length || 0;
            const installs = data.sections?.reduce((sum: number, s: Section) => sum + s.downloads_count, 0) || 0;

            setStats({ total, free, paid: total - free, installs });
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchSections();
        fetchCategories();
    }, [fetchSections, fetchCategories]);

    const handleCreateSection = () => {
        setEditingSection(null);
        setFormData({
            name: '',
            description: '',
            category_id: categories[0]?.id || '',
            price: 0,
            is_free: true,
            liquid_code: '',
            schema_json: '',
            css_code: '',
            js_code: '',
            preview_image_url: '',
        });
        setIsModalOpen(true);
    };

    const handleEditSection = (section: Section) => {
        setEditingSection(section);
        setFormData({
            name: section.name,
            description: section.description || '',
            category_id: section.category_id,
            price: section.price,
            is_free: section.is_free,
            liquid_code: section.liquid_code,
            schema_json: typeof section.schema_json === 'string'
                ? section.schema_json
                : JSON.stringify(section.schema_json, null, 2),
            css_code: section.css_code || '',
            js_code: section.js_code || '',
            preview_image_url: section.preview_image_url || '',
        });
        setIsModalOpen(true);
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;

        try {
            const res = await fetch(`/api/admin/sections?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setToastMessage('Section deleted successfully');
                fetchSections();
            } else {
                setToastMessage('Failed to delete section');
            }
        } catch (error) {
            setToastMessage('Error deleting section');
        }
    };

    const handleModalSubmit = async () => {
        // Simple schema validation
        try {
            JSON.parse(formData.schema_json);
            setSchemaError(null);
        } catch (e) {
            setSchemaError('Invalid JSON schema');
            return;
        }

        setFormLoading(true);
        try {
            const url = '/api/admin/sections';
            const method = editingSection ? 'PUT' : 'POST';
            const body = editingSection ? { ...formData, id: editingSection.id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setToastMessage(editingSection ? 'Section updated' : 'Section created');
                setIsModalOpen(false);
                fetchSections();
            } else {
                setToastMessage('Failed to save section');
            }
        } catch (error) {
            setToastMessage('Error saving section');
        } finally {
            setFormLoading(false);
        }
    };

    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

    const resourceName = { singular: 'section', plural: 'sections' };

    const rows = sections.map((section, index) => (
        <IndexTable.Row id={section.id} key={section.id} position={index}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">{section.name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{section.categories?.name || 'Uncategorized'}</IndexTable.Cell>
            <IndexTable.Cell>
                {section.is_free ? (
                    <Badge tone="success">Free</Badge>
                ) : (
                    <Text as="span" variant="bodyMd">${section.price}</Text>
                )}
            </IndexTable.Cell>
            <IndexTable.Cell>{section.downloads_count}</IndexTable.Cell>
            <IndexTable.Cell>
                <Badge tone={section.is_active ? 'success' : 'attention'}>
                    {section.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <InlineStack gap="200">
                    <Button icon={EditIcon} onClick={() => handleEditSection(section)} size="slim" />
                    <Button icon={DeleteIcon} tone="critical" onClick={() => handleDeleteSection(section.id)} size="slim" />
                </InlineStack>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Frame>
            <Page
                title="Admin Dashboard"
                subtitle="Manage your section library"
                primaryAction={{
                    content: 'Create Section',
                    icon: PlusIcon,
                    onAction: handleCreateSection
                }}
            >
                {/* Stats Row */}
                <Box paddingBlockEnd="600">
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <Card>
                                <Box padding="400">
                                    <InlineStack align="space-between">
                                        <BlockStack gap="100">
                                            <Text as="p" variant="bodySm" tone="subdued">Total Sections</Text>
                                            <Text as="p" variant="headingLg">{stats.total}</Text>
                                        </BlockStack>
                                        <Icon source={AppsIcon} tone="info" />
                                    </InlineStack>
                                </Box>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <Card>
                                <Box padding="400">
                                    <InlineStack align="space-between">
                                        <BlockStack gap="100">
                                            <Text as="p" variant="bodySm" tone="subdued">Free Sections</Text>
                                            <Text as="p" variant="headingLg">{stats.free}</Text>
                                        </BlockStack>
                                        <Icon source={StarIcon} tone="success" />
                                    </InlineStack>
                                </Box>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <Card>
                                <Box padding="400">
                                    <InlineStack align="space-between">
                                        <BlockStack gap="100">
                                            <Text as="p" variant="bodySm" tone="subdued">Paid Sections</Text>
                                            <Text as="p" variant="headingLg">{stats.paid}</Text>
                                        </BlockStack>
                                        <Icon source={AppsIcon} tone="warning" />
                                    </InlineStack>
                                </Box>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
                            <Card>
                                <Box padding="400">
                                    <InlineStack align="space-between">
                                        <BlockStack gap="100">
                                            <Text as="p" variant="bodySm" tone="subdued">Total Installs</Text>
                                            <Text as="p" variant="headingLg">{stats.installs}</Text>
                                        </BlockStack>
                                        <Icon source={ImportIcon} tone="info" />
                                    </InlineStack>
                                </Box>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </Box>

                {/* Main Table */}
                <Card padding="0">
                    {loading ? (
                        <Box padding="1000">
                            <BlockStack align="center" inlineAlign="center">
                                <Spinner size="large" />
                            </BlockStack>
                        </Box>
                    ) : sections.length === 0 ? (
                        <EmptyState
                            heading="No sections yet"
                            action={{ content: 'Create your first section', onAction: handleCreateSection }}
                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        >
                            <p>Upload your Liquid code and schema to start selling sections.</p>
                        </EmptyState>
                    ) : (
                        <IndexTable
                            resourceName={resourceName}
                            itemCount={sections.length}
                            selectable={false}
                            headings={[
                                { title: 'Name' },
                                { title: 'Category' },
                                { title: 'Price' },
                                { title: 'Installs' },
                                { title: 'Status' },
                                { title: 'Actions' },
                            ]}
                        >
                            {rows}
                        </IndexTable>
                    )}
                </Card>

                {/* Create/Edit Modal */}
                <Modal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingSection ? 'Edit Section' : 'Create Section'}
                    primaryAction={{
                        content: editingSection ? 'Update Section' : 'Add Section',
                        onAction: handleModalSubmit,
                        loading: formLoading
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => setIsModalOpen(false),
                        },
                    ]}
                >
                    <Modal.Section>
                        <FormLayout>
                            <TextField
                                label="Section Name"
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                autoComplete="off"
                            />
                            <Select
                                label="Category"
                                options={categoryOptions}
                                value={formData.category_id}
                                onChange={(val) => setFormData({ ...formData, category_id: val })}
                            />
                            <TextField
                                label="Description"
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                multiline={3}
                                autoComplete="off"
                            />
                            <TextField
                                label="Preview Image URL"
                                value={formData.preview_image_url}
                                onChange={(val) => setFormData({ ...formData, preview_image_url: val })}
                                autoComplete="off"
                            />
                            <TextField
                                label="Liquid Code"
                                value={formData.liquid_code}
                                onChange={(val) => setFormData({ ...formData, liquid_code: val })}
                                multiline={8}
                                autoComplete="off"
                            />
                            <TextField
                                label="Schema JSON"
                                value={formData.schema_json}
                                onChange={(val) => setFormData({ ...formData, schema_json: val })}
                                multiline={8}
                                autoComplete="off"
                                error={schemaError || undefined}
                            />
                            <FormLayout.Group>
                                <TextField
                                    label="CSS (Optional)"
                                    value={formData.css_code}
                                    onChange={(val) => setFormData({ ...formData, css_code: val })}
                                    multiline={4}
                                    autoComplete="off"
                                />
                                <TextField
                                    label="JS (Optional)"
                                    value={formData.js_code}
                                    onChange={(val) => setFormData({ ...formData, js_code: val })}
                                    multiline={4}
                                    autoComplete="off"
                                />
                            </FormLayout.Group>
                            <InlineStack gap="400" align="start">
                                <Checkbox
                                    label="Free Section"
                                    checked={formData.is_free}
                                    onChange={(val) => setFormData({ ...formData, is_free: val })}
                                />
                                {!formData.is_free && (
                                    <TextField
                                        label="Price ($)"
                                        type="number"
                                        value={String(formData.price)}
                                        onChange={(val) => setFormData({ ...formData, price: parseFloat(val) || 0 })}
                                        autoComplete="off"
                                        prefix="$"
                                    />
                                )}
                            </InlineStack>
                        </FormLayout>
                    </Modal.Section>
                </Modal>

                {toastMessage && (
                    <Toast content={toastMessage} onDismiss={() => setToastMessage(null)} />
                )}
            </Page>
        </Frame>
    );
}
