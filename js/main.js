// Shared demo UI: a visible demo notice and a working mobile navigation toggle.
// This is a static demo; the banner intentionally makes that clear on every page.
(function () {
    'use strict';

    function addSharedStyles() {
        if (document.getElementById('fitfindr-shared-styles')) return;

        var style = document.createElement('style');
        style.id = 'fitfindr-shared-styles';
        style.textContent = `
            .demo-banner {
                position: fixed;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10050;
                padding: 9px 14px;
                background: #111;
                color: #fff;
                font: 600 0.78rem/1.4 "Segoe UI", Tahoma, sans-serif;
                text-align: center;
                letter-spacing: 0.01em;
            }

            .mobile-menu {
                display: none;
                background: none;
                border: 0;
                color: inherit;
                cursor: pointer;
                font-size: 1.5rem;
            }

            @media (max-width: 768px) {
                .nav-links {
                    position: fixed !important;
                    top: 72px !important;
                    left: 0 !important;
                    right: 0 !important;
                    display: none !important;
                    flex-direction: column !important;
                    gap: 0.75rem !important;
                    padding: 1rem !important;
                    background: var(--primary, #000) !important;
                    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2) !important;
                    z-index: 9999 !important;
                }

                .nav-links.active {
                    display: flex !important;
                }

                .mobile-menu {
                    display: block !important;
                    background: none !important;
                    border: 0 !important;
                    color: var(--white, #fff) !important;
                    cursor: pointer !important;
                    font-size: 1.5rem !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function addDemoBanner() {
        if (document.querySelector('.demo-banner')) return;

        var banner = document.createElement('div');
        banner.className = 'demo-banner';
        banner.setAttribute('role', 'note');
        banner.textContent = 'Demo project — accounts are browser-only and payments are disabled.';
        document.body.appendChild(banner);
    }

    function setupMobileMenu() {
        var nav = document.querySelector('.nav-links');
        if (!nav) return;

        if (!nav.id) nav.id = 'primary-navigation';

        var button = document.querySelector('.mobile-menu');
        if (!button) {
            button = document.createElement('button');
            button.className = 'mobile-menu';
            button.type = 'button';
            button.setAttribute('aria-label', 'Toggle navigation');
            button.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
            if (nav.parentNode) nav.parentNode.appendChild(button);
        }

        if (!button) return;
        button.type = 'button';
        button.setAttribute('aria-controls', nav.id);
        button.setAttribute('aria-expanded', 'false');

        button.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('active');
            button.setAttribute('aria-expanded', String(isOpen));
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('active');
                button.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function init() {
        addSharedStyles();
        addDemoBanner();
        setupMobileMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
