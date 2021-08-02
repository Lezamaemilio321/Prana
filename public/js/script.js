infoButtons = document.querySelectorAll('.info-button');
section = document.querySelector('.items-section');

for (let button of infoButtons) {
    const card = document.querySelector('[data-item-id~="' + button.id + '"]');
    const infoModal = card.querySelector('.info-modal');
    const closeButton = infoModal.querySelector('.close-button');
    const infoBackground = card.querySelector('.info-background');

    button.addEventListener('click', (event) => {
            const scrollY = document.documentElement.style.getPropertyValue('--scroll-y');

            infoModal.classList.add('active');

            section.style.position = 'fixed';
            section.style.top = '-' + scrollY;
    });

    function closeModal (event) {
            const scrollY = section.style.top;
            section.style.position = '';
            section.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);

            infoModal.classList.remove('active');
    }

    closeButton.addEventListener('click', closeModal);
    infoBackground.addEventListener('click', closeModal);
}
