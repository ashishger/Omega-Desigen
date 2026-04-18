(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-btn");
  const nav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

  const normalizePage = (path) => {
    const cleanPath = (path || "").split("?")[0].split("#")[0];
    if (!cleanPath || cleanPath === "/") {
      return "index.html";
    }

    return cleanPath.replace(/^.*[\\/]/, "").toLowerCase();
  };

  const currentPage = normalizePage(window.location.pathname);
  const homeAliases = new Set(["index.html", "omega desigen.html"]);

  const closeMenu = () => {
    body.classList.remove("nav-open");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
    }
  };

  const setActiveNavByPage = () => {
    if (navLinks.length === 0) {
      return;
    }

    navLinks.forEach((link) => link.classList.remove("active"));

    let matched = false;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }

      const linkPage = normalizePage(href);
      const isHomeLink = linkPage === "index.html";
      const isHomeAlias = homeAliases.has(currentPage) && isHomeLink;

      if (linkPage === currentPage || isHomeAlias) {
        link.classList.add("active");
        matched = true;
      }
    });

    if (!matched) {
      const homeLink = navLinks.find((link) => normalizePage(link.getAttribute("href") || "") === "index.html");
      if (homeLink) {
        homeLink.classList.add("active");
      }
    }
  };

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (header && nav) {
    document.addEventListener("click", (event) => {
      if (!body.classList.contains("nav-open")) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (!header.contains(target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  setActiveNavByPage();

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 80, 420)}ms`);
  });

  if ("IntersectionObserver" in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const sectionLinks = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        return null;
      }

      const section = document.querySelector(href);
      if (!section) {
        return null;
      }

      return {
        link,
        section,
      };
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sectionLinks.length > 0) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const matched = sectionLinks.find((item) => item.section === entry.target);
          if (!matched) {
            return;
          }

          navLinks.forEach((link) => link.classList.remove("active"));
          matched.link.classList.add("active");
        });
      },
      {
        threshold: 0.45,
        rootMargin: "-20% 0px -30% 0px",
      }
    );

    sectionLinks.forEach((item) => activeObserver.observe(item.section));
  }

  const enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm instanceof HTMLFormElement) {
    enquiryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const status = enquiryForm.querySelector("[data-form-status]");
      const submitButton = enquiryForm.querySelector("button[type='submit']");

      if (!(submitButton instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) {
        return;
      }

      if (!enquiryForm.checkValidity()) {
        enquiryForm.reportValidity();
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      status.hidden = false;
      status.textContent = "Sending your enquiry now.";

      const formData = new FormData(enquiryForm);
      formData.append("_subject", "New Enquiry from Omega Design Website");
      formData.append("_captcha", "false");
      formData.append("_template", "table");

      try {
        const response = await fetch("https://formsubmit.co/ajax/omega.design@aol.com", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        status.textContent = "Thank you. Your enquiry has been sent successfully. Omega Design will contact you soon.";
        enquiryForm.reset();
      } catch (error) {
        status.textContent = "Could not send right now. Please try again or call +91 7044558810.";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Enquiry";
      }
    });
  }

  const yearNodes = document.querySelectorAll("[data-year]");
  yearNodes.forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
