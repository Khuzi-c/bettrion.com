


You are to build a COMPLETE, PRODUCTION-READY full-stack web application called **Bettrion**.  
The application is a high-content review & comparison platform with full admin control, analytics, dynamic routing, JSON-based database, and scalable architecture.

This is NOT a prototype.  
This is NOT conceptual.  
This is NOT a placeholder build.

You must generate **REAL WORKING CODE**, 100% complete, with:

• Working Frontend  
• Working Backend  
• Working Admin Panel  
• Working JSON Database  
• Working API Endpoints  
• Working Authentication  
• Working File Uploads  
• Working Analytics  
• Working Routing  
• Working Rendering  
• Working Filters/Search  
• Working Country Visibility Rules  
• Working Dynamic Metadata  
• Working Auto-Backup System  

⚠️ DO NOT use:
✘ Mock data  
✘ Placeholder items  
✘ Fake demos  
✘ Incomplete admin panel  
✘ Hardcoded sample content  
✘ External databases (No Mongo, SQL, Supabase, Firebase, etc.)

The ENTIRE APP must run only on:
**Node.js + Express + Vanilla JS + JSON storage + Simple CSS.**

Everything must be editable from the admin panel.

=====================================================
        1. DIRECTORY & FILE STRUCTURE
=====================================================

Create the following EXACT structure:

/frontend
    index.html
    platforms.html
    platform-detail.html
    articles.html
    article-detail.html
    categories.html
    search.html
    legal.html
    /assets
        /css
            main.css
            admin.css
            components.css
        /js
            main.js
            api.js
            router.js
            render.js
            admin.js
            utils.js
        /img
            logo.png
            default-item.png
            default-banner.jpg
            default-provider.png
        /uploads
            /platforms
            /articles
            /providers

/admin
    index.html
    login.html
    dashboard.html
    platforms.html
    edit-platform.html
    articles.html
    edit-article.html
    categories.html
    settings.html
    /assets (symlink or copy from main assets)

/backend
    server.js
    app.js
    /routes
        platforms.js
        articles.js
        categories.js
        providers.js
        settings.js
        auth.js
        analytics.js
        uploads.js
    /controllers
        platformsController.js
        articlesController.js
        categoriesController.js
        providersController.js
        settingsController.js
        authController.js
        analyticsController.js
        uploadsController.js
    /middleware
        authMiddleware.js
        validateMiddleware.js
        rateLimit.js
    /services
        jsonService.js
        analyticsService.js
        geoService.js
        metaService.js
        backupService.js
    /data
        platforms.json
        articles.json
        categories.json
        providers.json
        settings.json
        analytics.json
        logs.json
    /backups
        (auto generated daily)

=====================================================
        2. JSON DATABASE SCHEMAS
=====================================================

Create REAL schemas for each JSON file.

platforms.json:
[
  {
    "id": "unique-id",
    "name": "string",
    "slug": "string",
    "rating": Number,
    "short_description": "string",
    "long_description": "string (HTML)",
    "features": ["string"],
    "countries_visible": ["COUNTRY_CODE"],
    "categories": ["category-id"],
    "provider_id": "provider-id",
    "logo": "/assets/uploads/platforms/logo.png",
    "banner": "/assets/uploads/platforms/banner.png",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "clicks": Number,
    "views": Number,
    "is_active": Boolean
  }
]

articles.json:
[
  {
    "id": "unique-id",
    "title": "string",
    "slug": "string",
    "thumbnail": "/assets/uploads/articles/thumb.jpg",
    "content": "string (HTML)",
    "category_id": "category-id",
    "countries_visible": ["COUNTRY_CODE"],
    "created_at": timestamp,
    "updated_at": timestamp
  }
]

categories.json:
[
  {
    "id": "unique-id",
    "name": "string",
    "slug": "string",
    "type": "platform | article | provider",
    "created_at": timestamp
  }
]

providers.json:
[
  {
    "id": "unique-id",
    "name": "string",
    "logo": "/assets/uploads/providers/logo.png",
    "country": "string",
    "created_at": timestamp
  }
]

settings.json:
{
  "site_name": "Bettrion",
  "default_language": "en",
  "supported_languages": ["en", "de", "fr", "es", "it", "pt"],
  "blocked_countries": ["AF", "IR", "KP", "SY", "SD"],
  "admin_credentials": {
    "username": "admin",
    "password_hash": "bcrypt-hash"
  }
}

analytics.json:
[
  {
    "id": "unique-id",
    "type": "view | click",
    "item_type": "platform | article",
    "item_id": "string",
    "timestamp": timestamp,
    "ip": "string",
    "country": "string",
    "device": "mobile | desktop | tablet",
    "referrer": "string"
  }
]

=====================================================
        3. BACKEND FUNCTIONALITY (FULL)
=====================================================

### 3.1 JSON Service
A reusable engine that:
• loadJson(filename)
• saveJson(filename, data)
• generateId()
• autoBackup() to /backups/yyyy-mm-dd/
• validateSchema()

