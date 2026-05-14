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
        // الرابط النظيف: domain.com/slug (بدون form.html?f=)
        const basePath = window.location.pathname.replace(/admin\/.*/, '');
        const url = `${window.location.origin}${basePath}${f.slug}`;
        
        return `
        <div class="form-card">
            <div class="fc-head">
                <div>
                    <div class="fc-title">${escapeHtml(f.slug)}</div>
                    <div class="fc-unit"><i class="fa fa-link"></i> رابط مخصص</div>
                </div>
                <div class="fc-stats">
                    <div class="fc-stat"><i class="fa fa-eye"></i> ${f.views || 0}</div>
                    <div class="fc-stat"><i class="fa fa-users"></i> ${requestsCount}</div>
                </div>
            </div>
            <div class="fc-body">
                <div class="fc-url">${escapeHtml(url)}</div>
                <div class="fc-meta">
                    ${f.sheetUrl ? (
                        f.sheetUrl.startsWith('https://script.google.com') 
                        ? `<span style="color:var(--green)"><i class="fa fa-check-circle"></i> مربوط بشيت</span>`
                        : `<span style="color:var(--orange)"><i class="fa fa-exclamation-triangle"></i> يحتاج إعداد Apps Script</span>`
                    ) : `<span style="color:var(--txt-faint)"><i class="fa fa-info-circle"></i> غير مربوط بشيت</span>`}
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

// ============ دوال شرح Sheet ============
function showSheetGuide(e){
    if(e) e.preventDefault();
    document.getElementById('sheetGuideModal').classList.add('open');
}

function closeSheetGuide(){
    document.getElementById('sheetGuideModal').classList.remove('open');
}

function copyScriptCode(btn){
    const code = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-check"></i> تم النسخ';
        btn.style.background = 'var(--green)';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}

function openFormModal(){
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'إنشاء نموذج اهتمام جديد';
    document.getElementById('newFormForm').reset();
    document.getElementById('formId').value = '';
    customFields = getDefaultFields();
    renderCustomFields();
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
    
    // معالجة رابط الشيت - استخراج ID من رابط Google Sheets
    let sheetUrl = document.getElementById('sheetUrl').value.trim();
    if(sheetUrl){
        // لو رابط Google Sheets عادي، استخرج الـ ID وحوله لرابط Apps Script
        const sheetMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if(sheetMatch){
            // المستخدم لصق رابط الشيت - نحفظه كما هو ونعالجه عند الإرسال
            sheetUrl = 'SHEET_ID:' + sheetMatch[1];
        }
        // لو رابط Apps Script، نحفظه مباشرة
    }
    
    const formData = {
        id: id,
        slug: slug,
        projectName: slug,
        unitNum: '',
        contactPerson: document.getElementById('contactPerson').value.trim(),
        formTitle: '',
        notes: document.getElementById('formNotes').value.trim(),
        sheetUrl: sheetUrl,
        fields: customFields.filter(f => f.label && f.label.trim()),
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
    document.getElementById('customSlug').value = form.slug || '';
    document.getElementById('contactPerson').value = form.contactPerson || '';
    document.getElementById('formNotes').value = form.notes || '';
    
    // تحميل الحقول المخصصة
    customFields = (form.fields && form.fields.length) ? JSON.parse(JSON.stringify(form.fields)) : getDefaultFields();
    renderCustomFields();
    
    // عرض رابط الشيت بشكل أصلي
    let displayUrl = form.sheetUrl || '';
    if(displayUrl.startsWith('SHEET_ID:')){
        const sheetId = displayUrl.replace('SHEET_ID:', '');
        displayUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
    }
    document.getElementById('sheetUrl').value = displayUrl;
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

// ============ بنّاء الحقول الديناميكية ============
let customFields = [];

function getDefaultFields(){
    return [
        {id: 'f_' + Date.now(), label: 'الإسم', type: 'text', required: true, options: []},
        {id: 'f_' + (Date.now()+1), label: 'رقم الجوال', type: 'number', required: true, options: []},
        {id: 'f_' + (Date.now()+2), label: 'نوع الخدمة', type: 'select', required: true, options: ['صيانة تكييف','تركيب تكييف','طلب شراء تكييف']}
    ];
}

function renderCustomFields(){
    const container = document.getElementById('customFieldsList');
    if(!container) return;
    
    if(customFields.length === 0){
        container.innerHTML = '<div class="empty-fields"><i class="fa fa-list-ul"></i><p>لم تضف أي حقل بعد</p></div>';
        return;
    }
    
    container.innerHTML = customFields.map((field, idx) => {
        const optionsHtml = field.type === 'select' ? `
            <div class="field-options">
                <label class="opt-title">الخيارات:</label>
                <div class="opt-list" id="opts_${field.id}">
                    ${(field.options || []).map((opt, optIdx) => `
                        <div class="opt-row">
                            <input type="text" value="${escapeHtml(opt)}" onchange="updateOption('${field.id}', ${optIdx}, this.value)" placeholder="خيار...">
                            <button type="button" class="opt-del" onclick="removeOption('${field.id}', ${optIdx})"><i class="fa fa-times"></i></button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="opt-add" onclick="addOption('${field.id}')">
                    <i class="fa fa-plus"></i> إضافة خيار
                </button>
            </div>
        ` : '';
        
        return `
        <div class="field-card" data-id="${field.id}">
            <div class="field-head">
                <div class="field-num">${idx + 1}</div>
                <div class="field-main">
                    <input type="text" class="field-label-input" value="${escapeHtml(field.label)}" 
                           onchange="updateField('${field.id}', 'label', this.value)" 
                           placeholder="اسم الحقل (مثل: الاسم)">
                    <div class="field-controls">
                        <select onchange="updateField('${field.id}', 'type', this.value)" class="field-type-select">
                            <option value="text" ${field.type === 'text' ? 'selected' : ''}>نص</option>
                            <option value="number" ${field.type === 'number' ? 'selected' : ''}>رقم</option>
                            <option value="select" ${field.type === 'select' ? 'selected' : ''}>اختيار من قائمة</option>
                            <option value="tel" ${field.type === 'tel' ? 'selected' : ''}>هاتف</option>
                            <option value="email" ${field.type === 'email' ? 'selected' : ''}>بريد إلكتروني</option>
                            <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>نص طويل</option>
                        </select>
                        <label class="req-toggle">
                            <input type="checkbox" ${field.required ? 'checked' : ''} 
                                   onchange="updateField('${field.id}', 'required', this.checked)">
                            <span>إلزامي</span>
                        </label>
                    </div>
                </div>
                <div class="field-actions">
                    <button type="button" class="fa-btn" onclick="moveField('${field.id}', -1)" title="أعلى"><i class="fa fa-arrow-up"></i></button>
                    <button type="button" class="fa-btn" onclick="moveField('${field.id}', 1)" title="أسفل"><i class="fa fa-arrow-down"></i></button>
                    <button type="button" class="fa-btn danger" onclick="removeField('${field.id}')" title="حذف"><i class="fa fa-trash"></i></button>
                </div>
            </div>
            ${optionsHtml}
        </div>
        `;
    }).join('');
}

