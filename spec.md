# Influencer & Cricket News Portal

## Current State
Backend is generated with full CRUD (create, read, update, delete) for articles. Frontend not yet built.

## Requested Changes (Diff)

### Add
- Home page with featured/latest news articles
- Two main categories: Influencers and Cricket
- News listing pages filtered by category
- Individual article detail page
- Admin panel to create, edit, and delete (remove old) news posts
- Navigation bar with logo, category links, and admin access
- Sample news content pre-populated for both categories

### Modify
- Confirm that edit and delete functionality is prominently available in the admin panel so old news can be removed easily

### Remove
N/A

## Implementation Plan
1. Frontend: Build navigation bar with category tabs (Home, Influencers, Cricket, Admin). Build home page with featured article and news grid. Build category pages filtered by Influencers and Cricket. Build article detail page. Build admin panel with list of all articles and actions to create new article, edit existing article, and delete/remove old articles. Wire all backend API calls: getAllArticles, getArticlesByCategory, getArticleById, createArticle, updateArticle, deleteArticle, seedSampleData.
