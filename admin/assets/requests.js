// ============ صفحة الطلبات ============
checkAuth();

let currentReqId = null;
let allRequests = [];

document.addEventListener('DOMContentLoaded', function(){
    loadRequests();
    populateFormFilter();
});

function loadRequests(){
    allRequests = getRequests();
    renderRequests(allRequests);
}

function populateFormFilter(){
    const forms = getForms();
    const select = document.getElementById('formFilter');
    forms.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.slug;
        opt.textContent = f.projectName;
        select.appendChild(opt);
    });
}

function renderRequests(requests){
    const container = document.getElementById('requestsTable');
    
    if(requests.length === 0){
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa fa-inbox"></i>
                <h3>لا توجد طلبات</h3>
                <p>ستظهر عند تسجيلها</p>
            </div>
        `;
        return;
    }
    
    const forms = getForms();
    
    container.innerHTML = requests.map((r, idx) => {
        const status = r.status || 'new';
        const form = forms.find(f => f.slug === r.formSlug);
        const statusText = {new: 'جديد', contacted: 'تم التواصل', completed: 'مكتمل'}[status];
        
        return `
        <div class="rt-row">
            <div class="rt-status ${status}" title="${statusText}"></div>
            <div class="rt-info">
                <div class="rt-name">${escapeHtml(r.name || '-')}</div>
                <div class="rt-meta">
                    <span><i class="fa fa-phone"></i> <span class="ltr-num">${escapeHtml(r.phone || '-')}</span></span>
                    ${r.email && r.email !== '-' ? `<span><i class="fa fa-envelope"></i> ${escapeHtml(r.email)}</span>` : ''}
                    ${r.region ? `<span><i class="fa fa-map-marker-alt"></i> ${escapeHtml(r.region)}</span>` : ''}
                    <span><i class="fa fa-clock"></i> ${formatDate(r.date)}</span>
                </div>
            </div>
            ${form ? `<div class="rt-form">${escapeHtml(form.projectName)}</div>` : ''}
            <div class="rt-actions">
                <button class="rt-btn" onclick="viewRequest(${idx})" title="عرض"><i class="fa fa-eye"></i></button>
                <button class="rt-btn" onclick="window.open('tel:${escapeHtml(r.phone)}')" title="اتصال"><i class="fa fa-phone"></i></button>
                <button class="rt-btn" onclick="window.open('https://wa.me/${cleanPhone(r.phone)}')" title="واتساب"><i class="fab fa-whatsapp"></i></button>
                <button class="rt-btn danger" onclick="deleteRequest(${idx})" title="حذف"><i class="fa fa-trash"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

function filterRequests(){
    const search = document.getElementById('searchInput').value.toLowerCase();
    const formFilter = document.getElementById('formFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allRequests.filter(r => {
        if(search){
            const text = `${r.name || ''} ${r.phone || ''} ${r.email || ''}`.toLowerCase();
            if(!text.includes(search)) return false;
        }
        if(formFilter && r.formSlug !== formFilter) return false;
        if(statusFilter && (r.status || 'new') !== statusFilter) return false;
        return true;
    });
    
    renderRequests(filtered);
}

function viewRequest(idx){
    currentReqId = idx;
    const r = allRequests[idx];
    const forms = getForms();
    const form = forms.find(f => f.slug === r.formSlug);
    
    document.getElementById('reqDetail').innerHTML = `
        <div class="rd-row"><span class="rd-label">الإسم</span><span class="rd-value">${escapeHtml(r.name || '-')}</span></div>
        <div class="rd-row"><span class="rd-label">الجوال</span><span class="rd-value ltr-num">${escapeHtml(r.phone || '-')}</span></div>
        ${r.email && r.email !== '-' ? `<div class="rd-row"><span class="rd-label">الإيميل</span><span class="rd-value">${escapeHtml(r.email)}</span></div>` : ''}
        ${r.region ? `<div class="rd-row"><span class="rd-label">المنطقة</span><span class="rd-value">${escapeHtml(r.region)}</span></div>` : ''}
        ${r.service ? `<div class="rd-row"><span class="rd-label">الخدمة</span><span class="rd-value">${escapeHtml(r.service)}</span></div>` : ''}
        ${form ? `<div class="rd-row"><span class="rd-label">النموذج</span><span class="rd-value">${escapeHtml(form.projectName)}</span></div>` : ''}
        ${r.message && r.message !== '-' ? `<div class="rd-row"><span class="rd-label">الإستفسار</span><span class="rd-value">${escapeHtml(r.message)}</span></div>` : ''}
        <div class="rd-row"><span class="rd-label">التاريخ</span><span class="rd-value">${formatDate(r.date)}</span></div>
    `;
    
    document.getElementById('newStatus').value = r.status || 'new';
    document.getElementById('statusModal').classList.add('open');
}

function closeStatusModal(){
    document.getElementById('statusModal').classList.remove('open');
}

function updateStatus(){
    if(currentReqId === null) return;
    const newStatus = document.getElementById('newStatus').value;
    allRequests[currentReqId].status = newStatus;
    saveRequests(allRequests);
    closeStatusModal();
    renderRequests(allRequests);
    showToast('تم تحديث الحالة');
}

function deleteRequest(idx){
    if(!confirm('هل تريد حذف هذا الطلب؟')) return;
    allRequests.splice(idx, 1);
    saveRequests(allRequests);
    renderRequests(allRequests);
    showToast('تم حذف الطلب');
}

function exportCSV(){
    if(allRequests.length === 0){
        showToast('لا توجد طلبات للتصدير', 'error');
        return;
    }
    
    const forms = getForms();
    const headers = ['التاريخ','الإسم','الجوال','الإيميل','المنطقة','الخدمة','النموذج','الإستفسار','الحالة'];
    
    const rows = allRequests.map(r => {
        const form = forms.find(f => f.slug === r.formSlug);
        const statusText = {new: 'جديد', contacted: 'تم التواصل', completed: 'مكتمل'}[r.status || 'new'];
        return [
            r.date || '',
            r.name || '',
            r.phone || '',
            r.email || '',
            r.region || '',
            r.service || '',
            form ? form.projectName : '',
            (r.message || '').replace(/[\n\r,]/g, ' '),
            statusText
        ];
    });
    
    let csv = '\uFEFF'; // BOM لدعم العربية
    csv += headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${(cell + '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `طلبات-العواد-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    showToast('تم تصدير الملف بنجاح');
}

function cleanPhone(phone){
    if(!phone) return '966555808224';
    let p = phone.replace(/\D/g, '');
    if(p.startsWith('0')) p = '966' + p.substring(1);
    if(!p.startsWith('966')) p = '966' + p;
    return p;
}

function escapeHtml(text){
    if(!text && text !== 0) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
