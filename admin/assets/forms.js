// ============ صفحة النماذج ============
checkAuth();

let currentEditId = null;
let currentQRUrl = '';

document.addEventListener('DOMContentLoaded', function(){
    renderForms();
    
    // الفورم
    document.getElementById('newFormForm').addEventListener('submit', function(e){
        e.preventDefault();
        saveForm();
    });
});

function renderForms(){
    const forms = getForms();
    const grid = document.getElementById('formsGrid');
    
    if(forms.length === 0){
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <i class="fa fa-link"></i>
                <h3>لا توجد نماذج</h3>
                <p>أنشئ أول نموذج وشاركه</p>
                <button class="btn-add" onclick="openFormModal()" style="margin-top:20px">
                    <i class="fa fa-plus"></i> إنشاء نموذج جديد
                </button>
            </div>
        `;
        return;
    }
    
    const requests = getRequests();
    
    grid.innerHTML = forms.map(f => {
        const formRequests = requests.filter(r => r.formSlug === f.slug);
        const requestsCount = formRequests.length;
        const url = `${window.location.origin}${window.location.pathname.replace(/admin\/.*/, '')}form.html?f=${encodeURIComponent(f.slug)}`;
        
        return `
        <div class="form-card">
            <div class="fc-head">
                <div>
                    <div class="fc-title">${escapeHtml(f.projectName)}</div>
                    ${f.unitNum ? `<div class="fc-unit"><i class="fa fa-home"></i> ${escapeHtml(f.unitNum)}</div>` : ''}
                </div>
                <div class="fc-stats">
                    <div class="fc-stat"><i class="fa fa-eye"></i> ${f.views || 0}</div>
                    <div class="fc-stat"><i class="fa fa-users"></i> ${requestsCount}</div>
                </div>
            </div>
            <div class="fc-body">
                <div class="fc-url">${escapeHtml(url)}</div>
                <div class="fc-meta">
                    ${f.contactPerson ? `<span><i class="fa fa-headset"></i> ${escapeHtml(f.contactPerson)}</span>` : ''}
                    <span><i class="fa fa-calendar"></i> ${formatDate(f.createdAt)}</span>
                </div>
            </div>
            <div class="fc-actions">
                <button class="fc-btn" onclick="copyToClipboard('${url}')"><i class="fa fa-copy"></i> نسخ</button>
                <button class="fc-btn" onclick="showQR('${escapeHtml(url)}')"><i class="fa fa-qrcode"></i> باركود</button>
                <button class="fc-btn" onclick="window.open('${url}','_blank')"><i class="fa fa-external-link-alt"></i> فتح</button>
                <button class="fc-btn" onclick="editForm('${f.id}')"><i class="fa fa-edit"></i> تعديل</button>
                <button class="fc-btn danger" onclick="deleteForm('${f.id}')"><i class="fa fa-trash"></i> حذف</button>
            </div>
        </div>
        `;
    }).join('');
}

function openFormModal(){
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'إنشاء نموذج اهتمام جديد';
    document.getElementById('newFormForm').reset();
    document.getElementById('formId').value = '';
    document.getElementById('formModal').classList.add('open');
}

function closeFormModal(){
    document.getElementById('formModal').classList.remove('open');
}

function saveForm(){
    const id = document.getElementById('formId').value || generateId();
    const slug = document.getElementById('customSlug').value.trim();
    const forms = getForms();
    
    // تأكد من عدم التكرار
    const existing = forms.find(f => f.slug === slug && f.id !== id);
    if(existing){
        showToast('الرابط مستخدم مسبقاً، اختر رابطاً آخر', 'error');
        return;
    }
    
    const formData = {
        id: id,
        slug: slug,
        projectName: document.getElementById('projectName').value.trim(),
        unitNum: document.getElementById('unitNum').value.trim(),
        contactPerson: document.getElementById('contactPerson').value.trim(),
        formTitle: document.getElementById('formTitle').value.trim(),
        notes: document.getElementById('formNotes').value.trim(),
        views: 0,
        createdAt: new Date().toISOString()
    };
    
    if(currentEditId){
        const idx = forms.findIndex(f => f.id === currentEditId);
        if(idx > -1){
            formData.views = forms[idx].views || 0;
            formData.createdAt = forms[idx].createdAt;
            forms[idx] = formData;
        }
    } else {
        forms.push(formData);
    }
    
    saveForms(forms);
    closeFormModal();
    renderForms();
    showToast(currentEditId ? 'تم تحديث النموذج' : 'تم إنشاء النموذج بنجاح');
}

function editForm(id){
    const forms = getForms();
    const form = forms.find(f => f.id === id);
    if(!form) return;
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'تعديل النموذج';
    document.getElementById('formId').value = id;
    document.getElementById('projectName').value = form.projectName || '';
    document.getElementById('customSlug').value = form.slug || '';
    document.getElementById('unitNum').value = form.unitNum || '';
    document.getElementById('contactPerson').value = form.contactPerson || '';
    document.getElementById('formTitle').value = form.formTitle || '';
    document.getElementById('formNotes').value = form.notes || '';
    document.getElementById('formModal').classList.add('open');
}

function deleteForm(id){
    if(!confirm('هل أنت متأكد من حذف هذا النموذج؟ سيتم حذف كل الطلبات المرتبطة به.')){
        return;
    }
    let forms = getForms();
    const form = forms.find(f => f.id === id);
    forms = forms.filter(f => f.id !== id);
    saveForms(forms);
    
    // احذف الطلبات المرتبطة
    if(form){
        let requests = getRequests();
        requests = requests.filter(r => r.formSlug !== form.slug);
        saveRequests(requests);
    }
    
    renderForms();
    showToast('تم حذف النموذج');
}

function showQR(url){
    currentQRUrl = url;
    document.getElementById('qrUrl').textContent = url;
    document.getElementById('qrCode').innerHTML = '';
    new QRCode(document.getElementById('qrCode'), {
        text: url,
        width: 220,
        height: 220,
        colorDark: '#0a2647',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    document.getElementById('qrModal').classList.add('open');
}

function closeQRModal(){
    document.getElementById('qrModal').classList.remove('open');
}

function downloadQR(){
    const canvas = document.querySelector('#qrCode canvas');
    if(!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'alawad-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('تم تحميل الباركود');
}

function escapeHtml(text){
    if(!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
