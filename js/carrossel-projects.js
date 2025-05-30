document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const slidesOriginal = Array.from(track.children);
    const prevButton = document.querySelector(".carousel-button.prev");
    const nextButton = document.querySelector(".carousel-button.next");

    let slides = []; // slides atuais, incluindo clones
    let slideWidth = 0;
    let currentIndex = 0;
    let slidesToShow = 1;
    let isTransitioning = false;

    // Função para decidir quantos slides mostrar conforme tela
    function visibleSlides() {
        const width = window.innerWidth;
        if (width <= 720) return 1;
        if (width <= 977) return 2;
        return 3; // acima de 978
    }

    // Cria clones para loop infinito e configura slides no track
    function setupSlides() {
        // Remove todos os slides do container
        while (track.firstChild) {
            track.removeChild(track.firstChild);
        }

        slidesToShow = visibleSlides();

        // Clona slides para loop infinito (clones no início e no fim)
        const clonesBefore = slidesOriginal
            .slice(-slidesToShow)
            .map((slide) => slide.cloneNode(true));
        const clonesAfter = slidesOriginal
            .slice(0, slidesToShow)
            .map((slide) => slide.cloneNode(true));

        slides = [...clonesBefore, ...slidesOriginal, ...clonesAfter];

        slides.forEach((slide) => track.appendChild(slide));

        // Reset index para o primeiro slide "real"
        currentIndex = slidesToShow;

        updateSlideWidth();
    }

    // Atualiza a largura dos slides proporcionalmente e posiciona o track
    function updateSlideWidth() {
        const containerWidth =
            track.parentElement.getBoundingClientRect().width;
        slidesToShow = visibleSlides();
        slideWidth = containerWidth / slidesToShow;

        slides.forEach((slide) => {
            slide.style.minWidth = `${slideWidth}px`;
            slide.style.height = "auto";
        });

        // Posiciona o track para o slide "real" atual
        track.style.transition = "none"; // remove transição para reposicionar sem animação
        track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
        requestAnimationFrame(() => {
            track.style.transition = ""; // volta a transição normal
        });

        toggleArrows();
    }

    // Esconde as setas se o número de slides for menor ou igual ao visível
    function toggleArrows() {
        const totalRealSlides = slidesOriginal.length;
        const containerWidth = window.innerWidth;
        let slidesVisible = visibleSlides();

        if (totalRealSlides <= slidesVisible) {
            prevButton.style.display = "none";
            nextButton.style.display = "none";
        } else {
            // Além disso, só mostra as setas acima de 978px se houver mais de 3 slides
            if (containerWidth >= 978 && totalRealSlides <= 3) {
                prevButton.style.display = "none";
                nextButton.style.display = "none";
            } else {
                prevButton.style.display = "block";
                nextButton.style.display = "block";
            }
        }
    }

    // Move para o slide, com controle de loop infinito
    function moveToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        track.style.transition = "transform 0.4s ease-in-out";
        track.style.transform = `translateX(-${slideWidth * index}px)`;
        currentIndex = index;

        // Após a transição, verifica se está num clone e reseta sem animação
        track.addEventListener(
            "transitionend",
            () => {
                isTransitioning = false;
                if (currentIndex >= slidesOriginal.length + slidesToShow) {
                    // Se passou dos clones finais, volta para real primeiro slide
                    track.style.transition = "none";
                    currentIndex = slidesToShow;
                    track.style.transform = `translateX(-${
                        slideWidth * currentIndex
                    }px)`;
                } else if (currentIndex < slidesToShow) {
                    // Se passou dos clones iniciais, volta para real último slide
                    track.style.transition = "none";
                    currentIndex = slidesOriginal.length + slidesToShow - 1;
                    track.style.transform = `translateX(-${
                        slideWidth * currentIndex
                    }px)`;
                }
            },
            { once: true }
        );
    }

    nextButton.addEventListener("click", () => {
        moveToSlide(currentIndex + 1);
    });

    prevButton.addEventListener("click", () => {
        moveToSlide(currentIndex - 1);
    });

    window.addEventListener("resize", () => {
        setupSlides();
    });

    // Inicialização
    setupSlides();
});
