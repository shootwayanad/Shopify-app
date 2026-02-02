# 🎯 CURSOR AI PROMPT — Rebuild Section Store UI with Shopify Polaris

---

## 📌 HOW TO USE THIS

1. Open **Cursor AI**
2. Open your project folder: `section-store-mvp`
3. Select **ALL files** in the sidebar (or open the root)
4. Click **"New Chat"** (not inline edit)
5. Copy everything below the `---` line
6. Paste into Cursor chat
7. Press Enter — let it run

---

## ✂️ COPY EVERYTHING BELOW THIS LINE

---

You are rebuilding a Shopify app called "Section Store". The app already works (OAuth, API routes, Supabase database) — only the UI needs to change. Do NOT touch any files inside `app/api/`, `lib/`, or `supabase/`. Only rewrite the frontend.

The goal: make the UI look and feel exactly like the official **Shopify Section Store** app (see reference description below). Shopify requires embedded apps to use **Polaris** design system. The package `@shopify/polaris` is already in `package.json`. Install it if needed with `npm install`.

---

## 📸 REFERENCE UI — What It Must Look Like

The target UI is the official Shopify "Section Store" app (sectionstore.com). Here is exactly what each page looks like:

### MERCHANT PAGE (main page — `/`)

**Top bar / Header:**
- White background, full width
- Left side: `S` logo icon (bold, dark) followed by text "Section Store" in medium weight dark text
- Right side: A search input that spans most of the header width. Placeholder: "Search for sections". Has a magnifying glass icon on the left inside the input. Rounded corners, subtle border
- Far right: A "Categories" button with a filter/lines icon — when clicked shows a category dropdown or sidebar

**Category pills row (horizontal scroll):**
- Sits below the header search
- Contains icon + label pills in a single horizontal scrollable row
- Icons are simple outlined icons. Each pill has: icon on top, label below in small text
- Categories visible (left to right, scrollable): Popular ⭐, Trending 🔥, Newest ✨, Free 🎁, Features ✦, Testimonial 💬, Scrolling ↗, Hero 🏠, Video 🎥, Countdown timer ⏱, Images 🖼, Snippet </>, Text T, FAQ ?, Image with text 📄, Slider ▷, Collection 🛍, Upsell 💰, Tabs 📑, Comparison ⚖, Blog 📝, Hotspots 🎯, Featured collection ★, Before/After
- Active/selected category has a slightly bolder look
- Left and right arrow chevrons appear when overflowing

**Section heading:**
- "Trending Now" — left-aligned, bold, dark text, medium font size
- Below that, a horizontal row of section cards

**Section Cards (the main content grid):**
- Cards are displayed in a responsive horizontal row (4 columns on desktop, 2 on tablet, 1 on mobile)
- Each card is a white rounded rectangle with subtle shadow and border
- Card layout (top to bottom):
  - **Preview image** — takes up roughly 60% of the card height. Shows a screenshot/mockup of the section. Has rounded top corners
  - **Section name** — bold dark text below the image, left-aligned. E.g. "Testimonial #8", "Hero pro", "Product videos", "Social proof"
  - **Price badge** — appears at the bottom-right of the card, or inline next to the name. Shows "$9", "$14" etc in small text. Free sections would show "Free"
  - A subtle blue heart/badge icon appears on some names (e.g. "Hero pro 💙") indicating premium/popular

**"Newest Releases" section:**
- Same heading style as "Trending Now"
- Same card layout, new row of cards below
- Cards: "Featured collection #21", "Footer #18", "Shoppable video #5", "Comparison table #27"

**"Free" section:**
- Same heading, same cards — shows only free sections

**Overall page feel:**
- Clean white background
- Very minimal — lots of whitespace
- No gradients, no glassmorphism, no dark backgrounds
- Feels like a native Shopify admin page
- Cards have very subtle borders and soft shadows
- Typography is the Shopify system font (Polaris handles this)

---

### ADMIN PAGE (`/admin`)

**Header:**
- "Admin Dashboard" title, left-aligned, bold
- Subtitle: "Manage your section library" in muted gray
- Right side: An orange/primary "**+ Create Section**" button

