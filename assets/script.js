// شاشة التحميل
window.addEventListener('load', function(){
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
    }, 1200);
});
setTimeout(() => {
    const loader = document.getElementById('loader');
    if(loader) loader.classList.add('hidden');
}, 3500);

document.addEventListener('DOMContentLoaded', function(){
    const curtain = document.createElement('div');
    curtain.id = 'curtain';
    const curtainImg = document.createElement('img');
    curtainImg.src = 'assets/transition.gif';
    curtainImg.alt = '';
    curtain.appendChild(curtainImg);
    document.body.appendChild(curtain);

    document.body.classList.add('page-enter');

    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e){
            const href = this.getAttribute('href');
            if (href && !this.target) {
                e.preventDefault();
                curtain.classList.add('up');
                setTimeout(() => window.location.href = href, 1500);
            }
        });
    });

    window.openMob = () => document.getElementById('mob').classList.add('open');
    window.closeMob = () => document.getElementById('mob').classList.remove('open');

    const hdr = document.querySelector('.hdr');
    if(hdr){
        window.addEventListener('scroll', () => {
            if(window.scrollY > 30) hdr.classList.add('sc');
            else hdr.classList.remove('sc');
        });
    }

    // ====== كروت خدمات ما بعد البيع ======
    document.querySelectorAll('.as-card').forEach(card => {
        card.addEventListener('click', function(){
            const target = this.getAttribute('data-card');
            // إزالة active من كل الكروت والتفاصيل
            document.querySelectorAll('.as-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.as-detail').forEach(d => d.classList.remove('active'));
            // تفعيل المختار
            this.classList.add('active');
            const detail = document.getElementById('as-' + target);
            if(detail) detail.classList.add('active');
        });
    });
});
