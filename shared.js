(() => {
  'use strict';
  const cfg = window.SITE_CONFIG || {brand:'promoready',email:'',paypalUrl:'',prices:{single:49,trio:129,monthly:299}};
  const references = {
    ugc:{title:'Beauty · conversational product demo',time:'23.50 sec',ratio:'9:16',src:'ugc',style:'Conversational product demo'},
    outdoor:{title:'Outdoor · cinematic brand mood',time:'25.01 sec',ratio:'2.33:1',src:'outdoor',style:'Cinematic brand mood'},
    tech:{title:'Technology · product detail',time:'30.36 sec',ratio:'16:9',src:'tech',style:'Product detail'},
    story:{title:'Lifestyle · brand storytelling',time:'30.60 sec',ratio:'16:9',src:'story',style:'Brand storytelling'},
    lifestyle:{title:'Footwear · everyday product story',time:'16.34 sec',ratio:'9:16',src:'lifestyle',style:'Everyday product story'},
    performance:{title:'Footwear · technical close-up',time:'50.13 sec',ratio:'3:4',src:'performance',style:'Technical close-up'}
  };
  const packages = {single:'Single video · 1 × 15–20 sec',trio:'Campaign trio · 3 × 15–20 sec',monthly:'Monthly rhythm · 8 × 15–20 sec'};
  const html = `<a class="pr-skip" href="#main">Skip to content</a>
  <dialog class="pr-dialog pr-reference-dialog" id="pr-video-dialog" aria-labelledby="pr-video-title">
    <div class="pr-dialog-top"><h2 id="pr-video-title">Style reference</h2><button type="button" class="pr-close" data-close aria-label="Close video">×</button></div>
    <video controls playsinline preload="none" id="pr-video" aria-label="Play supplied style reference"></video>
    <div class="pr-reference-caption"><div><p id="pr-video-meta"></p><p>Supplied style reference, not a promoready client project or endorsement.</p></div><button type="button" class="pr-button" id="pr-use-style" data-brief>Use this style ↗</button><p hidden id="pr-video-error" class="pr-error" role="status">This video could not load. Close it and try again.</p></div>
  </dialog>
  <dialog class="pr-dialog" id="pr-brief-dialog" aria-labelledby="pr-brief-title">
    <div class="pr-dialog-top"><h2 id="pr-brief-title">Start with a simple brief.</h2><button type="button" class="pr-close" data-close aria-label="Close brief">×</button></div>
    <div class="pr-dialog-content"><p>Tell us what you want to promote. The scope, price and delivery date are confirmed before production.</p>
      <div class="pr-draft-note">Concept preview: this form prepares a brief on your device. Nothing is uploaded, sent or charged.</div>
      <form id="pr-brief-form">
        <div class="pr-form-grid">
          <label class="pr-field">Business name<input required name="business" autocomplete="organization" placeholder="Your shop or brand" maxlength="120"></label>
          <label class="pr-field">Your email<input required type="email" name="email" autocomplete="email" placeholder="you@yourbusiness.com" maxlength="180"></label>
          <label class="pr-field">Package<select name="package"><option value="single">Single video · $${cfg.prices.single} draft</option><option value="trio">Campaign trio · $${cfg.prices.trio} draft</option><option value="monthly">Monthly rhythm · $${cfg.prices.monthly} draft</option></select></label>
          <label class="pr-field">Where will you post?<select name="format"><option>Vertical · 9:16</option><option>Landscape · 16:9</option><option>Square · 1:1</option><option>Help me choose</option></select></label>
          <label class="pr-field full">What are you promoting?<textarea required name="goal" placeholder="A new product, a weekend offer, or something your customers should know." maxlength="1800"></textarea></label>
          <label class="pr-field">Website (optional)<input type="url" name="website" placeholder="https://yourbusiness.com" maxlength="500"></label>
          <label class="pr-field">Asset sharing link (optional)<input type="url" name="assets" placeholder="https://…" maxlength="1000"><small>Link to your photos or clips. You can also share them later by email.</small></label>
          <label class="pr-field">Preferred style<input name="style" value="Help me choose" maxlength="160"></label>
          <label class="pr-field">When do you need it?<input name="deadline" placeholder="A date, or flexible" maxlength="120"><small>Timing is agreed with your quote.</small></label>
          <label class="pr-field-check"><input required type="checkbox" name="permission"><span>I can share assets that I own or have permission to use.</span></label>
        </div>
        <div class="pr-form-bottom"><button type="submit" class="pr-button">Prepare my brief ↗</button><small>Suggested scope: one output ratio and one round of minor revisions per video. Final terms are agreed in your quote.</small></div>
      </form>
      <section class="pr-result" id="pr-result" aria-labelledby="pr-result-title" hidden>
        <h3 id="pr-result-title">Your brief is ready to review.</h3><p>Nothing has been sent. Copy or save this brief for the quote conversation.</p>
        <pre id="pr-brief-text"></pre>
        <div class="pr-result-actions"><button type="button" class="pr-button" id="pr-copy">Copy brief</button><a class="pr-button secondary" id="pr-download" download="promoready-video-brief.txt">Save brief</a><a class="pr-button secondary" id="pr-email" hidden>Open email draft</a><button class="pr-button secondary" type="button" id="pr-payment-toggle" aria-expanded="false" aria-controls="pr-payment">View payment step</button></div>
        <p id="pr-copy-status" role="status"></p>
        <section class="pr-payment" id="pr-payment" hidden><h3>Confirm first. Pay next.</h3><ol><li>Agree the material, video scope, price and delivery date by email.</li><li>Receive the confirmed payment request.</li><li>Review your video, then receive the agreed final files.</li></ol><p class="pr-payment-state">Preview only: the contact address and PayPal checkout are placeholders awaiting setup. No payment can be taken here.</p><a id="pr-paypal" class="pr-button" target="_blank" rel="noopener noreferrer" hidden>Open PayPal</a></section>
      </section>
    </div>
  </dialog>
`;
  document.body.insertAdjacentHTML('beforeend',html);
  const version=document.body.dataset.version;
  document.querySelector(`[data-version-link="${version}"]`)?.setAttribute('aria-current','page');
  document.querySelectorAll('[data-price]').forEach(el=>{if(cfg.prices[el.dataset.price])el.textContent='$'+cfg.prices[el.dataset.price];});
  if(!document.getElementById('main'))document.querySelector('main')?.setAttribute('id','main');
  const videoDialog=document.getElementById('pr-video-dialog');
  const briefDialog=document.getElementById('pr-brief-dialog');
  const video=document.getElementById('pr-video');
  const form=document.getElementById('pr-brief-form');
  function show(dialog,source){dialog._prOpener=source;document.querySelectorAll('dialog[open]').forEach(d=>d.close());dialog.showModal();}
  document.querySelectorAll('.pr-dialog').forEach(dialog=>{
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{if(dialog===videoDialog){video.pause();video.removeAttribute('src');video.load();}if(!document.querySelector('dialog[open]'))dialog._prOpener?.focus({preventScroll:true});});
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  });
  video.addEventListener('error',()=>{if(videoDialog.open&&video.getAttribute('src'))document.getElementById('pr-video-error').hidden=false;});
  document.addEventListener('click',e=>{
    const play=e.target.closest('[data-play]');
    if(play && document.body.dataset.playback !== "inline"){const ref=references[play.dataset.play];if(!ref)return;document.getElementById('pr-video-title').textContent=ref.title;document.getElementById('pr-video-meta').textContent=`${ref.time} · ${ref.ratio} · Supplied style reference`;document.getElementById('pr-use-style').dataset.style=ref.style;document.getElementById('pr-video-error').hidden=true;video.poster='assets/'+ref.src+'.jpg';show(videoDialog,play);video.src='assets/'+ref.src+'.mp4';video.load();video.play().catch(()=>{});return;}
    const brief=e.target.closest('[data-brief]');
    if(brief){if(brief.dataset.package&&packages[brief.dataset.package])form.elements.package.value=brief.dataset.package;if(brief.dataset.style)form.elements.style.value=references[brief.dataset.style]?.style||(brief.dataset.style==='unsure'?'Help me choose':brief.dataset.style);document.getElementById('pr-result').hidden=true;document.getElementById('pr-payment').hidden=true;document.getElementById('pr-payment-toggle').setAttribute('aria-expanded','false');show(briefDialog,brief);return;}
  });
  let briefText='';
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(form);const plan=fd.get('package');
    briefText=[`${cfg.brand} — Video brief`,`Business: ${fd.get('business')}`,`Reply email: ${fd.get('email')}`,`Package: ${packages[plan]}`,`Draft package price: $${cfg.prices[plan]} USD, subject to confirmed quote`,`Publishing format: ${fd.get('format')}`,`Goal: ${fd.get('goal')}`,`Website: ${fd.get('website')||'To be shared'}`,`Asset link: ${fd.get('assets')||'To be shared by email'}`,`Style: ${fd.get('style')||'Help me choose'}`,`Preferred deadline: ${fd.get('deadline')||'Flexible; please confirm timing'}`,'Asset permission: confirmed by the requester.','Suggested scope: one output ratio and one round of minor revisions per video.','Please confirm materials, final scope, price and delivery date before production.','Prepared locally for review. Nothing has been sent or paid.'].join('\n\n');
    document.getElementById('pr-brief-text').textContent=briefText;
    document.getElementById('pr-download').href='data:text/plain;charset=utf-8,'+encodeURIComponent(briefText);
    document.getElementById('pr-result').hidden=false;
    document.getElementById('pr-copy-status').textContent='';
    const mail=document.getElementById('pr-email');
    if(cfg.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.email)){mail.href='mailto:'+encodeURIComponent(cfg.email)+'?subject='+encodeURIComponent('Video brief — '+fd.get('business'))+'&body='+encodeURIComponent(briefText);mail.hidden=false;}
    document.getElementById('pr-result-title').setAttribute('tabindex','-1');document.getElementById('pr-result-title').focus({preventScroll:true});
    briefDialog.scrollTo({top:briefDialog.scrollHeight,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  document.getElementById('pr-copy').addEventListener('click',async()=>{
    let copied=false;
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(briefText);copied=true;}}catch{}
    if(!copied){const field=document.createElement('textarea');field.value=briefText;field.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();}
    document.getElementById('pr-copy-status').textContent=copied?'Brief copied. Nothing has been sent.':'Copy is unavailable in this browser. Use Save brief.';
  });
  document.getElementById('pr-payment-toggle').addEventListener('click',e=>{const section=document.getElementById('pr-payment');section.hidden=!section.hidden;e.currentTarget.setAttribute('aria-expanded',String(!section.hidden));if(cfg.paypalUrl&&cfg.paypalUrl.startsWith('https://')){document.getElementById('pr-paypal').href=cfg.paypalUrl;document.getElementById('pr-paypal').hidden=false;section.querySelector('.pr-payment-state').textContent='Pay only after confirming your quote. This link opens the configured checkout; this page does not process payment.';}});
})();
