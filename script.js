// script.js

// ==========================================================================
// 1. DYNAMIC FOOTER LOADER
// What it does: Looks for an element with the ID 'footer-container'. If it finds it, 
// it fetches the external 'footer.html' file and injects its contents into the page.
// This allows you to write your footer once and reuse it across multiple pages.
// ==========================================================================
const footerContainer = document.getElementById('footer-container');
if (footerContainer) {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            footerContainer.innerHTML = data; // Injects the loaded HTML into the container
        })
        .catch(error => console.error('Error loading the footer:', error)); // Logs an error if the file is missing
}

// ==========================================================================
// 2. MOBILE SIDEBAR TOGGLE
// What it does: Makes your navigation responsive. On mobile devices, when the user 
// clicks the hamburger menu icon (.mobile-nav-toggle), it adds or removes the 
// 'active' class on the sidebar to slide the menu in and out.
// ==========================================================================
const mobileToggle = document.querySelector('.mobile-nav-toggle');
const sidebar = document.querySelector('.sidebar');

if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active'); // Toggles the visibility of the mobile menu
    });
}

// ==========================================================================
// 3. COLOR THEME SWITCHER
// What it does: Allows users to change the primary accent color of your portfolio.
// It saves their choice to their browser's local storage so the site remembers 
// their preference even if they refresh the page or come back tomorrow.
// ==========================================================================
const colorBtns = document.querySelectorAll('.color-btn');
const themeColorsContainer = document.querySelector('.theme-colors');
const themeGearBtn = document.querySelector('.theme-switcher .theme-toggle-btn');

// Opens/closes the pop-out color palette when the gear icon is clicked
if (themeGearBtn && themeColorsContainer) {
    themeGearBtn.addEventListener('click', () => {
        themeColorsContainer.classList.toggle('active-palette');
    });
}

// Listens for clicks on the individual color buttons
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const newColor = btn.getAttribute('data-color'); // Gets the hex code assigned to the button clicked
        document.documentElement.style.setProperty('--accent-color', newColor); // Updates the CSS variable globally
        localStorage.setItem('joshThemeColor', newColor); // Saves the color choice to the browser's memory
    });
});

// Checks browser memory on page load to see if the user previously selected a custom color
const savedColor = localStorage.getItem('joshThemeColor');
if (savedColor) {
    document.documentElement.style.setProperty('--accent-color', savedColor); // Applies the saved color immediately
}

// ==========================================================================
// 4. SCROLL REVEAL ANIMATIONS
// What it does: Uses the Intersection Observer API to detect when elements enter 
// the viewport while scrolling down. It then triggers CSS transitions to fade 
// them in smoothly, giving the site a premium, modern feel.
// ==========================================================================
const observerOptions = {
    threshold: 0.1, // Animation triggers when at least 10% of the element is visible on screen
    rootMargin: "0px 0px -50px 0px" // Starts the animation slightly before the element fully enters the screen
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1'; // Fades the element in
            entry.target.style.transform = 'translateY(0)'; // Moves the element to its original vertical position
            observer.unobserve(entry.target); // Stops watching the element once it has animated so it doesn't repeat
        }
    });
}, observerOptions);

// Updated list of elements to watch for the scroll-fade-in effect
const animatedElements = document.querySelectorAll('.skills-section, .resume-section, .projects-section, .project-card, .resume-item, .contact-section');
animatedElements.forEach(el => {
    el.style.opacity = '0'; // Makes the element invisible initially
    el.style.transform = 'translateY(40px)'; // Pushes the element 40px down initially
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'; // Controls the speed of the fade-in
    observer.observe(el); // Tells the observer to start watching this specific element
});

// ==========================================================================
// 5. DYNAMIC TYPING EFFECT
// What it does: Creates the cool typewriter animation in your Hero Section.
// It cycles through an array of professional titles, typing them out character 
// by character, pausing, and then deleting them to type the next one.
// ==========================================================================
const typingTextSpan = document.querySelector('.typing-text');
const cursorSpan = document.querySelector('.cursor'); // Grabs the blinking cursor span

