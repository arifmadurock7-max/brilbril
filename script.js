// TEM PRELOADER //
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    // Memberikan jeda 2.5 detik agar animasi preloader terlihat gahar
    setTimeout(() => {
        preloader.classList.add('loaded');
    }, 2500);
});

const cursor = document.querySelector('.cursor');
const leftPhoto = document.querySelector('.left-photo');

document.addEventListener('mousemove', (e) => {
    // Kursor Kustom
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    // Efek Parallax pada Foto Kiri
    const x = (window.innerWidth - e.pageX * 2) / 100;
    const y = (window.innerHeight - e.pageY * 2) / 100;

    if (leftPhoto) {
        leftPhoto.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
    }
});
