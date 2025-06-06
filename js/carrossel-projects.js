document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const slidesOriginal = Array.from(track.children); // <li> originais
    const prevButton = document.querySelector(".carousel-button.prev");
    const nextButton = document.querySelector(".carousel-button.next");

    let slides = []; // conterá originais + clones (quando houver looping)
    let slideWidth = 0;
    let currentIndex = 0;
    let slidesToShow = 1;
    let isTransitioning = false;
    let loopingAtivo = false;

    // 1) Quantos slides devem ficar visíveis de acordo com a largura da tela
    function visibleSlides() {
        const width = window.innerWidth;
        if (width <= 720) return 1;
        if (width <= 977) return 2;
        return 3; // acima de 978px
    }

    // 2) Monta ou remonta a lista de slides (originais + clones)
    function setupSlides() {
        // HTML: limpar tudo dentro do track
        while (track.firstChild) {
            track.removeChild(track.firstChild);
        }

        slidesToShow = visibleSlides();
        const totalReal = slidesOriginal.length;

        // Se houver mais slides reais do que o número de slots visíveis => looping
        if (totalReal > slidesToShow) {
            loopingAtivo = true;
            // Clona os últimos "slidesToShow" para antes
            const clonesBefore = slidesOriginal
                .slice(-slidesToShow)
                .map((slide) => slide.cloneNode(true));
            // Clona os primeiros "slidesToShow" para depois
            const clonesAfter = slidesOriginal
                .slice(0, slidesToShow)
                .map((slide) => slide.cloneNode(true));
            slides = [...clonesBefore, ...slidesOriginal, ...clonesAfter];
        } else {
            // Sem looping: apenas os originais
            loopingAtivo = false;
            slides = [...slidesOriginal];
        }

        // Adiciona ao DOM (track) todos os elementos: [clonesBefore..., originais..., clonesAfter...]
        slides.forEach((slide) => track.appendChild(slide));

        // Define o índice inicial
        currentIndex = loopingAtivo ? slidesToShow : 0;

        // Ajusta larguras e posição
        updateSlideWidth();
    }

    // 3) Ajusta largura de cada slide (min-width) e posiciona o track
    function updateSlideWidth() {
        const containerWidth =
            track.parentElement.getBoundingClientRect().width;
        const totalReal = slidesOriginal.length;
        slidesToShow = visibleSlides();

        // ──────────────────────────────────────────────
        // 3.1) Detecta “two-only” (2 slides reais e viewport > 977px)
        const canTwoOnly =
            totalReal === 2 && !loopingAtivo && window.innerWidth > 977;

        if (canTwoOnly) {
            track.classList.add("two-only");
        } else {
            track.classList.remove("two-only");
        }
        // ──────────────────────────────────────────────

        // ──────────────────────────────────────────────
        // 3.2) Define slideWidth conforme o modo atual
        if (track.classList.contains("two-only")) {
            // Modo “2 slides estáticos”: cada slide sempre 510px
            slideWidth = 510;
        } else {
            // Modo normal de carrossel: gap = 20px sempre
            const gap = 20;
            const totalGap = (slidesToShow - 1) * gap;
            slideWidth = (containerWidth - totalGap) / slidesToShow;
        }
        // ──────────────────────────────────────────────

        // 3.3) Aplica min-width em cada slide (originais + clones)
        slides.forEach((slide) => {
            slide.style.minWidth = `${slideWidth}px`;
            slide.style.height = "auto";
        });

        // ──────────────────────────────────────────────
        // 3.4) Reposiciona o track SEM transição (para não “piscar” no resize)
        track.style.transition = "none";

        if (track.classList.contains("two-only")) {
            // Não aplica nenhum translate: o CSS (justify-content:center) já coloca os dois slides no centro
            track.style.transform = "none";
        } else {
            // Modo carrossel normal: cada “passo” = slideWidth + gap (20px)
            const gap = 20;
            const offset = (slideWidth + gap) * currentIndex;
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Reativa a transição (após repaint)
        requestAnimationFrame(() => {
            track.style.transition = "";
        });
        // ──────────────────────────────────────────────

        toggleArrows();
    }

    // 4) Exibe ou esconde as setas de acordo com total de slides reais vs slots visíveis
    function toggleArrows() {
        const totalReal = slidesOriginal.length;
        slidesToShow = visibleSlides();

        if (totalReal > slidesToShow) {
            prevButton.style.display = "flex";
            nextButton.style.display = "flex";
        } else {
            prevButton.style.display = "none";
            nextButton.style.display = "none";
        }
    }

    // 5) Move o track para “newIndex” (apenas se looping estiver ativo)
    function moveToSlide(newIndex) {
        if (isTransitioning) return;
        if (!loopingAtivo) return;

        isTransitioning = true;
        track.style.transition = "transform 0.4s ease-in-out";

        // gap = 20px (não se aplica em “two-only”, pois nesse caso o JS nem chegaria aqui)
        const gap = 20;
        const offset = (slideWidth + gap) * newIndex;
        track.style.transform = `translateX(-${offset}px)`;
        currentIndex = newIndex;

        // Ao fim da transição, corrige posição caso esteja em clone
        track.addEventListener(
            "transitionend",
            () => {
                isTransitioning = false;
                const totalReal = slidesOriginal.length;

                // Se passou dos clones finais:
                if (currentIndex >= totalReal + slidesToShow) {
                    track.style.transition = "none";
                    currentIndex = slidesToShow;
                    const resetOffset = (slideWidth + gap) * currentIndex;
                    track.style.transform = `translateX(-${resetOffset}px)`;

                    // Se passou dos clones iniciais:
                } else if (currentIndex < slidesToShow) {
                    track.style.transition = "none";
                    currentIndex = totalReal + slidesToShow - 1;
                    const resetOffset = (slideWidth + gap) * currentIndex;
                    track.style.transform = `translateX(-${resetOffset}px)`;
                }
            },
            { once: true }
        );
    }

    // 6) Eventos de clique nas setas
    nextButton.addEventListener("click", () => {
        if (!loopingAtivo) return;
        moveToSlide(currentIndex + 1);
    });
    prevButton.addEventListener("click", () => {
        if (!loopingAtivo) return;
        moveToSlide(currentIndex - 1);
    });

    // 7) Ao redimensionar a janela, refaz toda a estrutura do carrossel
    window.addEventListener("resize", () => {
        setupSlides();
    });

    // Chamada inicial
    setupSlides();
});