if (typingTextSpan) {
    const textArray = ["Full-Stack Developer", "Software Engineer", "Problem Solver"];
    let textIndex = 0; // Tracks which word in the array we are currently on
    let charIndex = 0; // Tracks which letter of the current word we are on
    let isDeleting = false; // A flag to tell the function whether it should be typing or backspacing

    function typeEffect() {
        const currentText = textArray[textIndex];
        
        // Handles adding or removing letters
        if (isDeleting) {
            typingTextSpan.textContent = currentText.substring(0, charIndex - 1); // Removes the last letter
            charIndex--;
        } else {
            typingTextSpan.textContent = currentText.substring(0, charIndex + 1); // Adds the next letter
            charIndex++;
        }
        
        let typingSpeed = isDeleting ? 50 : 100; // Types at normal speed (100ms), deletes faster (50ms)
        
        // Logic for when a word is fully typed out
        if (!isDeleting && charIndex === currentText.length) {
            typingSpeed = 2000; // Pause for 2 seconds at the end of the word so people can read it
            isDeleting = true;  // Switches the flag so the next cycle starts deleting
        } 
        // Logic for when a word is completely deleted
        else if (isDeleting && charIndex === 0) {
            isDeleting = false; // Switches the flag back to typing mode
            textIndex = (textIndex + 1) % textArray.length; // Moves to the next word in the array (loops back to the start if at the end)
            typingSpeed = 500;  // Pause for half a second before starting to type the next word
        }
        
        setTimeout(typeEffect, typingSpeed); // Loops the function infinitely
    }
    
    typeEffect(); // Kicks off the animation immediately when the page loads
}

// ==========================================================================
// 6. FUNCTIONAL CONTACT FORM (Uses Formspree & Fetch API)
// What it does: Intercepts the form submission, sends the data to Formspree 
// in the background without reloading the page, and updates the button UI.
// ==========================================================================
const contactForm = document.querySelector('#contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevents the browser from navigating away to a new page
        
        const submitBtn = contactForm.querySelector('button');
        const originalText = submitBtn.innerHTML; 
        
        // 1. Loading State: Changes button to a spinning icon while sending
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true; // Temporarily disables the button so the user can't click it twice
        
        try {
            // 2. Gathers all the data typed into the form inputs
            const formData = new FormData(contactForm);
            
            // 3. Sends the data to the URL in your form's 'action' attribute
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Tells Formspree we want a silent JSON response, not a page redirect
                }
            });
            
            if (response.ok) {
                // 4. Success State: Formspree received it! Turn the button green.
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message Sent!';
                submitBtn.style.backgroundColor = '#10b981'; 
                submitBtn.style.color = 'white';
                
                contactForm.reset(); // Empties the input fields for the next message
            } else {
                // 5. Error State: Something went wrong on Formspree's end
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Error Sending';
                submitBtn.style.backgroundColor = '#ef4444'; // Red error color
            }
        } catch (error) {
            // 6. Network Error: The user lost internet connection
            submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Network Error';
            submitBtn.style.backgroundColor = '#ef4444';
        }
        
        // 7. Reset: Returns the button to its original blue state after 3 seconds
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.backgroundColor = ''; 
            submitBtn.style.color = ''; 
            submitBtn.disabled = false; // Re-enables the button
        }, 3000);
    });
}

// ==========================================================================
// 8. CUSTOM MODAL LOGIC (Replaces the old alert() box)
// What it does: Controls the visibility of the "Project Under Construction"
// popup. It listens for clicks on any link with the 'pending-link' class,
// displays the modal overlay, and handles the logic to close it.
// ==========================================================================

// 1. Grab the modal and close button elements from the DOM
const modal = document.getElementById('status-modal');
const closeBtn = document.getElementById('close-modal');

// 2. Select ALL buttons that have the class 'pending-link' attached
const modalTriggerLinks = document.querySelectorAll('.pending-link');

// Ensure the modal actually exists on the page before trying to add events to it
if (modal && closeBtn) {
    // 3. Loop through each 'pending-link' button and add a click event listener
    modalTriggerLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevents the browser from jumping to the top of the page
            modal.style.display = 'flex'; // Displays the modal by changing display from 'none' to 'flex'
        });
    });

    // 4. Listen for clicks on the 'Got it!' button to hide the modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none'; // Hides the modal completely
    });

    // 5. Listen for clicks anywhere on the window object
    window.addEventListener('click', (e) => {
        // If the user clicked directly on the dark, blurry overlay background...
        if (e.target === modal) {
            modal.style.display = 'none'; // ...close the modal
        }
    });
}