// Utility functions
const utils = {
    getUser: () => {
        // Mock user for now or get from localStorage if auth was implemented on frontend fully.
        // For the Staff feature test, we'll assume a specific ID or check stored ID.
        return localStorage.getItem('user_id');
    },

    checkStaffStatus: async () => {
        const userId = utils.getUser();
        if (!userId) return;

        // Check if user is staff (simplified: assume if they have the ID they are staff for this demo)
        const btn = document.getElementById('admin-staff-clock-btn');
        if (!btn) return;

        btn.style.display = 'block';

        const res = await api.get(`/staff/status/${userId}`);

        if (res.success && res.is_clocked_in) {
            btn.innerText = 'Clock Out';
            btn.style.background = 'red';
            btn.onclick = utils.clockOut;
        } else {
            btn.innerText = 'Clock In';
            btn.style.background = 'var(--accent-blue)';
            btn.onclick = utils.clockIn;

            // Popup logic could go here
            if (!sessionStorage.getItem('staff_popup_shown')) {
                if (confirm("Staff Member: Do you want to clock in now?")) {
                    utils.clockIn();
                }
                sessionStorage.setItem('staff_popup_shown', 'true');
            }
        }
    },

    clockIn: async () => {
        const userId = utils.getUser();
        if (!userId) return alert('No User Configuration Found');

        const res = await api.post('/staff/clock-in', { user_id: userId });
        if (res.success) {
            alert('Clocked In Successfully at ' + new Date().toLocaleTimeString());
            location.reload();
        } else {
            alert('Error: ' + res.error);
        }
    },

    clockOut: async () => {
        const userId = utils.getUser();
        if (!userId) return alert('No User Configuration Found');

        const res = await api.post('/staff/clock-out', { user_id: userId });
        if (res.success) {
            alert('Clocked Out. Duration: ' + Math.round(res.data.duration_minutes) + ' mins');
            location.reload();
        } else {
            alert('Error: ' + res.error);
        }
    }
};

// Auto-run if elements exist
window.addEventListener('load', () => {
    if (document.getElementById('admin-staff-clock-btn')) {
        // Check if we effectively can "login" as staff for demo
        // For demo purposes, let's set a fake user_id if not present
        if (!localStorage.getItem('user_id')) {
            localStorage.setItem('user_id', '11111111-1111-1111-1111-111111111111'); // UUID format
        }
        utils.checkStaffStatus();
    }
});
