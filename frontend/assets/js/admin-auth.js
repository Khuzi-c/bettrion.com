// Admin Authentication Guard
// Include this script on ALL admin pages

(function () {
    // Check if we're on an admin page (but not the login page)
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const isLoginPage = window.location.pathname.includes('/admin/login');

    if (isAdminPage && !isLoginPage) {
        // Check authentication
        const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
        const loginTime = parseInt(sessionStorage.getItem('admin_login_time') || '0');
        const now = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours

        // Check if session is valid
        if (!isAuthenticated || (now - loginTime) > sessionDuration) {
            // Clear session and redirect to login
            sessionStorage.removeItem('admin_authenticated');
            sessionStorage.removeItem('admin_login_time');

            const currentPath = window.location.pathname;
            window.location.href = `/admin/login?redirect=${encodeURIComponent(currentPath)}`;
        }
    }

    // Add logout function
    window.adminLogout = function () {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('admin_authenticated');
            sessionStorage.removeItem('admin_login_time');
            window.location.href = '/admin/login';
        }
    };
})();
