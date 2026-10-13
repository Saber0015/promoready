(() => {
  'use strict';
  const cfg = window.SITE_CONFIG;
  const looks = {outdoor:'Cinematic',tech:'Product spotlight',ugc:'Social demo',lifestyle:'Everyday lifestyle',story:'Brand story',performance:'Performance details'};
  document.querySelectorAll('[data-price]').forEach(node => {
    const plan = cfg.plans[node.dataset.price];
    if (plan) node.textContent = `$${plan.price}`;
  });
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="brief-dialog" id="brief-dialog" aria-labelledby="brief-title" aria-describedby="brief-intro">
      <div class="brief-header">
        <h2 id="brief-title">Let’s start your video.</h2>
        <button class="brief-close" type="button" aria-label="Close brief"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      </div>
      <div class="brief-body">
        <p class="brief-intro" id="brief-intro">Our team will get back to you as soon as possible and help you every step of the way.</p>
        <form id="brief-form">
          <label class="brief-honey" aria-hidden="true">Leave this field empty<input name="_honey" id="brief-honey" type="text" tabindex="-1" autocomplete="off"></label>
          <div class="brief-context" id="brief-context" hidden><p id="brief-selection"></p><button type="button" class="brief-text-button" id="brief-clear">Clear selection</button></div>
          <label class="brief-field" for="brief-email">Your email<input id="brief-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@yourbusiness.com" maxlength="254" required autofocus></label>
          <label class="brief-field" for="brief-idea">What would you like to promote?<textarea id="brief-idea" name="idea" rows="4" maxlength="4000" placeholder="A few words about your product or idea. You can paste a shop, photo or video link here too." required></textarea></label>
          <button class="brief-button" id="brief-submit" type="submit"><span id="brief-submit-label">Send my inquiry</span><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></button>
          <p class="brief-feedback" id="brief-feedback" role="status" aria-live="polite" hidden></p>
          <p class="brief-direct">Or email <a class="brief-contact" id="brief-fallback">our team</a> directly.</p>
        </form>
        <section class="brief-result" id="brief-result" aria-labelledby="brief-result-title" hidden>
          <h3 id="brief-result-title" tabindex="-1">Thank you. Your inquiry is on its way.</h3>
          <p>Our team will reply to your email as soon as possible. You can also reach us at <a class="brief-contact" id="brief-send">our team</a>.</p>
          <p class="brief-reference" id="brief-reference"></p>
          <pre id="brief-summary" tabindex="0" aria-label="Prepared video brief"></pre>
          <div class="brief-actions"><button class="brief-button" id="brief-copy" type="button">Copy brief</button><button class="brief-button brief-secondary" id="brief-save" type="button">Save brief</button></div>
          <p class="brief-status" id="brief-status" role="status" aria-live="polite"></p>
          <button class="brief-text-button" id="brief-edit" type="button">Start another inquiry</button>
        </section>
      </div>
    </dialog>`);
  const $ = id => document.getElementById(id);
  const dialog = $('brief-dialog'), form = $('brief-form'), email = $('brief-email'), idea = $('brief-idea');
  const context = $('brief-context'), selection = $('brief-selection'), result = $('brief-result');
  const resultTitle = $('brief-result-title'), summary = $('brief-summary'), status = $('brief-status');
  const sendLink = $('brief-send');
  const fallbackLink = $('brief-fallback'), feedback = $('brief-feedback'), submit = $('brief-submit');
  const submitLabel = $('brief-submit-label'), honey = $('brief-honey');
  sendLink.textContent = cfg.email;
  sendLink.href = `mailto:${cfg.email}`;
  fallbackLink.textContent = cfg.email;
  fallbackLink.href = `mailto:${cfg.email}`;
  let chosenPlan = '', chosenLook = '', opener = null, briefText = '';
  let submitting = false, lastSentSignature = '', lastReference = '';

  function prepareBrief() {
    const text = [`${cfg.brand} — Video brief`, `Reply email: ${email.value.trim()}`, selectionText() || 'Package and look: Help me choose.', `Idea / links:\n${idea.value.trim()}`].join('\n\n');
    const href = `mailto:${cfg.email}?subject=${encodeURIComponent('My promoready video brief')}&body=${encodeURIComponent(text)}`;
    sendLink.href = href;
    fallbackLink.href = href;
    return text;
  }
  function showResult(reference) {
    summary.textContent = briefText;
    $('brief-reference').textContent = `Reference: ${reference}`;
    form.hidden = true;
    result.hidden = false;
    status.textContent = '';
    if (dialog.open) { resultTitle.focus({preventScroll:true}); dialog.scrollTop = 0; }
  }

  function selectionText() {
    const plan = cfg.plans[chosenPlan];
    return [plan ? `${plan.name} · $${plan.price} USD / package\n${plan.count} ${plan.count === 1 ? 'video' : 'videos'} · ${plan.duration}` : '', chosenLook ? `Look: ${looks[chosenLook]}` : ''].filter(Boolean).join('\n');
  }
  function updateSelection() {
    selection.textContent = selectionText();
    context.hidden = !selection.textContent;
  }
  function showForm() {
    result.hidden = true;
    form.hidden = false;
    status.textContent = '';
    feedback.hidden = true;
    updateSelection();
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-brief]');
    if (!trigger) return;
    if (submitting) { opener = trigger; dialog.showModal(); document.body.classList.add('brief-open'); return; }
    if (cfg.plans[trigger.dataset.package]) chosenPlan = trigger.dataset.package;
    if (looks[trigger.dataset.style]) chosenLook = trigger.dataset.style;
    opener = trigger;
    showForm();
    prepareBrief();
    dialog.showModal();
    document.body.classList.add('brief-open');
    email.focus({preventScroll:true});
  });
  dialog.querySelector('.brief-close').addEventListener('click', () => dialog.close());
  // Close only if the press starts and ends on the backdrop.
  let backdropPress = false;
  function isBackdrop(event) {
    const box = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  }
  dialog.addEventListener('pointerdown', event => { backdropPress = isBackdrop(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && isBackdrop(event)) dialog.close();
    backdropPress = false;
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('brief-open');
    opener?.focus({preventScroll:true});
  });
  $('brief-clear').addEventListener('click', () => {
    chosenPlan = '';
    chosenLook = '';
    updateSelection();
    prepareBrief();
    email.focus({preventScroll:true});
  });
  idea.addEventListener('input', () => idea.setCustomValidity(''));
  email.addEventListener('input', prepareBrief);
  idea.addEventListener('input', prepareBrief);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    idea.setCustomValidity(idea.value.trim() ? '' : 'Tell us a little about your product or idea.');
    if (!form.reportValidity()) return;
    briefText = prepareBrief();
    if (lastSentSignature === briefText) { showResult(lastReference); return; }
    if (honey.value) return;
    const reference = 'PR-' + crypto.randomUUID().slice(0,8).toUpperCase();
    const payload = {
      email: email.value.trim(), _replyto: email.value.trim(), message: idea.value.trim(),
      package: selectionText() || 'Help me choose', reference,
      _subject: `promoready inquiry ${reference}`, _honey: honey.value
    };
    submitting = true;
    submit.disabled = true;
    email.readOnly = true;
    idea.readOnly = true;
    $('brief-clear').disabled = true;
    submitLabel.textContent = 'Sending…';
    form.setAttribute('aria-busy','true');
    feedback.hidden = true;
    try {
      await window.PROMOREADY_INQUIRY.send(payload);
      lastSentSignature = briefText;
      lastReference = reference;
      showResult(reference);
    } catch (error) {
      feedback.textContent = error.code === 'activation'
        ? 'Please email us directly while we activate online submissions. Your details are still here.'
        : 'We couldn’t confirm your submission. Your details are still here. Please try again, or email us directly below.';
      feedback.hidden = false;
      if (dialog.open) feedback.scrollIntoView({block:'nearest'});
    } finally {
      submitting = false;
      submit.disabled = false;
      email.readOnly = false;
      idea.readOnly = false;
      $('brief-clear').disabled = false;
      submitLabel.textContent = 'Send my inquiry';
      form.removeAttribute('aria-busy');
    }
  });
  $('brief-edit').addEventListener('click', () => {
    idea.value = '';
    idea.setCustomValidity('');
    showForm();
    prepareBrief();
    idea.focus({preventScroll:true});
  });
  $('brief-copy').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(briefText);
      status.textContent = 'Brief copied.';
    } catch {
      // Native selection keeps copying available in local file previews.
      const range = document.createRange();
      range.selectNodeContents(summary);
      const selected = window.getSelection();
      selected.removeAllRanges();
      selected.addRange(range);
      summary.focus({preventScroll:true});
      const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘C' : 'Ctrl+C';
      status.textContent = `Your brief is selected. Press ${shortcut} to copy, or choose Save brief.`;
    }
  });
  $('brief-save').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([briefText], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'promoready-video-brief.txt';
    dialog.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Your brief is ready to save to your device.';
  });
})();
