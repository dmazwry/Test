document.addEventListener('DOMContentLoaded', () => {
    const App = {
        state: {
            products: [],
            cart: [],
            filter: { category: 'Semua', search: '', sort: 'default' },
            discount: { code: null, rate: 0 },
            countdownIntervals: []
        },

        DOMElements: {
            mainHeader: document.getElementById('main-header'),
            productGrid: document.getElementById('productGrid'),
            dealsSection: document.getElementById('dealsSection'),
            dealsGrid: document.getElementById('dealsGrid'),
            skeletonLoader: document.getElementById('skeleton-loader'),
            searchInput: document.getElementById('searchInput'),
            searchSuggestions: document.getElementById('product-suggestions'),
            sortControl: document.getElementById('sortControl'),
            noResultsEl: document.getElementById('no-results'),
            cartBadge: document.getElementById('cartBadge'),
            toastContainer: document.getElementById('toast-container'),
            modals: {
                add: document.getElementById('addToCartModal'),
                cart: document.getElementById('cartModal'),
            },
            buttons: {
                openCart: document.getElementById('openCartBtn'),
                themeToggle: document.getElementById('theme-toggle'),
            },
            categoryTabs: document.getElementById('categoryTabs'),
            themeIcons: {
                light: document.getElementById('theme-icon-light'),
                dark: document.getElementById('theme-icon-dark'),
            },
            testimonialContainer: document.getElementById('testimonialContainer'),
        },

        init() {
            this.theme.apply(this.theme.load());
            this.cart.load();
            this.fetchProducts();
            this.ui.populateSearchDatalist();
            this.ui.renderCategories();
            this.ui.renderTestimonials();
            this.listeners.setup();
            this.ui.setupHeroSlider();

            this.DOMElements.skeletonLoader.style.display = 'grid';
            setTimeout(() => {
                this.ui.renderAll();
                this.ui.addProductImageShimmers();
            }, 600);
        },

        helpers: {
            formatPrice: (price) => new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0 
            }).format(price),
            
            getImageUrl(product) {
                const bgColor = product.imageColor || 'EDF2F7';
                const textColor = this.isColorLight(bgColor) ? '2D3748' : 'FFFFFF';
                return `https://placehold.co/400x300/${bgColor}/${textColor}?text=${product.name}&font=inter`;
            },
            
            isColorLight(hexcolor){
                if(hexcolor.length < 6) return true;
                const r = parseInt(hexcolor.substr(0, 2), 16);
                const g = parseInt(hexcolor.substr(2, 2), 16);
                const b = parseInt(hexcolor.substr(4, 2), 16);
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                return (yiq >= 128);
            }
        },

        // Product data will be loaded here
        fetchProducts() {
            // Product data array - keeping it compact
            this.state.products = [
                { id: 1, name: "YOUTUBE", title: "Youtube Premium", stock: "99+", rating: "4.9", category: "app", dateAdded: '2025-07-01', imageColor: 'FF0000', description: "Nikmati jutaan video tanpa iklan, putar di latar belakang, dan akses YouTube Music Premium.", testimonials: [{ name: 'Rina W.', text: "Akunnya aman, bisa dipakai sekeluarga. Nonton jadi nyaman tanpa iklan sama sekali." }], variants: [{ name: "1 Bulan", price: 12000 }, { name: "4 Bulan", price: 40000 }], isBestSeller: true, deal: { originalPrice: 15000, label: 'Promo Terbatas!', endDate: '2025-07-15T23:59:59' }},
                { id: 2, name: "SPOTIFY", title: "Spotify Premium", stock: "50+", rating: "5.0", category: "app", dateAdded: '2025-06-25', imageColor: '1DB954', description: "Dengarkan musik favoritmu tanpa batas.", testimonials: [{ name: 'Ahmad Fauzi', text: "Prosesnya cepet banget, gak sampai 5 menit akun udah aktif." }], variants: [{ name: "1 Bulan", price: 16500 }]},
                { id: 3, name: "NETFLIX", title: "Netflix Premium UHD", stock: "99+", rating: "4.7", category: "app", dateAdded: '2025-06-30', imageColor: 'E50914', description: "Streaming ribuan film dan serial TV populer dengan kualitas terbaik hingga Ultra HD (4K).", testimonials: [{ name: 'Ivan T.', text: "Kualitas UHD-nya jernih banget, nonton di TV jadi seru." }], variants: [{ name: "Sharing 1 Profile", price: 35750 }]},
                // Add more products here...
            ];
        },

        ui: {
            renderAll() {
                this.renderProducts();
                this.renderDealsSection();
            },

            renderProducts() {
                const { productGrid, skeletonLoader, noResultsEl } = App.DOMElements;
                productGrid.innerHTML = '';
                skeletonLoader.style.display = 'none';

                let productsToRender = App.state.products.filter(p => {
                    const { category, search } = App.state.filter;
                    const categoryMatch = category === 'Semua' || p.category.toLowerCase() === category.toLowerCase();
                    const searchMatch = search ? (p.name.toLowerCase().includes(search) || p.title.toLowerCase().includes(search)) : true;
                    return categoryMatch && searchMatch;
                });

                noResultsEl.classList.toggle('hidden', productsToRender.length > 0);
                productGrid.classList.toggle('hidden', productsToRender.length === 0);

                productsToRender.forEach((p, index) => { 
                    const card = document.createElement('div');
                    card.className = 'product-card rounded-3xl shadow-xl flex flex-col relative overflow-hidden group';
                    card.dataset.id = p.id; 
                    card.style.animationDelay = `${index * 75}ms`;
                    
                    let badgeHtml = '';
                    if(p.deal) badgeHtml = `<div class="product-badge deal">${p.deal.label}</div>`;
                    else if(p.isBestSeller) badgeHtml = '<div class="product-badge best-seller">Best Seller</div>';
                    else if (p.isNew) badgeHtml = '<div class="product-badge">New</div>';

                    card.innerHTML = `
                        ${badgeHtml}
                        <div class="relative product-image overflow-hidden rounded-t-3xl">
                            <img src="${App.helpers.getImageUrl(p)}" alt="${p.title}" class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div class="absolute top-4 left-4 flex items-center space-x-2">
                                <div class="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                                    <i class="fas fa-star text-yellow-400 mr-1"></i>
                                    <span class="font-semibold">${p.rating}</span>
                                </div>
                                <div class="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                                    <i class="fas fa-check-circle text-emerald-400 mr-1"></i>
                                    <span class="font-medium">${p.stock}</span>
                                </div>
                            </div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow relative z-10">
                            <div class="mb-4">
                                <h3 class="title-gradient font-bold text-xl mb-2 leading-tight">${p.title}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Premium digital product dengan kualitas terbaik</p>
                            </div>
                            <div class="mt-auto">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Mulai dari</p>
                                        <p class="price-highlight text-2xl font-bold">${App.helpers.formatPrice(p.variants[0].price)}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Rating</div>
                                        <div class="flex items-center">
                                            ${Array(5).fill().map(() => 
                                                `<i class="fas fa-star text-amber-400 text-xs mr-1"></i>`
                                            ).join('')}
                                        </div>
                                    </div>
                                </div>
                                <button aria-label="Tambah ke keranjang ${p.title}" class="add-to-cart-btn btn-primary text-white rounded-2xl w-full h-12 text-sm font-bold flex items-center justify-center shadow-lg hover:shadow-xl">
                                    <i class="fas fa-plus mr-2"></i>
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        </div>`;
                    productGrid.appendChild(card);
                });
            },

            setupHeroSlider() {
                new Swiper('.hero-slider', {
                    loop: true,
                    autoplay: { delay: 5000, disableOnInteraction: false },
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                });
            },

            showToast(message, icon = 'fa-check-circle', bgClass = 'bg-gradient-to-r from-emerald-500 to-green-500') {
                const toast = document.createElement('div');
                toast.className = `toast-notification toast-slide ${bgClass} text-white text-sm font-bold p-4 rounded-2xl shadow-2xl flex items-center gap-3 glass-effect border border-white/20`;
                toast.innerHTML = `
                    <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <i class="fas ${icon}"></i>
                    </div>
                    <span>${message}</span>
                `;
                App.DOMElements.toastContainer.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(100%) scale(0.8)';
                    setTimeout(() => toast.remove(), 300);
                }, 3500);
            }
        },

        cart: {
            save() {
                localStorage.setItem('dmazAlyxersCart', JSON.stringify(App.state.cart));
                App.ui.updateCartBadge();
            },
            
            load() {
                App.state.cart = JSON.parse(localStorage.getItem('dmazAlyxersCart') || '[]');
                App.ui.updateCartBadge();
            }
        },

        theme: {
            apply(theme) {
                const isDark = theme === 'dark';
                document.documentElement.classList.toggle('dark', isDark);
                App.DOMElements.themeIcons.dark.style.display = isDark ? 'inline-block' : 'none';
                App.DOMElements.themeIcons.light.style.display = isDark ? 'none' : 'inline-block';
            },
            
            toggle() {
                const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                localStorage.setItem('theme', newTheme);
                this.apply(newTheme);
            },
            
            load() {
                return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            }
        },

        listeners: {
            setup() {
                App.DOMElements.buttons.themeToggle.addEventListener('click', () => App.theme.toggle());
                
                window.addEventListener('scroll', () => {
                    App.DOMElements.mainHeader.classList.toggle('scrolled', window.scrollY > 50);
                    
                    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
                    if (window.scrollY > 300) {
                        scrollToTopBtn.style.display = 'flex';
                    } else {
                        scrollToTopBtn.style.display = 'none';
                    }
                });
                
                document.getElementById('scrollToTopBtn').addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        }
    };

    App.init();
});