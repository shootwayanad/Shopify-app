---
trigger: always_on
---

# 📖 COMPREHENSIVE PROJECT RULES & STANDARDS
## Section Store MVP - Complete Implementation Guide
### Expert-Level Standards from 10+ Year Shopify Developer

**Version:** 1.0  
**Authority Level:** MANDATORY - All rules are non-negotiable  
**Last Updated:** 2024

---

## 📚 TABLE OF CONTENTS

1. [Critical Security Rules](#1-critical-security-rules)
2. [Shopify-Specific Rules](#2-shopify-specific-rules)
3. [Database Rules](#3-database-rules)
4. [API Development Rules](#4-api-development-rules)
5. [Frontend Development Rules](#5-frontend-development-rules)
6. [Code Quality Rules](#6-code-quality-rules)
7. [Performance Rules](#7-performance-rules)
8. [Accessibility Rules](#8-accessibility-rules)
9. [Testing Rules](#9-testing-rules)
10. [Deployment Rules](#10-deployment-rules)

---

# 1. CRITICAL SECURITY RULES

## 🔐 Rule 1.1: NEVER Commit Secrets to Git

### What This Means
ANY file containing API keys, passwords, tokens, or credentials must NEVER be committed to version control.

### Files That Are FORBIDDEN in Git
```bash
.env                    # All environment files
.env.local
.env.production
.env.development
config/secrets.json     # Any config with credentials
credentials.txt         # Obviously
any-file-with-api-keys.ts
```

### What You MUST Do
```bash
# 1. Add to .gitignore BEFORE creating .env files
echo ".env*" >> .gitignore
echo ".env.local" >> .gitignore

# 2. Verify .gitignore works
git status
# .env.local should NOT appear

# 3. If you accidentally committed secrets:
# IMMEDIATELY rotate all credentials
# Remove from git history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# 4. Force push (WARNING: destructive)
git push origin --force --all
```

### Why This Rule Exists
- **2023 GitHub Report:** 10 million secrets leaked in public repos
- **Average breach cost:** $4.45 million (IBM, 2023)
- **Time to exploit:** 24 seconds average after leak
- **Real example:** In 2021, a developer committed AWS keys. Within 2 hours, $50,000 in crypto mining charges.

### How to Store Secrets Properly
```bash
# Local Development
.env.local (in .gitignore)

# Production (Vercel)
Environment Variables in Vercel Dashboard
Mark as "Sensitive" - they'll be encrypted

# Team Sharing
Use 1Password, LastPass, or Doppler
NEVER Slack/Email secrets
```

### Verification Checklist
```bash
□ Run: git log --all --full-history -- .env.local
  Expected: "fatal: pathspec '.env.local' did not match any files"
  
□ Run: cat .gitignore | grep ".env"
  Expected: .env* appears in output
  
□ Run: git status
  Expected: .env.local does NOT appear in untracked files
```

---

## 🔐 Rule 1.2: ALWAYS Validate OAuth State Parameter

### What This Means
When implementing Shopify OAuth, the `state` parameter MUST be validated to prevent CSRF attacks.

### The Attack Scenario (Why This Matters)
```
1. Attacker creates malicious Shopify app
2. Tricks user into clicking OAuth link
3. User approves (thinking it's legit)
4. Without state validation, attacker can:
   - Hijack the OAuth flow
   - Get access to victim's shop
   - Install malicious code
   - Steal customer data
```

### WRONG Implementation ❌
```typescript
// api/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { code, shop } = Object.fromEntries(request.nextUrl.searchParams);
  
  // ❌ NO STATE VALIDATION - VULNERABLE TO CSRF
  const accessToken = await getShopifyAccessToken(shop, code);
  
  // Store token...
}
```

### CORRECT Implementation ✅
```typescript
// api/auth/route.ts - Generate state
export async function GET(request: NextRequest) {
  const shop = request.nextUrl.searchParams.get('shop');
  
  // Generate cryptographically secure random state
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in secure HTTP-only cookie
  const response = NextResponse.redirect(
    generateShopifyAuthUrl(shop, state)
  );
  
  response.cookies.set('shopify_oauth_state', state, {
    httpOnly: true,      // Can't be accessed by JavaScript
    secure: true,        // HTTPS only
    sameSite: 'lax',     // CSRF protection
    maxAge: 600,         // 10 minutes expiry
  });
  
  return response;
}

// api/auth/callback/route.ts - Validate state
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const receivedState = searchParams.get('state');
  const storedState = request.cookies.get('shopify_oauth_state')?.value;
  
  // ✅ VALIDATE STATE - PREVENTS CSRF
  if (!receivedState || receivedState !== storedState) {
    return NextResponse.json(
      { error: 'Invalid state parameter - possible CSRF attack' },
      { status: 403 }
    );
  }
  
  // Clear state cookie (one-time use)
  const response = NextResponse.next();
  response.cookies.delete('shopify_oauth_state');
  
  // Continue with OAuth flow...
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  
  // Verify HMAC
  if (!verifyShopifyHmac(Object.fromEntries(searchParams))) {
    return NextResponse.json(
      { error: 'Invalid HMAC signature' },
      { status: 403 }
    );
  }
  
  // Exchange code for token
  const accessToken = await getShopifyAccessToken(shop, code);
  
  // Store securely...
}
```

### Why This Specific Implementation
1. **crypto.randomBytes(32)** - Cryptographically secure (not Math.random)
2. **httpOnly cookie** - Can't be stolen via XSS
3. **secure flag** - HTTPS only transmission
4. **sameSite: 'lax'** - Additional CSRF protection
5. **maxAge: 600** - Expires in 10 minutes (prevents replay attacks)
6. **Delete after use** - One-time token pattern

### Testing This Rule
```bash
# Test 1: Missing state
curl "http://localhost:3000/api/auth/callback?code=test&shop=test.myshopify.com"
# Expected: 403 Forbidden

# Test 2: Wrong state
curl "http://localhost:3000/api/auth/callback?code=test&shop=test.myshopify.com&state=wrong" \
  -H "Cookie: shopify_oauth_state=correct"
# Expected: 403 Forbidden

# Test 3: Correct state
curl "http://localhost:3000/api/auth/callback?code=test&shop=test.myshopify.com&state=ABC123" \
  -H "Cookie: shopify_oauth_state=ABC123"
# Expected: 200 OK (if other validations pass)
```

### Real-World Impact
- **2022 OAuth Breach:** Major e-commerce app lost $2.3M due to missing state validation
- **Shopify Requirement:** Apps without state validation are rejected from App Store
- **OWASP Top 10:** CSRF is #8 most critical web vulnerability

---

## 🔐 Rule 1.3: ALWAYS Verify Shopify HMAC Signatures

### What This Means
EVERY request from Shopify (OAuth callbacks, webhooks) includes an HMAC signature. You MUST verify this signature before trusting the data.

### The Attack Without HMAC Verification
```
1. Attacker crafts fake Shopify callback
2. Sends to your app: /api/auth/callback?shop=victim.myshopify.com&code=FAKE
3. Without HMAC check, your app:
   - Accepts the fake data
   - Attempts to get access token (fails, but logs shop domain)
   - Attacker now knows which shops use your app
   - Can launch targeted phishing attacks
```

### How HMAC Works
```
1. Shopify creates message (query parameters)
2. Shopify signs with shared secret: HMAC-SHA256(message, secret)
3. Shopify sends message + signature
4. You verify: YOUR_HMAC = HMAC-SHA256(message, YOUR_secret)
5. If YOUR_HMAC === THEIR_HMAC → authentic
6. If different → forged/tampered
```

### WRONG Implementation ❌
```typescript
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  
  // ❌ NO HMAC VERIFICATION
  const { shop, code } = params;
  const accessToken = await getShopifyAccessToken(shop, code);
  // ... this accepts ANY request, even fake ones
}
```

### CORRECT Implementation ✅
```typescript
// lib/shopify.ts
import crypto from 'crypto';

export function verifyShopifyHmac(query: Record<string, any>): boolean {
  const { hmac, ...rest } = query;
  
  // Must have hmac
  if (!hmac) {
    return false;
  }
  
  // 1. Sort parameters alphabetically (Shopify requirement)
  const sortedParams = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('&');
  
  // 2. Generate HMAC using your secret
  const generatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(sortedParams)
    .digest('hex');
  
  // 3. Timing-safe comparison (prevents timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(generatedHmac),
    Buffer.from(hmac as string)
  );
}

// api/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  
  // ✅ VERIFY HMAC FIRST
  if (!verifyShopifyHmac(params)) {
    console.error('Invalid HMAC signature - possible forgery attempt');
    return NextResponse.json(
      { error: 'Invalid request signature' },
      { status: 403 }
    );
  }
  
  // Now safe to process...
}
```

### Critical Details

#### Why Alphabetical Sorting?
Shopify generates HMAC from alphabetically sorted parameters. If you don't sort, your HMAC won't match.

```typescript
// Wrong order
const wrong = "shop=test.myshopify.com&code=abc123";

// Correct order (alphabetical by key)
const correct = "code=abc123&shop=test.myshopify.com";
```

#### Why crypto.timingSafeEqual?
```typescript
// ❌ VULNERABLE to timing attacks
if (generatedHmac === receivedHmac) { }

// ✅ SAFE - constant time comparison
if (crypto.timingSafeEqual(Buffer.from(generatedHmac), Buffer.from(receivedHmac))) { }
```

**Timing Attack Explanation:**
- String comparison (`===`) exits on first mismatch
- Attacker can measure response time
- Slower response = more correct characters
- Can brute-force HMAC character by character

**timingSafeEqual:**
- Always takes same time regardless of where difference is
- Prevents timing-based attacks

### Webhook HMAC Verification
```typescript
// api/webhooks/app-uninstalled/route.ts
export async function POST(request: NextRequest) {
  const hmac = request.headers.get('x-shopify-hmac-sha256');
  const body = await request.text(); // Raw body needed
  
  // Verify webhook HMAC (different format than OAuth)
  const generatedHmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(body, 'utf8')
    .digest('base64'); // Note: base64 for webhooks, hex for OAuth
  
  if (!crypto.timingSafeEqual(
    Buffer.from(generatedHmac),
    Buffer.from(hmac!)
  )) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 403 }
    );
  }
  
  // Process webhook...
}
```

### Testing HMAC Verification
```bash
# Generate valid HMAC for testing
node -e "
const crypto = require('crypto');
const secret = 'your_shopify_secret';
const message = 'code=test123&shop=test.myshopify.com';
const hmac = crypto.createHmac('sha256', secret).update(message).digest('hex');
console.log('Valid HMAC:', hmac);
"

# Test with invalid HMAC
curl "http://localhost:3000/api/auth/callback?code=test&shop=test.myshopify.com&hmac=invalid"
# Expected: 403 Forbidden

# Test with valid HMAC
curl "http://localhost:3000/api/auth/callback?code=test&shop=test.myshopify.com&hmac=VALID_HMAC_FROM_ABOVE"
# Expected: Proceeds to next validation
```

---

## 🔐 Rule 1.4: NEVER Expose Service Role Key to Client

### What This Means
Supabase has two types of keys:
1. **anon/public key** - Safe for client-side code
2. **service_role key** - NEVER send to client (has FULL database access)

### The Catastrophic Impact
The service_role key bypasses ALL Row Level Security (RLS). If exposed:

```typescript
// What an attacker can do with your service_role key:
const supabase = createClient(YOUR_URL, YOUR_SERVICE_ROLE_KEY);

// 1. Read ALL data (ignoring RLS)
const { data } = await supabase.from('shops').select('*');
// Gets access tokens for ALL shops

// 2. Modify ANY data
await supabase.from('shops').delete().neq('id', '00000000');
// Deletes all shops

// 3. Drop