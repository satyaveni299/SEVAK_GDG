// navbar fetch
    fetch('navbar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
      });
  
//count up animation
function toggleMenu() {
    var menu = document.getElementById('mobile-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}
function countUp(element, start, end, duration) {
    let startTime = null;
    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        element.innerText = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.classList.remove('counting');
        }
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    const achievements = document.querySelectorAll('.home-achievement p:first-of-type');
    achievements.forEach((achievement) => {
        const endValue = parseInt(achievement.innerText.replace(/,/g, ''), 10);
        achievement.innerText = '0';
        achievement.classList.add('counting');
        countUp(achievement, 0, endValue, 2000);
    });
});