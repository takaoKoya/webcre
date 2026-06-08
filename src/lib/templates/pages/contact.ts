import type { ProjectConfig } from '@/types';
import { generateSharedNav, generateHeadMeta } from './shared';

export function generateContactPage(
  config: ProjectConfig,
  texts: Record<string, unknown>,
  navigation: { label: string; href: string }[]
): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const t = texts as Record<string, Record<string, unknown>>;

  const headline = (t.cta?.headline as string) ?? 'お問い合わせ';
  const body = (t.cta?.body as string) ?? 'ご質問・ご相談はお気軽にどうぞ。';

  const sharedNav = generateSharedNav(config, navigation, 'contact');
  const headMeta = generateHeadMeta(config, `お問い合わせ | ${config.businessName}`, 'contact');

  // Determine form action: Formspree ID/email or no-op
  const formspreeId = config.formspreeId?.trim() ?? '';
  let formAction = '';
  let formMethod = 'post';
  let formspreeScript = '';
  if (formspreeId) {
    // Support both full Formspree ID (e.g. xpzgjnrk) and email address
    if (formspreeId.includes('@')) {
      formAction = `https://formspree.io/${formspreeId}`;
    } else {
      formAction = `https://formspree.io/f/${formspreeId}`;
    }
  } else {
    // No backend: show validation only, prevent submission
    formMethod = 'post';
    formAction = '#';
    formspreeScript = `
  <script>
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert('送信先が設定されていません。Formspree IDを設定してください。');
    });
  </script>`;
  }

  const successRedirect = formAction !== '#'
    ? `<input type="hidden" name="_next" value="thank-you.html" />\n        <input type="hidden" name="_subject" value="${config.businessName}へのお問い合わせ" />`
    : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>お問い合わせ | ${config.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>
    :root { --primary: ${primary}; }
    .form-wrap { max-width: 640px; margin: 2.5rem auto 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .form-label .required { color: #ef4444; font-size: 0.75rem; margin-left: 0.3rem; }
    .form-label .optional { color: #94a3b8; font-size: 0.75rem; margin-left: 0.3rem; }
    .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; font-family: inherit; outline: none; transition: border 0.2s, box-shadow 0.2s; }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .form-input.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
    .form-textarea { resize: vertical; min-height: 140px; }
    .form-error-msg { display: none; color: #ef4444; font-size: 0.75rem; margin-top: 0.3rem; }
    .form-error-msg.show { display: block; }
    .form-submit { width: 100%; padding: 0.9rem; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.2s, transform 0.1s; }
    .form-submit:hover { opacity: 0.85; }
    .form-submit:active { transform: scale(0.98); }
    .form-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .privacy-note { font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 1rem; }
    .privacy-note a { color: var(--primary); }
    .form-success { display: none; text-align: center; padding: 2rem; }
    .form-success.show { display: block; }
    .form-fields.hidden { display: none; }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero">
    <span class="page-hero-tag">Contact</span>
    <h1>${headline}</h1>
    <p>${body}</p>
  </div>
  <section class="content">
    <div class="form-wrap fade-in">
      <div class="form-success" id="formSuccess">
        <div style="font-size:3rem;margin-bottom:1rem">✅</div>
        <h3 style="font-size:1.2rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem">送信が完了しました</h3>
        <p style="color:#64748b;font-size:0.9rem">お問い合わせありがとうございます。<br>内容を確認の上、折り返しご連絡いたします。</p>
      </div>
      <form id="contactForm" class="form-fields" action="${formAction}" method="${formMethod}" novalidate>
        ${successRedirect}
        <div class="form-group">
          <label class="form-label">お名前<span class="required">*必須</span></label>
          <input type="text" name="name" id="fieldName" class="form-input" placeholder="例：山田 太郎" autocomplete="name" />
          <span class="form-error-msg" id="errName">お名前を入力してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">メールアドレス<span class="required">*必須</span></label>
          <input type="email" name="email" id="fieldEmail" class="form-input" placeholder="例：example@mail.com" autocomplete="email" />
          <span class="form-error-msg" id="errEmail">有効なメールアドレスを入力してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">電話番号<span class="optional">任意</span></label>
          <input type="tel" name="phone" class="form-input" placeholder="例：090-0000-0000" autocomplete="tel" />
        </div>
        <div class="form-group">
          <label class="form-label">件名<span class="optional">任意</span></label>
          <input type="text" name="subject" class="form-input" placeholder="例：サービスについてのご質問" />
        </div>
        <div class="form-group">
          <label class="form-label">お問い合わせ内容<span class="required">*必須</span></label>
          <textarea name="message" id="fieldMessage" class="form-input form-textarea" placeholder="ご質問・ご相談の内容をご記入ください"></textarea>
          <span class="form-error-msg" id="errMessage">お問い合わせ内容を入力してください</span>
        </div>
        <button type="submit" class="form-submit" id="submitBtn">送信する</button>
        <p class="privacy-note">送信いただいた情報は<a href="privacy.html">プライバシーポリシー</a>に基づき管理します。</p>
      </form>
    </div>
  </section>
  <footer>
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>
  <script>
    (function() {
      var form = document.getElementById('contactForm');
      var successBox = document.getElementById('formSuccess');
      if (!form) return;

      function validate() {
        var ok = true;
        var name = document.getElementById('fieldName');
        var email = document.getElementById('fieldEmail');
        var message = document.getElementById('fieldMessage');
        var errName = document.getElementById('errName');
        var errEmail = document.getElementById('errEmail');
        var errMsg = document.getElementById('errMessage');

        if (!name.value.trim()) { name.classList.add('error'); errName.classList.add('show'); ok = false; }
        else { name.classList.remove('error'); errName.classList.remove('show'); }

        var emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRe.test(email.value.trim())) { email.classList.add('error'); errEmail.classList.add('show'); ok = false; }
        else { email.classList.remove('error'); errEmail.classList.remove('show'); }

        if (!message.value.trim()) { message.classList.add('error'); errMsg.classList.add('show'); ok = false; }
        else { message.classList.remove('error'); errMsg.classList.remove('show'); }

        return ok;
      }

      ${formAction !== '#' ? `
      form.addEventListener('submit', function(e) {
        if (!validate()) { e.preventDefault(); return; }
        var btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.textContent = '送信中...';
        // Formspree AJAX submission
        e.preventDefault();
        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function(res) {
          if (res.ok) {
            form.classList.add('hidden');
            successBox.classList.add('show');
          } else {
            btn.disabled = false;
            btn.textContent = '送信する';
            alert('送信に失敗しました。しばらく経ってから再度お試しください。');
          }
        }).catch(function() {
          btn.disabled = false;
          btn.textContent = '送信する';
          alert('通信エラーが発生しました。');
        });
      });` : `
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validate()) return;
        alert('送信先が設定されていません。Formspree IDを設定してください。');
      });`}
    })();
  </script>${formspreeScript}
</body>
</html>`;
}
