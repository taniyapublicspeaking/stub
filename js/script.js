/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("mainNav");

if (menuBtn && nav) {

    menuBtn.addEventListener("click", () => {

        const isOpen = nav.classList.toggle("active");

        menuBtn.classList.toggle("active", isOpen);

        menuBtn.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    /* Close menu after clicking a link */

    nav.querySelectorAll("a").forEach((link) => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");

            menuBtn.classList.remove("active");

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );
        });

    });


    /* Close menu when clicking outside */

    document.addEventListener("click", (event) => {

        if (
            !nav.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            nav.classList.remove("active");

            menuBtn.classList.remove("active");

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    });

}
