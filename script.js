document.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("back-to-top-btn").style.display = "block";
    } else {
        document.getElementById("back-to-top-btn").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
document.getElementById("back-to-top-btn").onclick = function() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
};

document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('navbar-toggle');
    var navbarLinks = document.getElementById('navbar-links');
    var closeButton = document.getElementById('close-menu');

    toggle.addEventListener('click', function() {
        navbarLinks.classList.add('responsive');
    });

    closeButton.addEventListener('click', function() {
        navbarLinks.classList.remove('responsive');
    });

    var links = navbarLinks.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function() {
            navbarLinks.classList.remove('responsive');
        });
    }
});