**Stats row:**
- 4 stat cards in a row
- Each card: icon (emoji-style) + label + big number
- Cards: Total Sections 📦 0, Free Sections 🎁 0, Paid Sections 💰 0, Total Installs 📥 0
- Cards have a subtle dark background (dark card style) with light text, OR white cards with colored icons — match Polaris Card component style

**"All Sections" table:**
- Heading: "All Sections" left-aligned, bold
- Right side: the "+ Create Section" button again
- Below: a **Polaris DataTable or IndexTable** with columns:
  - Name
  - Category
  - Price
  - Installs
  - Status
  - Actions (Edit / Delete buttons)
- When empty: shows an empty state message

**Create Section Modal (when "+ Create Section" is clicked):**
- Opens a full **Polaris Modal** (not a custom div)
- Title: "Create Section" or "Edit Section"
- Form fields using **Polaris TextField**, **Polaris Select**, **Polaris Checkbox**:
  - Section Name (TextField, required)
  - Category (Select dropdown with all 8 categories)
  - Description (TextField, multiline, 3 rows)
  - Preview Image URL (TextField)
  - Liquid Code (TextField, multiline, monospace, 8 rows, required)
  - Schema JSON (TextField, multiline, monospace, 8 rows, required)
  - CSS Code (TextField, multiline, monospace, 4 rows, optional)
  - JS Code (TextField, multiline, monospace, 4 rows, optional)
  - Free Section (Checkbox)
  - Price in USD (TextField, type number — only visible when "Free" is unchecked)
- Footer: Cancel button + Create/Update primary button
- The form must actually WORK — it calls POST or PUT to `/api/admin/sections` exactly like the current code does

---

## 📂 FILES TO CREATE / REWRITE

Rewrite these files completely. Keep the same logic/API calls, just swap all UI to Polaris:

