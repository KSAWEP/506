// شاشة التحميل - تختفي بسرعة
window.addEventListener('load', function(){
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden');
    }, 400);
});
setTimeout(() => {
    const loader = document.getElementById('loader');
    if(loader) loader.classList.add('hidden');
}, 2500);

document.addEventListener('DOMContentLoaded', function(){
    const curtain = document.createElement('div');
    curtain.id = 'curtain';
    document.body.appendChild(curtain);

    document.body.classList.add('page-enter');

    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e){
            const href = this.getAttribute('href');
            if (href && !this.target) {
                e.preventDefault();
                curtain.classList.add('up');
                setTimeout(() => window.location.href = href, 500);
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

    // ====== تابز خدمات ما بعد البيع ======
    document.querySelectorAll('.as-tab').forEach(tab => {
        tab.addEventListener('click', function(){
            const target = this.getAttribute('data-tab');
            // إزالة active من كل التابز والبانلز
            document.querySelectorAll('.as-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.as-panel').forEach(p => p.classList.remove('active'));
            // تفعيل المختار
            this.classList.add('active');
            document.getElementById('as-' + target).classList.add('active');
        });
    });
});
