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
const radioEnvironment = document.getElementById('environment');
const radioWomen = document.getElementById('women');
const divQuotes = document.getElementById('quotes');

function showQuotes() {
  if (radioEnvironment.checked) {
    divQuotes.innerHTML = '"The climate crisis has already been solved. We already have the facts and the solutions. All we have to do is to wake up and change." <br><br> - Greta Thunberg';
  } else if (radioWomen.checked) {
    divQuotes.innerHTML = '"Each time a woman stands up for herself, without knowing it possibly, without claiming it, she stands up for all women." <br><br> - Maya Angelou'; 
  }
}

showQuotes();

radioWomen.addEventListener('click', function() {
  showQuotes();
})

radioEnvironment.addEventListener('click', function() {
  showQuotes();
})

burgerButton.addEventListener('click', function() {
  if (mainNav.style.display === 'none') {
    mainNav.style.display = 'flex';
    wrapper.style.marginLeft = '290px';
    if (window.innerWidth < 800) {
      wrapper.style.width = 'calc(100% + 290px)';
    }
  } else {
    mainNav.style.display = 'none';
    wrapper.style.marginLeft = '0px';
    wrapper.style.width = 'unset';
  }
})