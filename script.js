let fullTechnologies = [];
let filteredTechnologies = [];
let currentIndex = 0;
const ITEMS_PER_LOAD = 50;

const DOM = {
    loading: document.getElementById('loading'),
    list: document.getElementById('techList'),
    pills: document.querySelectorAll('.pill')
};

// Colors for the circular icons
const COLORS = [
    '#f59e0b', // amber (like Google Analytics G)
    '#f97316', // orange (like Cloudflare C)
    '#3b82f6', // blue (like Wix W)
    '#8b5cf6', // purple (like WooCommerce W)
    '#38bdf8', // light blue (like Squarespace S)
    '#10b981', // emerald
    '#ef4444', // red
    '#84cc16'  // lime
];

function getHashColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return COLORS[hash % COLORS.length];
}

async function init() {
    try {
        const response = await fetch('techleads_full_data.json');
        const data = await response.json();
        
        fullTechnologies = data.technologies;
        filteredTechnologies = fullTechnologies;
        
        DOM.loading.style.display = 'none';
        
        setupPills();
        loadMoreItems();
        setupInfiniteScroll();
    } catch (error) {
        DOM.loading.textContent = 'Error loading data.';
        console.error(error);
    }
}

function setupPills() {
    DOM.pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            // Update active state
            DOM.pills.forEach(p => p.classList.remove('active'));
            const clicked = e.currentTarget;
            clicked.classList.add('active');
            
            // Filter logic
            const category = clicked.textContent.trim().toLowerCase();
            
            if (category === 'all') {
                filteredTechnologies = fullTechnologies;
            } else {
                // Since we don't have exact categories mapped in the JSON,
                // we do a fuzzy text search on the URL or name to simulate it.
                filteredTechnologies = fullTechnologies.filter(tech => 
                    tech.url.toLowerCase().includes(category) || 
                    tech.name.toLowerCase().includes(category)
                );
                
                // If fuzzy search yields nothing, just show all to avoid empty state
                if (filteredTechnologies.length === 0) {
                    filteredTechnologies = fullTechnologies;
                }
            }
            
            // Reset list
            DOM.list.innerHTML = '';
            currentIndex = 0;
            loadMoreItems();
        });
    });
}

function loadMoreItems() {
    const end = Math.min(currentIndex + ITEMS_PER_LOAD, filteredTechnologies.length);
    const fragment = document.createDocumentFragment();
    
    for (let i = currentIndex; i < end; i++) {
        const item = filteredTechnologies[i];
        
        const li = document.createElement('li');
        li.className = 'tech-item';
        
        const firstLetter = item.name.charAt(0).toUpperCase();
        const bgColor = getHashColor(item.name);
        
        li.innerHTML = `
            <input type="checkbox" class="tech-checkbox" />
            <div class="tech-icon" style="background-color: ${bgColor};">
                ${firstLetter}
            </div>
            <div class="tech-name">${item.name}</div>
        `;
        
        fragment.appendChild(li);
    }
    
    DOM.list.appendChild(fragment);
    currentIndex = end;
}

function setupInfiniteScroll() {
    const listContainer = document.querySelector('.list-container');
    listContainer.addEventListener('scroll', () => {
        if (listContainer.scrollTop + listContainer.clientHeight >= listContainer.scrollHeight - 100) {
            if (currentIndex < filteredTechnologies.length) {
                loadMoreItems();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
