// Add to bottom of each page, or in a shared navigation.js
document.addEventListener('DOMContentLoaded', () => {
    // Get current page from URL
    const currentPage = window.location.pathname.split('/').slice(-2, -1)[0];
    
    // Find and highlight current nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.href.includes(currentPage)) {
            item.classList.add('active');
        }
    });
});