function addCustomField(){
    customFields.push({
        id: 'f_' + Date.now() + Math.random().toString(36).substr(2, 5),
        label: 'حقل جديد',
        type: 'text',
        required: false,
        options: []
    });
    renderCustomFields();
}

function removeField(fieldId){
    if(!confirm('حذف هذا الحقل؟')) return;
    customFields = customFields.filter(f => f.id !== fieldId);
    renderCustomFields();
}

function updateField(fieldId, key, value){
    const field = customFields.find(f => f.id === fieldId);
    if(!field) return;
    
    if(key === 'type' && value === 'select' && (!field.options || field.options.length === 0)){
        field.options = [''];
    }
    
    field[key] = value;
    
    if(key === 'type'){
        renderCustomFields();
    }
}

function moveField(fieldId, direction){
    const idx = customFields.findIndex(f => f.id === fieldId);
    if(idx < 0) return;
    const newIdx = idx + direction;
    if(newIdx < 0 || newIdx >= customFields.length) return;
    
    [customFields[idx], customFields[newIdx]] = [customFields[newIdx], customFields[idx]];
    renderCustomFields();
}

function addOption(fieldId){
    const field = customFields.find(f => f.id === fieldId);
    if(!field) return;
    if(!field.options) field.options = [];
    field.options.push('');
    renderCustomFields();
    
    // focus على آخر input
    setTimeout(() => {
        const inputs = document.querySelectorAll(`#opts_${fieldId} input`);
        if(inputs.length){
            inputs[inputs.length - 1].focus();
        }
    }, 50);
}

function removeOption(fieldId, optIdx){
    const field = customFields.find(f => f.id === fieldId);
    if(!field) return;
    field.options.splice(optIdx, 1);
    renderCustomFields();
}

function updateOption(fieldId, optIdx, value){
    const field = customFields.find(f => f.id === fieldId);
    if(!field) return;
    field.options[optIdx] = value;
}

function escapeHtml(text){
    if(!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
