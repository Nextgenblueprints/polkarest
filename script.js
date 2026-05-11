document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal logic for elements
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up, .mask-container, .hero-subtitle');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Apply optional staggered delays to mask inners
                const inner = entry.target.querySelector('.mask-inner');
                if (inner && inner.dataset.delay) {
                    inner.style.transitionDelay = inner.dataset.delay;
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    function setupCurvedText(elementId, totalAngle, startAngle, baseDelay = 500) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const text = container.textContent;
        container.textContent = '';
        
        const chars = text.split('');
        const angleStep = totalAngle / (chars.length - 1);

        chars.forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'char';
            const rotation = startAngle + (i * angleStep);
            span.style.setProperty('--rot', `${rotation}deg`);
            container.appendChild(span);
            
            // Revealed character by character with 100ms delay for a slow, premium feel
            setTimeout(() => {
                span.classList.add('visible');
            }, baseDelay + (i * 100));
        });
    }

    setupCurvedText('top-title', 120, -60, 500);
    setupCurvedText('bottom-title', 120, 120, 1500);

    fadeElements.forEach(el => observer.observe(el));

    // Custom Magnetic Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    if (cursorDot && cursorRing) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            // Add a slight lag to the ring for a smooth, organic feel
            setTimeout(() => {
                cursorRing.style.left = e.clientX + 'px';
                cursorRing.style.top = e.clientY + 'px';
            }, 50);
        });

        // Add 'active' class on hover over clickable/interactive elements
        const interactives = document.querySelectorAll('a, button, .massive-rating, .feature-tag');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
        });
    }

    // Scroll-Linked Parallax (Curtain Reveal) for Hero
    const heroVideoContainer = document.querySelector('.video-container');
    const heroTitle = document.querySelector('.hero-title');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (heroVideoContainer && scrollY < window.innerHeight) {
            const scale = 1 - (scrollY / window.innerHeight) * 0.15;
            const opacity = 1 - (scrollY / window.innerHeight) * 1.5;
            
            heroVideoContainer.style.transform = `scale(${Math.max(0.85, scale)})`;
            heroVideoContainer.style.opacity = Math.max(0, opacity);
            
            if (heroTitle) {
                heroTitle.style.transform = `translateY(${scrollY * 0.5}px)`;
                heroTitle.style.opacity = Math.max(0, 1 - (scrollY / 300));
            }
        }
    });

    // Cinematic Video Slider (Switches between multiple videos)
    const video0 = document.getElementById('hero-video-0');
    const video1 = document.getElementById('hero-video-1');
    const video2 = document.getElementById('hero-video-2');
    const videos = [
        { 
            el: video0, 
            segments: [{ start: 0, end: 5 }], // Default good segment for the new first video
            duration: 5000 
        },
        { 
            el: video1, 
            segments: [{ start: 3, end: 4 }], // Your requested clip
            duration: 4000 // How long to show this video
        },
        { 
            el: video2, 
            segments: [{ start: 0, end: 5 }], // Default good segment for video 2
            duration: 5000 
        }
    ];

    let currentVideoIndex = 0;

    function initVideo(videoObj) {
        const video = videoObj.el;
        if (!video) return;

        let segmentIndex = 0;
        video.currentTime = videoObj.segments[0].start;
        video.playbackRate = 0.45; // Significantly slowed down for an ultra-cinematic effect
        
        video.addEventListener('timeupdate', () => {
            const currentSegment = videoObj.segments[segmentIndex];
            if (video.currentTime >= currentSegment.end) {
                // Check if there are more segments to play in this video
                if (segmentIndex < videoObj.segments.length - 1) {
                    segmentIndex++;
                    video.currentTime = videoObj.segments[segmentIndex].start;
                } else {
                    // This video is finished with its parts
                    video.pause();
                }
            }
        });
    }

    // Initialize all videos
    videos.forEach(initVideo);
    if (video1) video1.play();

    // Slider Logic
    function switchVideo() {
        if (currentVideoIndex >= videos.length - 1) return; // Stop at the last video

        const oldVideo = videos[currentVideoIndex].el;
        currentVideoIndex++;
        const newVideo = videos[currentVideoIndex].el;

        if (oldVideo && newVideo) {
            oldVideo.classList.remove('active');
            newVideo.classList.add('active');
            newVideo.play();
            
            // Pause the old one after fade to save resources
            setTimeout(() => {
                oldVideo.pause();
            }, 1500);
        }

        // Schedule next switch ONLY if there are more videos
        if (currentVideoIndex < videos.length - 1) {
            setTimeout(switchVideo, videos[currentVideoIndex].duration);
        }
    }

    // Start the slider after the first video's duration (one-time only)
    if (videos.length > 1) {
        setTimeout(switchVideo, videos[0].duration);
    }

    // === Admin / Client Editing System ===
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === '1';

    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');

    if (isAdmin && addItemBtn && addItemModal) {
        addItemBtn.style.display = 'inline-block';
        // Ensure modal starts hidden despite inline style
        addItemModal.style.display = 'none'; 
        
        const cancelBtn = document.getElementById('cancel-item-btn');
        const addItemForm = document.getElementById('addItemForm');
        
        addItemBtn.addEventListener('click', () => {
            addItemModal.classList.remove('hidden');
            addItemModal.style.display = 'flex';
        });

        cancelBtn.addEventListener('click', () => {
            addItemModal.classList.add('hidden');
            addItemModal.style.display = 'none';
        });

        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('item-category').value;
            const name = document.getElementById('item-name').value;
            const price = document.getElementById('item-price').value;
            const desc = document.getElementById('item-desc').value;

            const newItem = { category, name, price, desc };
            saveMenuItem(newItem);
            renderMenuItem(newItem);
            
            addItemForm.reset();
            addItemModal.classList.add('hidden');
            addItemModal.style.display = 'none';
        });
    }

    function saveMenuItem(item) {
        let items = JSON.parse(localStorage.getItem('polka_menu_items') || '[]');
        items.push(item);
        localStorage.setItem('polka_menu_items', JSON.stringify(items));
    }

    function renderMenuItem(item) {
        const categories = document.querySelectorAll('.menu-category');
        let targetCategory = null;
        categories.forEach(cat => {
            if (cat.querySelector('.category-title').textContent.trim() === item.category) {
                targetCategory = cat;
            }
        });

        if (targetCategory) {
            const menuItemsContainer = targetCategory.querySelector('.menu-items');
            const itemHTML = `
                <div class="menu-item fade-in visible">
                    <div class="item-header">
                        <h4 class="item-name">${item.name}</h4>
                        <span class="item-dots"></span>
                        <span class="item-price">&#8377;${item.price}</span>
                    </div>
                    <p class="item-desc">${item.desc}</p>
                </div>
            `;
            menuItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        }
    }

    function loadSavedItems() {
        const items = JSON.parse(localStorage.getItem('polka_menu_items') || '[]');
        items.forEach(renderMenuItem);
    }

    loadSavedItems();
});
