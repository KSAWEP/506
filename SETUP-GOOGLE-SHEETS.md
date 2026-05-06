# 📋 ربط نموذج التواصل بـ Google Sheets

## الخطوات (مرة واحدة فقط - تأخذ 5 دقائق)

---

### الخطوة 1: افتح الشيت
الرابط: https://docs.google.com/spreadsheets/d/1qppu963gDadgiWbajulyvxYUxoN6TUUpNBxeNvHqPaI/edit

### الخطوة 2: أضف رؤوس الأعمدة (الصف الأول)
في الصف الأول، اكتب الأعمدة التالية:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| التاريخ | الإسم | الجوال | الإيميل | المنطقة | الخدمة | الإستفسار |

### الخطوة 3: افتح Apps Script
- من القائمة الأعلى: **Extensions** ← **Apps Script**
- (أو بالعربي: الإضافات ← Apps Script)

### الخطوة 4: انسخ الكود التالي والصقه

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.date,
      data.name,
      data.phone,
      data.email,
      data.region,
      data.service,
      data.message
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### الخطوة 5: انشر الـ Script
1. اضغط زر **Deploy** (في الزاوية العلوية اليمنى)
2. اختر **New deployment**
3. اضغط على أيقونة الترس ⚙️ بجانب "Select type"
4. اختر **Web app**
5. الإعدادات:
   - **Description:** `Form Handler` (أو أي اسم)
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` (مهم!)
6. اضغط **Deploy**
7. ستظهر رسالة لمنح الصلاحيات → اضغط **Authorize access**
8. اختر حسابك → **Advanced** → **Go to (project name)** → **Allow**

### الخطوة 6: انسخ رابط Web App
بعد الـ Deploy، يظهر لك رابط بهذا الشكل:
```
https://script.google.com/macros/s/AKfycbz.../exec
```
**انسخ هذا الرابط بالكامل**

### الخطوة 7: ضع الرابط في الموقع
افتح الملف: `assets/script.js`

ابحث عن السطر:
```javascript
const SHEETS_URL = 'PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE';
```

غيّره إلى رابطك:
```javascript
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
```

### الخطوة 8: ارفع الموقع لـ GitHub Pages
- ادفع التحديثات لـ GitHub
- جرّب النموذج من الموقع
- ستجد الطلبات تظهر تلقائياً في الشيت!

---

## ✅ الآن النموذج يحفظ تلقائياً:
- التاريخ والوقت
- الإسم
- رقم الجوال
- الإيميل
- المنطقة
- نوع الخدمة
- الإستفسار

## 🔄 لتحديث الـ Script لاحقاً:
1. ارجع لـ Apps Script
2. عدّل الكود
3. **Deploy** ← **Manage deployments** ← اضغط ✏️ على النشر
4. اختر **New version** ← **Deploy**

## ⚠️ ملاحظة مهمة:
بدون إعداد الرابط، النموذج يشتغل بـ **وضع التجربة** - يعرض رسالة نجاح للمستخدم لكن **لا يحفظ في الشيت**. لازم تكمل الخطوات أعلاه عشان البيانات تنحفظ فعلياً.

## 📞 لو واجهت مشكلة:
- تأكد من إن رؤوس الأعمدة موجودة في الصف الأول
- تأكد من إن الـ Deploy وضعه `Anyone`
- بعد أي تعديل في الـ Script، لازم تعمل **New version** في الـ Deploy
