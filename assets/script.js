// انتقال بين الصفحات بأنيميشن
document.addEventListener('DOMContentLoaded', function(){
    // إنشاء الستار
    const curtain = document.createElement('div');
    curtain.id = 'curtain';
    document.body.appendChild(curtain);

    // أنيميشن دخول
    document.body.classList.add('page-enter');

    // كل الروابط الداخلية
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e){
            const href = this.getAttribute('href');
            if (href && !this.target) {
                e.preventDefault();
                curtain.classList.add('up');
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

    // قائمة الموبايل
    window.openMob = () => document.getElementById('mob').classList.add('open');
    window.closeMob = () => document.getElementById('mob').classList.remove('open');
});

// عداد الأرقام
function animCount(el, target, duration){
    let s = 0;
    const inc = target / (duration / 16);
    (function update(){
        s += inc;
        if (s >= target) {
            el.textContent = target.toLocaleString();
            return;
        }
        el.textContent = Math.ceil(s).toLocaleString();
        requestAnimationFrame(update);
    })();
}
