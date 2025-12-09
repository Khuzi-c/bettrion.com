// Standard Admin Sidebar - Include this in all admin pages
const ADMIN_SIDEBAR_HTML = `
<aside class="sidebar">
    <a href="/" class="brand">Bettrion Admin</a>
    <nav>
        <a href="/admin/dashboard.html">Dashboard</a>
        <a href="/admin/platform-edit.html">Add Platform</a>
        <a href="/admin/add-slot.html">Add Slot</a>
        <a href="/admin/platforms.html">Manage Platforms</a>
        <a href="/admin/articles.html">Manage Articles</a>
        <a href="/admin/article-edit.html">Write Article</a>
        <a href="/admin/tickets.html">Support Tickets</a>
        <a href="/admin/staff-time.html">Staff Hours</a>
        <a href="/admin/backups.html">Backups</a>
        <a href="/admin/users.html">Users</a>
        <a href="/admin/settings.html">Settings</a>
    </nav>
</aside>
`;

// Auto-highlight current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar nav a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