### 3.2 Authentication
Login endpoint:
POST /api/auth/login
→ Validate credentials from settings.json
→ Return JWT token

Middleware:
authRequired → verifies JWT  
adminOnly → checks role (all admin for now)

### 3.3 CRUD APIs (ALL FULLY WORKING)
Platforms
Articles
Categories
Providers
Settings
Uploads
Analytics

Each must have:
GET /api/<type>
GET /api/<type>/:id
POST /api/<type>
PUT /api/<type>/:id
DELETE /api/<type>/:id

### 3.4 File Upload System
POST /api/uploads/platform-logo  
POST /api/uploads/article-thumbnail  
→ Save file to /frontend/assets/uploads/...  
→ Return file path  

Multer recommended.

### 3.5 Analytics Engine
Every platform/article detail fetch triggers:
POST /api/analytics/view

Every click triggers:
POST /api/analytics/click

Analytics service must:
• detect IP  
• detect country  
• detect device  
• detect referrer  
• store to analytics.json  
• sync into platform/article "views" & "clicks" counters  

### 3.6 GEO Restrictions
When frontend requests a platform:
GET /api/platforms/:id?country=NL

Backend must:
• hide item if user country NOT in item.countries_visible  
• return 403 with message “Restricted country”  

### 3.7 Dynamic Metadata Generation
Backend calculates meta:
title, description, og-image, canonical

Endpoint:
GET /api/meta/platform/:id

Returning:
{
  "title": "...",
  "description": "...",
  "image": "...",
  "canonical": "https://site.com/platform-detail.html?id=..."
}

=====================================================
        4. FRONTEND REQUIREMENTS (FULL)
=====================================================

### 4.1 FULL RESPONSIVE UI
Using pure CSS, no frameworks.

### 4.2 Dynamic Rendering
Each page uses JS fetch() to request backend data:

platform-detail.html:
• parse id from URL  
• fetch full platform  
• render banner, logo, features, descriptions  
• track view with analytics  

articles.html:
• render article cards  
• support pagination  

categories.html:
• show all categories  
• link to filtered platforms/articles  

### 4.3 Search Page
Filters by:
• name  
• rating  
• categories  
• countries  
• provider  

Endpoint:
GET /api/search?query=&category=&country=&sort=

### 4.4 Navigation + Routing
Every link should work:
?slug=...
?id=...

=====================================================
        5. ADMIN PANEL REQUIREMENTS (FULL)
=====================================================

### Admin Login
login.html → POST /api/auth/login  
Store token in localStorage  
Redirect to /admin/dashboard.html  

### Dashboard
Show:
• total platforms
• total articles
• views (today, 7d, 30d)
• clicks (today, 7d, 30d)
• top viewed items
• graph using simple <canvas>

### Manage Platforms
platforms.html:
• Table listing all platforms  
• Buttons: Add, Edit, Delete  
• Toggle active/inactive  

edit-platform.html:
• Upload logo & banner  
• Select categories  
• Select visible countries  
• HTML editor for long description  

### Manage Articles
Same features as platforms.

### Manage Categories
• Add  
• Edit  
• Delete  
• Assign type (platform/article/provider)

### Manage Settings
• Change site name  
• Change admin password  
• Manage blocked countries  
• Manage supported languages  

=====================================================
        6. REQUIRED UTILITIES
=====================================================

### utils.js
• getQueryParam  
• slugify  
• formatDate  
• deviceDetector  
• throttledFetch  

### api.js
Wrapper around fetch + JWT:
api.get()
api.post()
api.put()
api.delete()

### router.js
Loads nav + footer templates.

=====================================================
        7. REQUIRED ASSETS
=====================================================

Default images:
• /assets/img/logo.png  
• /assets/img/default-item.png  
• /assets/img/default-banner.jpg  
• /assets/img/default-provider.png  

=====================================================
        8. NON-NEGOTIABLE RULES
=====================================================

YOU MUST FOLLOW THESE OR REGENERATE EVERYTHING:

1. DO NOT generate mock example items.  
2. DO NOT hardcode sample platforms/articles.  
3. Admin panel must fully control ALL content.  
4. JSON must fully persist and update.  
5. Every page must load REAL LIVE DATA.  
6. All CRUD operations must work 100%.  
7. No broken links, no incomplete routing.  
8. The system must run with one command:  
   npm install → npm start  

=====================================================
        9. FINAL OUTPUT EXPECTATION
=====================================================

Your output MUST include:

✔ Full backend code  
✔ Full frontend code  
✔ Full admin panel code  
✔ All routes & controllers  
✔ All JSON files with empty arrays  
✔ Utilities & services  
✔ File upload system  
✔ Analytics system  
✔ GEO restriction logic  
✔ Full working build instructions  
✔ Sample cURL test commands  
✔ Explanation of each part  
✔ Notes on deployment  

=====================================================

Generate the FULL application now in one go.
NO placeholders, NO mock data, EVERYTHING must work.
