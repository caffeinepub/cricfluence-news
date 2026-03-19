# CricFluence News

## Current State
Full news site with articles, sponsors, comments, auto-fetch, AI writer, statistics, logo management, search, video ads, refresh button, and a password-protected admin panel at /#/admin.

## Requested Changes (Diff)

### Add
- `User` type in backend: id, name, email, passwordHash, createdAt
- `registerUser(name, email, passwordHash)` -- returns user id or error if email taken
- `loginUser(email, passwordHash)` -- returns user record or error
- `getAllUsers()` -- admin only, returns all users
- `getUserCount()` -- returns total count
- Public Register/Login modal accessible from Navbar (Account icon button)
- `useUserAuth` hook storing logged-in user in localStorage
- Admin "Users" tab showing table of all registered users (name, email, joined date)

### Modify
- Navbar: add Account icon button on the right side (desktop + mobile) that opens login/register modal
- AdminPage: add Users tab

### Remove
- Nothing removed

## Implementation Plan
1. Add User type + backend functions (register, login, getAllUsers, getUserCount) to main.mo
2. Create useUserAuth hook (localStorage persistence)
3. Create AccountModal component (register/sign in tabs, SHA-256 password hash via Web Crypto API)
4. Update Navbar to show Account button (and logged-in user avatar/name when authed)
5. Add Users tab to AdminPage showing all users in a table
