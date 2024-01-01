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

document.getElementById('navbar-toggle').addEventListener('click', function() {
    document.querySelector('.navbar-links').classList.toggle('responsive');
});
