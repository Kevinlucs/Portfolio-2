"use strict";
import form from "./form.js";


document.addEventListener("DOMContentLoaded", () => {
    AOS.init({ once: true });
    form();

    const nav = document.querySelector("#nav");
    const navBtn = document.querySelector("#nav-btn");
    const navBtnImg = document.querySelector("#nav-btn-img");
    const goToTop = document.getElementById("goToTop");
    const navLinks = document.querySelectorAll("header nav a");
    const sections = document.querySelectorAll("section");

    // Atualiza link ativo no scroll
    function updateActiveLink() {
        const scrollPos = window.scrollY;
        navLinks.forEach((link) => link.classList.remove("active"));

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const offset = section.offsetTop - 170;
            const height = section.offsetHeight;
            const id = section.getAttribute("id");

            if (scrollPos >= offset && scrollPos < offset + height) {
                const activeLink = document.querySelector(
                    `header nav a[href*="${id}"]`
                );
                if (activeLink) activeLink.classList.add("active");
                break;
            }
        }
    }

    // Alterna menu aberto/fechado
    navBtn.onclick = () => {
        if (nav.classList.toggle("open")) {
            navBtnImg.src = "img/icons/close.svg";
        } else {
            navBtnImg.src = "img/icons/open.svg";
        }
    };

    // Fecha menu ao clicar em link (mobile)
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (nav.classList.contains("open")) {
                nav.classList.remove("open");
                navBtnImg.src = "img/icons/open.svg";
            }
        });
    });

    // Sticky header e botão voltar ao topo
    window.addEventListener("scroll", () => {
        const header = document.querySelector("#header");
        const hero = document.querySelector("#home");
        const triggerHeight = hero.offsetHeight - 170;

        if (window.scrollY > triggerHeight) {
            header.classList.add("header-sticky");
            goToTop.classList.add("reveal");
        } else {
            header.classList.remove("header-sticky");
            goToTop.classList.remove("reveal");
        }
        updateActiveLink();
    });

    // Inicializa underline ativo ao carregar a página
    updateActiveLink();
});
