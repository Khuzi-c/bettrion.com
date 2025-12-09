const API_BASE = '/api';

const api = {
    get: async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            return await res.json();
        } catch (err) {
            console.error("API GET Error:", err);
            return { success: false, error: err.message };
        }
    },
    post: async (endpoint, body) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("API POST JSON Parse Error:", e, "Response:", text);
                return { success: false, error: "Server returned invalid response. Check console." };
            }
        } catch (err) {
            console.error("API POST Error:", err);
            return { success: false, error: err.message };
        }
    },
    put: async (endpoint, body) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("API PUT JSON Parse Error:", e, "Response:", text);
                return { success: false, error: "Server returned invalid response." };
            }
        } catch (err) {
            console.error("API PUT Error:", err);
            return { success: false, error: err.message };
        }
    },
    delete: async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (err) {
            console.error("API DELETE Error:", err);
            return { success: false, error: err.message };
        }
    },
    upload: async (endpoint, formData) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                body: formData
            });
            return await res.json();
        } catch (err) {
            console.error("API UPLOAD Error:", err);
            return { success: false, error: err.message };
        }
    }
};
