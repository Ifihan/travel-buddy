document.addEventListener("DOMContentLoaded", () => {

  const mobileMenuButton = document.querySelector(".mobile-menu-button")
  const navLinks = document.querySelector(".nav-links")

  mobileMenuButton.addEventListener("click", () => {
    navLinks.classList.toggle("active")
  })

  document.addEventListener("click", (e) => {
    if (!mobileMenuButton.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("active")
    }
  })

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        })

        navLinks.classList.remove("active")
      }
    })
  })

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
      }
    })
  }, observerOptions)

  document.querySelectorAll("section").forEach((section) => {
    section.classList.add("fade-in")
    observer.observe(section)
  })

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("current-year").textContent = new Date().getFullYear();
});


  const style = document.createElement("style")
  style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `
  document.head.appendChild(style)
})

