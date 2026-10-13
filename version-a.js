(() => {
  'use strict';
  if (document.body.dataset.playback !== 'inline') return;

  // Keep the keyboard reading order aligned with the mobile film-first layout.
  const heroCopy = document.querySelector('.hero-copy');
  const heroFrame = document.querySelector('.hero-frame');
  const heroCta = heroCopy?.querySelector('.button');
  if (heroCopy && heroFrame && heroCta) {
    heroCta.classList.add('hero-cta');
    const mobileLayout = window.matchMedia('(max-width: 520px)');
    function placeHeroActions() {
      const focused = document.activeElement;
      if (mobileLayout.matches) {
        heroFrame.after(heroCta);
      } else {
        heroCopy.append(heroCta);
      }
      if (focused === heroCta) heroCta.focus({preventScroll:true});
    }
    placeHeroActions();
    if (mobileLayout.addEventListener) mobileLayout.addEventListener('change',placeHeroActions);
    else mobileLayout.addListener(placeHeroActions);
  }

  const clips = {
    outdoor:{ratio:'2.33 / 1',label:'Outdoor cinematic film'},
    ugc:{ratio:'9 / 16',label:'Conversational beauty product film'},
    tech:{ratio:'16 / 9',label:'Technical product film'},
    story:{ratio:'16 / 9',label:'Brand story film'},
    lifestyle:{ratio:'9 / 16',label:'Everyday lifestyle film'},
    performance:{ratio:'3 / 4',label:'Performance product film'}
  };
  const players = [];
  function pauseOthers(current) { players.forEach(player => { if (player.video !== current) player.video.pause(); }); }

  document.querySelectorAll('main [data-play]').forEach(trigger => {
    const key = trigger.dataset.play;
    const clip = clips[key];
    if (!clip) return;
    const slot = document.createElement('div');
    slot.className = 'a-media-slot';
    slot.style.setProperty('--a-media-ratio',clip.ratio);
    slot.dataset.inlinePlayer = key;
    trigger.parentNode.insertBefore(slot,trigger);
    slot.append(trigger);

    const video = document.createElement('video');
    video.className = 'a-inline-video';
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = 'assets/'+key+'.jpg';
    video.hidden = true;
    video.tabIndex = 0;
    video.setAttribute('aria-label',clip.label+' — inline video player');
    video.setAttribute('playsinline','');
    slot.append(video);

    const cover = document.createElement('button');
    cover.type = 'button';
    cover.className = 'a-player-cover';
    cover.hidden = true;
    cover.setAttribute('aria-label','Stop video and show '+clip.label.toLowerCase()+' cover');
    cover.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M14 4H5v9M5 4l10 10"/></svg><span>Back to cover</span>';
    slot.append(cover);

    const message = document.createElement('p');
    message.className = 'a-player-message';
    message.hidden = true;
    const status = document.createElement('span');
    status.className = 'a-player-status';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    slot.append(message,status);
    players.push({video,slot});

    function restoreCover() {
      const restoreFocus = document.activeElement === video || document.activeElement === cover;
      video.pause();
      video.hidden = true;
      trigger.hidden = false;
      cover.hidden = true;
      slot.classList.remove('is-started','is-loading');
      video.classList.remove('is-ready');
      if (restoreFocus) trigger.focus({preventScroll:true});
    }
    function mediaFailure() {
      restoreCover();
      message.textContent = 'The video could not load. Click the cover to try again.';
      message.hidden = false;
      status.textContent = message.textContent;
    }
    trigger.addEventListener('click',event => {
      event.preventDefault();
      event.stopPropagation();
      pauseOthers(video);
      message.hidden = true;
      status.textContent = 'Loading '+clip.label.toLowerCase()+'.';
      video.hidden = false;
      trigger.hidden = true;
      cover.hidden = false;
      slot.classList.add('is-started','is-loading');
      if (!video.getAttribute('src') || video.error) {
        video.src = 'assets/'+key+'.mp4';
        video.load();
      } else if (video.ended) video.currentTime = 0;
      video.focus({preventScroll:true});
      const attempt = video.play();
      if (attempt?.catch) attempt.catch(error => {
        slot.classList.remove('is-loading');
        if (error.name === 'AbortError') return;
        if (error.name === 'NotAllowedError') {
          status.textContent = 'Press Play in the video controls to start.';
          return;
        }
        mediaFailure();
      });
    });
    cover.addEventListener('click',event => {
      event.stopPropagation();
      restoreCover();
      message.hidden = true;
      status.textContent = 'Video stopped. Cover shown.';
      trigger.focus({preventScroll:true});
    });
    video.addEventListener('play',() => pauseOthers(video));
    video.addEventListener('playing',() => {
      slot.classList.remove('is-loading');
      video.classList.add('is-ready');
      status.textContent = 'Playing '+clip.label.toLowerCase()+'.';
    });
    video.addEventListener('pause',() => { if (!video.hidden && !video.ended) status.textContent = 'Video paused.'; });
    video.addEventListener('ended',() => { status.textContent = 'Video finished. Use the controls to replay.'; });
    video.addEventListener('error',mediaFailure);
  });

  document.addEventListener('click',event => {
    if (event.target.closest('[data-brief]')) pauseOthers(null);
  },true);
  document.addEventListener('visibilitychange',() => { if (document.hidden) pauseOthers(null); });
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) players.find(player => player.slot === entry.target)?.video.pause();
      });
    },{threshold:0});
    players.forEach(player => visibility.observe(player.slot));
  }
})();
