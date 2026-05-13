// ============ الإعدادات ============
// نفس رابط Google Apps Script المستخدم في النموذج
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwyfoyIydRp6-ZKrhBABmJqmIg_LaFfffBhwvVt9dttP35YzOfRFqJMLNY5_bRKqRRM/exec';

// ============ الحماية ============
function checkAuth(){
    const isAuth = localStorage.getItem('alawad_admin') === 'true';
    const loginTime = parseInt(localStorage.getItem('alawad_admin_time') || '0');
    const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 ساعات
    
    if(!isAuth || (Date.now() - loginTime > SESSION_TIMEOUT)){
        localStorage.removeItem('alawad_admin');
        localStorage.removeItem('alawad_admin_time');
        window.location.href = 'index.html';
    }
}

function logout(){
    if(confirm('هل تريد تسجيل الخروج؟')){
        localStorage.removeItem('alawad_admin');
        localStorage.removeItem('alawad_admin_time');
        window.location.href = 'index.html';
    }
}

function toggleSidebar(){
    document.getElementById('sidebar').classList.toggle('open');
}

// ============ Storage (Local + Sheets) ============
function getForms(){
    return JSON.parse(localStorage.getItem('alawad_forms') || '[]');
}

function saveForms(forms){
    localStorage.setItem('alawad_forms', JSON.stringify(forms));
}

function getRequests(){
    return JSON.parse(localStorage.getItem('alawad_requests') || '[]');
}

function saveRequests(reqs){
    localStorage.setItem('alawad_requests', JSON.stringify(reqs));
}

// تحميل الإحصائيات
async function loadStats(){
    const forms = getForms();
    const requests = getRequests();
    
    const totalViews = forms.reduce((sum, f) => sum + (f.views || 0), 0);
    const newReqs = requests.filter(r => r.status === 'new' || !r.status).length;
    
    return {
        forms: forms.length,
        requests: requests.length,
        views: totalViews,
        newReqs: newReqs,
        recent: requests.slice().reverse()
    };
}

// ============ Toast Notification ============
function showToast(message, type = 'success'){
    let toast = document.getElementById('toast');
    if(!toast){
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.className = type;
    toast.innerHTML = `<i class="fa ${icon}"></i> ${message}`;
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============ Helpers ============
function formatDate(dateStr){
    if(!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('ar-SA', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch(e) {
        return dateStr;
    }
}

function generateId(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function copyToClipboard(text){
    if(navigator.clipboard){
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم نسخ الرابط بنجاح', 'success');
        });
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('تم نسخ الرابط', 'success');
    }
}
