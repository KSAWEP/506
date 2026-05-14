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
            document.querySelectorAll('.as-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.as-detail').forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            const detail = document.getElementById('as-' + target);
            if(detail) detail.classList.add('active');
        });
    });

    // ====== إرسال نموذج التواصل إلى Google Sheets ======
    const DEFAULT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwyfoyIydRp6-ZKrhBABmJqmIg_LaFfffBhwvVt9dttP35YzOfRFqJMLNY5_bRKqRRM/exec';
    
    const contactForm = document.getElementById('contactForm');
    if(contactForm){
        contactForm.addEventListener('submit', async function(e){
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const msgDiv = document.getElementById('formMsg');
            const formData = new FormData(this);
            
            // التحقق من النموذج المرتبط (لو الزائر جاي من رابط نموذج)
            const urlParams = new URLSearchParams(window.location.search);
            const formSlug = urlParams.get('f') || '';
            
            // تحديد الشيت المستهدف
            let targetSheetUrl = DEFAULT_SHEETS_URL;
            let formProject = '';
            
            if(formSlug){
                try {
                    const forms = JSON.parse(localStorage.getItem('alawad_forms') || '[]');
                    const matchedForm = forms.find(f => f.slug === formSlug);
                    if(matchedForm){
                        if(matchedForm.sheetUrl){
                            targetSheetUrl = matchedForm.sheetUrl;
                        }
                        formProject = matchedForm.projectName || '';
                    }
                } catch(e){}
            }
            
            const data = {
                date: new Date().toLocaleString('ar-SA'),
                name: formData.get('name'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                formSlug: formSlug,
                formProject: formProject,
                status: 'new'
            };
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> جاري الإرسال...';
            msgDiv.className = 'form-msg';
            msgDiv.textContent = '';
            
            // حفظ في localStorage للوحة التحكم
            try {
                const requests = JSON.parse(localStorage.getItem('alawad_requests') || '[]');
                requests.push(data);
                localStorage.setItem('alawad_requests', JSON.stringify(requests));
            } catch(e){}
            
            try {
                await fetch(targetSheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                msgDiv.className = 'form-msg success';
                msgDiv.innerHTML = '<i class="fa fa-check-circle"></i> تم استلام طلبك بنجاح! سنتواصل معك خلال 24 ساعة';
                contactForm.reset();
            } catch(err) {
                msgDiv.className = 'form-msg error';
                msgDiv.innerHTML = '<i class="fa fa-exclamation-circle"></i> حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa fa-paper-plane"></i> ارسال الطلب';
                
                setTimeout(() => {
                    msgDiv.className = 'form-msg';
                    msgDiv.textContent = '';
                }, 6000);
            }
        });
    }
});
