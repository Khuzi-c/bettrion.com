// Simple i18n Translation System
// Lightweight translation engine for vanilla JavaScript

class I18n {
    constructor() {
        this.locale = localStorage.getItem('locale') || this.detectLocale();
        this.translations = {};
        this.fallbackLocale = 'en';
    }

    detectLocale() {
        const browserLang = navigator.language.split('-')[0];
        const supported = ['en', 'ar', 'nl', 'de', 'fr', 'es', 'it', 'pt'];
        return supported.includes(browserLang) ? browserLang : 'en';
    }

    async loadTranslations(locale) {
        try {
            const response = await fetch(`/assets/i18n/${locale}.json`);
            this.translations[locale] = await response.json();
        } catch (err) {
            console.error(`Failed to load translations for ${locale}:`, err);
            if (locale !== this.fallbackLocale) {
                await this.loadTranslations(this.fallbackLocale);
            }
        }
    }

    async init() {
        await this.loadTranslations(this.locale);
        if (this.locale !== this.fallbackLocale) {
            await this.loadTranslations(this.fallbackLocale);
        }
        this.translatePage();
        this.updateHtmlLang();
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.locale];

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value && this.locale !== this.fallbackLocale) {
            value = this.translations[this.fallbackLocale];
            for (const k of keys) {
                value = value?.[k];
            }
        }

        return value || key;
    }

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }

    setLocale(locale) {
        this.locale = locale;
        localStorage.setItem('locale', locale);
        this.loadTranslations(locale).then(() => {
            this.translatePage();
            this.updateHtmlLang();
            window.location.reload();
        });
    }

    updateHtmlLang() {
        document.documentElement.lang = this.locale;
        if (this.locale === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    }

    getLocale() {
        return this.locale;
    }
}

// Global instance
const i18n = new I18n();
window.i18n = i18n;
