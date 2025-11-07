console.log('appearance-gallery.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Get the main image element and its container
    const mainImage = document.querySelector('#main-appearance-image');
    const mainImageContainer = document.querySelector('.appearance-main-image');
    const imageTitle = document.querySelector('#appearance-image-title');
    
    console.log('Main image element:', mainImage);
    console.log('Main image container:', mainImageContainer);
    
    // Get all side image containers
    const sideImageContainers = Array.from(document.querySelectorAll('.appearance-side-image'));
    console.log('Found side images:', sideImageContainers.length);
    
    // Function to change image
    function changeImage(targetContainer) {
        // Don't do anything if this image is already active
        if (targetContainer.classList.contains('active')) return;
        
        // Get the main image source from the data attribute
        const mainImagePath = targetContainer.getAttribute('data-main-src');
        // Get the title text from the data attribute
        const titleText = targetContainer.getAttribute('data-title') || 'View';
        
        // Add loading class to show fade effect
        mainImageContainer.classList.add('loading');
        
        // Wait for the fade out to complete
        setTimeout(() => {
            // Update the main image source
            mainImage.src = mainImagePath;
            // Update the title text
            if (imageTitle) {
                imageTitle.textContent = titleText;
            }
            
            // Wait for the new image to load
            mainImage.onload = function() {
                // Remove loading class to fade in the new image
                mainImageContainer.classList.remove('loading');
            };
            
            // Update active state
            sideImageContainers.forEach(img => img.classList.remove('active'));
            targetContainer.classList.add('active');
        }, 250); // Half of the transition duration (0.5s)
    }
    
    // Add click event listeners to each side image container
    sideImageContainers.forEach(container => {
        container.addEventListener('click', function() {
            changeImage(this);
        });
    });
    
    // Touch events for swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    // Prevent default touch actions that might interfere
    document.addEventListener('touchmove', function(e) {
        if (isSwiping) {
            e.preventDefault();
        }
    }, { passive: false });
    
    mainImageContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
    }, { passive: true });
    
    mainImageContainer.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        touchEndX = e.touches[0].clientX;
        // Add visual feedback during swipe
        const diff = touchStartX - touchEndX;
        mainImageContainer.style.transform = `translateX(${-diff/5}px)`;
    }, { passive: true });
    
    mainImageContainer.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].clientX;
        isSwiping = false;
        
        // Reset transform
        mainImageContainer.style.transform = '';
        
        handleSwipe();
    }, { passive: true });
    
    mainImageContainer.addEventListener('touchcancel', function() {
        isSwiping = false;
        mainImageContainer.style.transform = '';
    }, { passive: true });
    
    function handleSwipe() {
        const currentIndex = sideImageContainers.findIndex(container => container.classList.contains('active'));
        const diff = touchStartX - touchEndX;
        const swipeThreshold = 50; // Minimum swipe distance in pixels
        
        // Swipe left (next image)
        if (diff > swipeThreshold && currentIndex < sideImageContainers.length - 1) {
            changeImage(sideImageContainers[currentIndex + 1]);
        }
        // Swipe right (previous image)
        else if (-diff > swipeThreshold && currentIndex > 0) {
            changeImage(sideImageContainers[currentIndex - 1]);
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const currentIndex = sideImageContainers.findIndex(container => container.classList.contains('active'));
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            changeImage(sideImageContainers[currentIndex - 1]);
        } else if (e.key === 'ArrowRight' && currentIndex < sideImageContainers.length - 1) {
            changeImage(sideImageContainers[currentIndex + 1]);
        }
    });
    
    // Set first image as active by default
    if (sideImageContainers.length > 0) {
        sideImageContainers[0].classList.add('active');
        // Set initial title text
        const initialTitle = sideImageContainers[0].getAttribute('data-title') || 'Full view';
        if (imageTitle) {
            imageTitle.textContent = initialTitle;
        }
    }
});
