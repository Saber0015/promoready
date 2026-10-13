/* The mail service must be activated by the recipient before launch acceptance. */
(() => {
  'use strict';
  class InquiryError extends Error {
    constructor(code) { super(code); this.name = 'InquiryError'; this.code = code; }
  }
  function checkResponse(ok, data) {
    const message = typeof data?.message === 'string' ? data.message : '';
    if (/activat|confirm your (?:email|form)|verify your email/i.test(message)) throw new InquiryError('activation');
    if (!ok || !(data?.success === true || data?.success === 'true')) throw new InquiryError('unconfirmed');
    return true;
  }
  async function send(payload) {
    const cfg = window.SITE_CONFIG;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(cfg.inquiryEndpoint, {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'Accept':'application/json'},
        body: JSON.stringify({...payload, _template:'table', _url:cfg.siteUrl}),
        signal: controller.signal,
        credentials: 'omit'
      });
      const data = await response.json();
      checkResponse(response.ok, data);
      return {accepted:true};
    } catch (error) {
      if (error instanceof InquiryError) throw error;
      throw new InquiryError('unconfirmed');
    } finally { clearTimeout(timeout); }
  }
  window.PROMOREADY_INQUIRY = {send, checkResponse};
})();
