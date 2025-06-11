function animateOnScroll() {
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add("visible");
    }
  });
}
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Initialize scroll animations
window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);

// Add dynamic number animation for stats
function animateNumbers() {
  const numbers = document.querySelectorAll(".stat-number");
  numbers.forEach((number) => {
    const finalNumber = number.textContent;
    if (!isNaN(finalNumber)) {
      let currentNumber = 0;
      const increment = Math.ceil(finalNumber / 50);
      const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
          number.textContent = finalNumber;
          clearInterval(timer);
        } else {
          number.textContent = currentNumber;
        }
      }, 30);
    }
  });
}

// Trigger number animation when stats section is visible
const statsSection = document.querySelector(".stats");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateNumbers();
      observer.unobserve(entry.target);
    }
  });
});
observer.observe(statsSection);
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("menu").classList.toggle("active");
});
