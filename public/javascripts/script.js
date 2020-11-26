document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("ironhack-project2 JS imported successfully!");
  },
  false
);

const mainNav = document.querySelector('.main-nav');
const wrapper = document.querySelector('.wrapper');
const burgerButton = document.querySelector('.burger');

burgerButton.addEventListener('click', function() {
  if (mainNav.style.display === 'none') {
    mainNav.style.display = 'flex';
    wrapper.style.marginLeft = '300px';
    if (window.innerWidth < 800) {
      wrapper.style.width = 'calc(100% + 300px)';
    }
  } else {
    mainNav.style.display = 'none';
    wrapper.style.marginLeft = '0px';
    wrapper.style.width = 'unset';
  }
})