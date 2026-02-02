'use client';

import { useState } from 'react';

interface Category {
    id: string;
    name: string;
}

interface SectionFormProps {
    categories: Category[];
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SectionForm({ categories, initialData, onClose, onSuccess }: SectionFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category_id: initialData?.category_id || (categories[0]?.id || ''),
        price: initialData?.price || 0,
        is_free: initialData?.is_free ?? true,
        liquid_code: initialData?.liquid_code || '',
        schema_json: initialData?.schema_json || '',
        css_code: initialData?.css_code || '',
        js_code: initialData?.js_code || '',
        preview_image_url: initialData?.preview_image_url || '',
    });

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const url = '/api/admin/sections';
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData ? { ...formData, id: initialData.id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save section');

            alert('✅ Section saved successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            alert('❌ Error saving section');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-[hsl(var(--color-surface))]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold gradient-text">
                        {initialData ? 'Edit Section' : 'Create New Section'}
                    </h2>
                    <button onClick={onClose} className="text-[hsl(var(--color-text-muted))] hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Section Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-2 rounded-lg bg-black/20 border border-[hsl(var(--color-border))]"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full p-2 rounded-lg bg-black/20 border border-[hsl(var(--color-border))]"
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Is Free?</label>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-[hsl(var(--color-primary))]"
                                        checked={formData.is_free}
                                        onChange={e => setFormData({ ...formData, is_free: e.target.checked })}
                                    />
                                </div>
                                {!formData.is_free && (
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-2 rounded-lg bg-black/20 border border-[hsl(var(--color-border))]"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Preview Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full p-2 rounded-lg bg-black/20 border border-[hsl(var(--color-border))]"
                                    value={formData.preview_image_url}
                                    onChange={e => setFormData({ ...formData, preview_image_url: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                rows={8}
                                className="w-full p-2 rounded-lg bg-black/20 border border-[hsl(var(--color-border))]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Code Editors */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[hsl(var(--color-primary))]">Liquid Code (Required)</label>
                            <textarea
                                required
                                rows={10}
                                className="w-full font-mono text-xs p-3 rounded-lg bg-black/40 border border-[hsl(var(--color-border))]"
                                placeholder="{% schema %}...{% endschema %}"
                                value={formData.liquid_code}
                                onChange={e => setFormData({ ...formData, liquid_code: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-[hsl(var(--color-accent))]">Schema JSON (Required)</label>
                            <textarea
                                required
                                rows={6}
                                className="w-full font-mono text-xs p-3 rounded-lg bg-black/40 border border-[hsl(var(--color-border))]"
                                placeholder='{ "name": "..." }'
                                value={formData.schema_json}
                                onChange={e => setFormData({ ...formData, schema_json: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">CSS (Optional)</label>
                                <textarea
                                    rows={4}
                                    className="w-full font-mono text-xs p-3 rounded-lg bg-black/40 border border-[hsl(var(--color-border))]"
                                    value={formData.css_code}
                                    onChange={e => setFormData({ ...formData, css_code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">JavaScript (Optional)</label>
                                <textarea
                                    rows={4}
                                    className="w-full font-mono text-xs p-3 rounded-lg bg-black/40 border border-[hsl(var(--color-border))]"
                                    value={formData.js_code}
                                    onChange={e => setFormData({ ...formData, js_code: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--color-border))]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl border border-[hsl(var(--color-border))] hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Saving...' : 'Save Section'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
