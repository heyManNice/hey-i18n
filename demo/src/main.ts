import T, { currentLocale, switchLocale } from 'hey-i18n';

const name = 'Codex';
const count = 3;
const total = 42;

document.querySelector('#current-locale')!.textContent = currentLocale;
document.querySelector('#greeting')!.textContent = T`Hello, ${name}!`;
document.querySelector('#message')!.textContent = T`Items: ${count}, total ${total}`;
document.querySelector('#fallback')!.textContent = T`This sentence will stay English.`;

document.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach((button) => {
    button.addEventListener('click', () => {
        switchLocale(button.dataset.locale!);
    });
});