### 1. `app/layout.tsx`
- Wrap children in Polaris `<AppProvider>` with the `i18n` prop (just pass `en` locale)
- Import `@shopify/polaris/build/cjs/styles.consumer.css` — actually in Next.js you import the CSS like: `import '@shopify/polaris/styles.css';` at the top of layout
- Remove all Google Font imports
- Remove Tailwind CSS import (`globals.css` tailwind directives can stay but won't be used)

### 2. `app/globals.css`
- Delete almost everything. Keep only:
```css
/* Polaris handles all styles. Only keep body reset. */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
```

### 3. `app/page.tsx` — Merchant/Browse Page
- Full rewrite using Polaris components
- Use: `Page`, `Layout`, `Card`, `TextField` (for search), `Button`, `Text`, `Box`, `InlineStack`, `BlockStack`, `Badge`, `Spinner`, `EmptyState`, `Thumbnail`
- Category pills: build with a horizontal scrolling `InlineStack` of `Button` components with `variant="plain"` or use a custom horizontal scroll container
- Section cards: use Polaris `Card` with an image at the top (use a regular `<img>` inside a `Box` with `overflow="hidden"` and fixed height)
- Install button: Polaris `Button` with `variant="primary"` — calls the same `handleInstall` function
- Keep ALL the existing fetch logic and state management exactly the same
- Show a `Spinner` while loading
- Show `EmptyState` when no sections found

### 4. `app/admin/page.tsx` — Admin Dashboard
- Full rewrite using Polaris
- Use: `Page` with `primaryAction` prop for the "+ Create Section" button
- Stats: 4x Polaris `Card` components in a row using `Layout.Section` or `InlineStack`
- Sections list: Use Polaris **`IndexTable`** component. Columns: Name, Category, Price, Installs, Status, Actions. Each row has Edit and Delete action buttons
- Keep ALL existing fetch/filter/delete logic exactly the same
- The `Page` component's `primaryAction` opens the modal

### 5. `components/SectionModal.tsx` — Create/Edit Modal
- Full rewrite using Polaris `Modal` component
- Modal must use `open`, `onClose`, `primaryAction`, `secondaryActions` props
- All form inputs must be Polaris `TextField` and `Select` and `Checkbox`
- `TextField` for Liquid Code and Schema JSON: use `multiline={8}` and add `code` styling by setting `font-family: monospace` via inline style or a className
- On submit: calls the exact same `onSave(data)` prop, parsing schema_json with JSON.parse just like current code
- Show error state on TextField if schema_json is invalid JSON (use `error` prop on the TextField)
- The modal MUST be fully functional — this is the most important part. Users must be able to create sections through it

### 6. `components/SectionCard.tsx`
- Delete this file entirely. Card rendering will be inline inside `page.tsx` using Polaris `Card` component. OR keep it but rewrite internals to use Polaris only.

### 7. `components/StatsCard.tsx`
- Rewrite to use Polaris `Card` internally. Accept same props. Use Polaris `Text` and `Box` for layout.

---

## ⚠️ CRITICAL RULES — DO NOT BREAK THESE

1. **Do NOT touch these files at all:**
   - `app/api/auth/route.ts`
   - `app/api/auth/callback/route.ts`
   - `app/api/sections/route.ts`
   - `app/api/sections/install/route.ts`
   - `app/api/admin/sections/route.ts`
   - `app/api/categories/route.ts`
   - `lib/supabase.ts`
   - `lib/shopify.ts`
   - `lib/database.types.ts`
   - `supabase/schema.sql`
   - `package.json` (Polaris is already there)
   - `next.config.js`
   - `tsconfig.json`
   - `.env.local` or `.env.example`

2. **All API calls must remain identical.** The fetch URLs, request bodies, and response handling must not change. Only the UI rendering changes.

3. **The modal form MUST work end-to-end.** When a user fills the form and clicks Create/Update, it must POST or PUT to `/api/admin/sections` with the correct JSON body. Do not leave placeholder text like "Build a full section creation form using react-hook-form in the next iteration." — actually build the form.

4. **Use `'use client'`** at the top of every page and component file that uses useState/useEffect/event handlers.

5. **Polaris CSS import:** In `layout.tsx`, add this import at the very top:
   ```typescript
   import '@shopify/polaris/styles.css';
   ```

6. **Do NOT use Tailwind classes.** Remove all `className="..."` that use Tailwind utilities like `bg-white`, `rounded-2xl`, `flex`, `gap-4`, `text-slate-800`, etc. Use Polaris Box, InlineStack, BlockStack for layout instead.

7. **Do NOT use lucide-react icons.** Polaris has its own icon set: `@shopify/polaris-icons`. Use those. Example:
   ```typescript
   import { SearchIcon, PlusIcon, DeleteIcon, EditIcon } from '@shopify/polaris-icons';
   ```

8. **Install Polaris icons package if missing:**
   ```bash
   npm install @shopify/polaris-icons
   ```

---

## 📦 PACKAGE INSTALL COMMAND

Run this first before writing any code:

```bash
npm install @shopify/polaris @shopify/polaris-icons
```

---

## 🏗️ EXACT POLARIS IMPORT PATTERNS

Use exactly these import patterns:

```typescript
// Layout primitives
import { AppProvider, Page, Layout, Card, Box, InlineStack, BlockStack, Text, Heading } from '@shopify/polaris';

// Form components
import { TextField, Select, Checkbox, Button, Form, FormLayout } from '@shopify/polaris';

// Feedback
import { Spinner, EmptyState, Toast, Banner, Modal } from '@shopify/polaris';

// Table
import { IndexTable, useIndexHandles } from '@shopify/polaris';

// Badge
import { Badge } from '@shopify/polaris';

// Icons
import { SearchIcon, PlusIcon, DeleteIcon, EditIcon, StarIcon, ArrowRightIcon } from '@shopify/polaris-icons';
```

---

## 🎨 POLARIS STYLING NOTES

- Polaris uses its own design tokens. Do NOT override colors with custom CSS
- `Button variant="primary"` = the main green/Shopify action button
- `Button variant="plain"` = text-only button, good for category pills
- `Badge tone="success"` = green badge (use for "Free")
- `Badge tone="info"` = blue badge
- `Text as="h1" variant="headingLg"` = large heading
- `Text as="p" variant="bodyMd" tone="subdued"` = muted paragraph text
- `Card` = white card with border and shadow built in
- `Card` with `background="subdued"` = slightly gray card

---

## 📝 SKELETON OF WHAT EACH FILE SHOULD LOOK LIKE

### `app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/styles.css';
import './globals.css';

const i18n = {
  // Polaris needs this for translations
};

export const metadata: Metadata = {
  title: 'Section Store',
  description: 'Premium Shopify Theme Sections',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider i18n={i18n}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

### `app/page.tsx` — High-level structure
```typescript
'use client';
import { useState, useEffect } from 'react';
import { Page, Card, TextField, Button, Text, Box, InlineStack, BlockStack, Spinner, EmptyState, Badge, Layout } from '@shopify/polaris';
import { SearchIcon, PlusIcon } from '@shopify/polaris-icons';

// Keep EXACT same interfaces, state, useEffect, fetchCategories, fetchSections, handleInstall, filteredSections logic

export default function Home() {
  // ... all existing state and logic untouched ...

  return (
    <Page>
      {/* Search bar at top */}
      <Card>
        <Box padding={4}>
          <TextField
            label="Search for sections"
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            prefix={<SearchIcon />}
            clearButton
            onClearButtonClick={() => setSearchQuery('')}
          />
        </Box>
      </Card>

      {/* Category pills — horizontal scroll */}
      <Box paddingBlockStart={4}>
        <InlineStack wrap={false} gap={2} align="center">
          {/* "All Sections" pill */}
          <Button variant={selectedCategory === '' ? 'primary' : 'plain'} onClick={() => setSelectedCategory('')}>
            All Sections
          </Button>
          {categories.map((cat) => (
            <Button key={cat.id} variant={selectedCategory === cat.id ? 'primary' : 'plain'} onClick={() => setSelectedCategory(cat.id)}>
              {cat.name}
            </Button>
          ))}
        </InlineStack>
      </Box>

      {/* "Trending Now" heading */}
      <Box paddingBlockStart={6}>
        <Text as="h2" variant="headingMd">Trending Now</Text>
      </Box>

      {/* Section cards grid */}
      <Layout>
        <Layout.Section oneThird>
          {/* Card per section */}
        </Layout.Section>
      </Layout>

      {/* Empty state */}
      {filteredSections.length === 0 && !loading && (
        <EmptyState heading="No sections found" image="">
          <p>Try adjusting your search or browsing all categories.</p>
        </EmptyState>
      )}
    </Page>
  );
}
```

### `app/admin/page.tsx` — High-level structure
```typescript
'use client';
import { useState, useEffect } from 'react';
import { Page, Card, IndexTable, Button, Text, Box, InlineStack, Modal, TextField, Select, Checkbox, FormLayout, Toast } from '@shopify/polaris';
import { PlusIcon, EditIcon, DeleteIcon } from '@shopify/polaris-icons';

// Keep EXACT same interfaces, state, fetch, filter, delete, save logic

export default function AdminDashboard() {
  // ... all existing state and logic ...

  const columnChoices = [
    { title: 'Name', id: 'name' },
    { title: 'Category', id: 'category' },
    { title: 'Price', id: 'price' },
    { title: 'Installs', id: 'installs' },
    { title: 'Status', id: 'status' },
    { title: 'Actions', id: 'actions' },
  ];

  const rows = filteredSections.map((section) => ({
    id: section.id,
    name: section.name,
    category: section.categories?.name || 'Uncategorized',
    price: section.is_free ? 'Free' : `$${section.price}`,
    installs: section.downloads_count,
    status: section.is_active ? 'Active' : 'Inactive',
    actions: (
      <InlineStack gap={2}>
        <Button size="slim" icon={EditIcon} onClick={() => handleEditSection(section)} />
        <Button size="slim" icon={DeleteIcon} tone="critical" onClick={() => handleDeleteSection(section.id)} />
      </InlineStack>
    ),
  }));

  return (
    <Page
      title="Admin Dashboard"
      subtitle="Manage your section library"
      primaryAction={{ content: 'Create Section', icon: PlusIcon, onAction: handleCreateSection }}
    >
      {/* Stats cards row */}
      <InlineStack gap={4} wrap={false}>
        <Box width="25%"><Card><Box padding={4}>Total Sections: {stats.totalSections}</Box></Card></Box>
        {/* ... repeat for other stats */}
      </InlineStack>

      {/* IndexTable */}
      <Box paddingBlockStart={6}>
        <Card>
          <IndexTable
            resourceName={{ singular: 'section', plural: 'sections' }}
            itemCount={rows.length}
            data={rows}
            columns={columnChoices}
            selectable={false}
            renderRow={({ item }) => (
              <IndexTable.Row id={item.id} key={item.id} selected={false}>
                <IndexTable.Cell>{item.name}</IndexTable.Cell>
                <IndexTable.Cell>{item.category}</IndexTable.Cell>
                <IndexTable.Cell>{item.price}</IndexTable.Cell>
                <IndexTable.Cell>{item.installs}</IndexTable.Cell>
                <IndexTable.Cell>{item.status}</IndexTable.Cell>
                <IndexTable.Cell>{item.actions}</IndexTable.Cell>
              </IndexTable.Row>
            )}
            emptyState={<EmptyState heading="No sections yet" image="" />}
          />
        </Card>
      </Box>

      {/* Modal for create/edit */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? 'Edit Section' : 'Create Section'}
        primaryAction={{ content: editingSection ? 'Update' : 'Create', onAction: handleModalSubmit }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setIsModalOpen(false) }]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField label="Section Name" value={formData.name} onChange={(val) => setFormData(prev => ({...prev, name: val}))} required />
            <Select label="Category" options={categoryOptions} value={formData.category_id} onChange={(val) => setFormData(prev => ({...prev, category_id: val}))} />
            <TextField label="Description" value={formData.description} onChange={(val) => setFormData(prev => ({...prev, description: val}))} multiline={3} />
            <TextField label="Preview Image URL" value={formData.preview_image_url} onChange={(val) => setFormData(prev => ({...prev, preview_image_url: val}))} />
            <TextField label="Liquid Code" value={formData.liquid_code} onChange={(val) => setFormData(prev => ({...prev, liquid_code: val}))} multiline={8} required monospaced />
            <TextField label="Schema JSON" value={formData.schema_json} onChange={(val) => setFormData(prev => ({...prev, schema_json: val}))} multiline={8} required monospaced error={schemaError} />
            <TextField label="CSS Code (Optional)" value={formData.css_code} onChange={(val) => setFormData(prev => ({...prev, css_code: val}))} multiline={4} monospaced />
            <TextField label="JS Code (Optional)" value={formData.js_code} onChange={(val) => setFormData(prev => ({...prev, js_code: val}))} multiline={4} monospaced />
            <Checkbox label="Free Section" checked={formData.is_free} onChange={(val) => setFormData(prev => ({...prev, is_free: val}))} />
            {!formData.is_free && (
              <TextField label="Price (USD)" value={String(formData.price)} onChange={(val) => setFormData(prev => ({...prev, price: parseFloat(val) || 0}))} type="number" />
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
```

---

## ✅ CHECKLIST — Before You Finish

- [ ] `npm install @shopify/polaris @shopify/polaris-icons` is run
- [ ] `layout.tsx` imports `@shopify/polaris/styles.css` and wraps in `AppProvider`
- [ ] `globals.css` is stripped down — no Tailwind, no custom fonts, no custom colors
- [ ] `page.tsx` (merchant) uses ONLY Polaris components — no Tailwind classNames
- [ ] `admin/page.tsx` uses Polaris `Page`, `IndexTable`, `Modal`
- [ ] The Modal form is FULLY functional — POST/PUT calls work
- [ ] No `lucide-react` imports anywhere — use `@shopify/polaris-icons`
- [ ] All `'use client'` directives are present
- [ ] No files in `app/api/` or `lib/` were touched
- [ ] App runs with `npm run dev` and loads without errors
- [ ] Categories load and filter works on merchant page
- [ ] Create Section modal opens, form fills, and submits successfully
- [ ] Sections appear in the IndexTable on admin page

---

## 🎯 SUMMARY

| File | Action |
|---|---|
| `app/layout.tsx` | Rewrite — add Polaris AppProvider + CSS import |
| `app/globals.css` | Strip to near-empty |
| `app/page.tsx` | Full rewrite UI → Polaris. Keep all logic |
| `app/admin/page.tsx` | Full rewrite UI → Polaris IndexTable + Modal. Keep all logic. Modal MUST work |
| `components/SectionModal.tsx` | Delete — modal logic moves into admin/page.tsx |
| `components/SectionCard.tsx` | Delete — card rendering moves inline into page.tsx |
| `components/StatsCard.tsx` | Rewrite internals to use Polaris Card |
| Everything in `app/api/` | ❌ DO NOT TOUCH |
| Everything in `lib/` | ❌ DO NOT TOUCH |
| `package.json` | ❌ DO NOT TOUCH |
| `next.config.js` | ❌ DO NOT TOUCH |
