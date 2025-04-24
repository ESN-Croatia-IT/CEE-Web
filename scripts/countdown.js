function updateCountdown() {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), 3, 1); // April 1st - Napomena: tada nije CEE, datum je stavljen samo kao običan primjer

    if (now > targetDate) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
    }

    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);
