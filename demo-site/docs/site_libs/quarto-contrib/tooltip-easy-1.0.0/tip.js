// _extensions/tooltip-easy/shortcodes/tip.js
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadStyle(href) {
    return new Promise(function (resolve, reject) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = resolve;
      l.onerror = reject;
      document.head.appendChild(l);
    });
  }

  async function ensureTippy(theme, animation) {
    if (!document.querySelector('link[href*="tippy.css"]')) {
      await loadStyle('https://unpkg.com/tippy.js@6/dist/tippy.css');
    }
    if (theme && theme.indexOf('light') !== -1) {
      if (!document.querySelector('link[href*="themes/light.css"]'))
        await loadStyle('https://unpkg.com/tippy.js@6/themes/light.css');
      if (!document.querySelector('link[href*="themes/light-border.css"]'))
        await loadStyle('https://unpkg.com/tippy.js@6/themes/light-border.css');
    }
    var anim = animation || 'scale-subtle';
    if (!document.querySelector(`link[href*="animations/${anim}.css"]`)) {
      await loadStyle(`https://unpkg.com/tippy.js@6/animations/${anim}.css`);
    }
    if (typeof window.tippy !== 'function') {
      await loadScript('https://unpkg.com/@popperjs/core@2');
      await loadScript('https://unpkg.com/tippy.js@6/dist/tippy.umd.min.js');
    }
  }

  async function ensureMathJax() {
    if (window.MathJax) return;
    await loadScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js');
  }

  function typesetMath(root) {
    try {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([root]);
      }
    } catch (e) { /* ignore */ }
  }

  function harvestTipsets() {
    var hiddenHost = document.querySelector('.qtip-templates');
    if (!hiddenHost) {
      hiddenHost = document.createElement('div');
      hiddenHost.className = 'qtip-templates';
      hiddenHost.style.display = 'none';
      document.body.appendChild(hiddenHost);
    }
    document.querySelectorAll('.tipset[id]').forEach(function (div) {
      var id = div.id;
      if (!id) return;
      var tpl = document.createElement('template');
      tpl.id = id;
      tpl.innerHTML = div.innerHTML;
      hiddenHost.appendChild(tpl);
      div.parentNode && div.parentNode.removeChild(div);
    });
  }

  async function init() {
    await ensureMathJax();
    harvestTipsets();

    document.querySelectorAll('.qtip[data-content-id]').forEach(async function (container) {
      var btn       = container.querySelector('.qtip__btn');
      var contentId = container.getAttribute('data-content-id');
      var trigger   = container.getAttribute('data-trigger')   || 'mouseenter focus';
      var placement = container.getAttribute('data-placement') || 'bottom';
      var theme     = container.getAttribute('data-theme')     || 'light-border';
      var animation = container.getAttribute('data-animation') || 'scale-subtle';
      var maxWidth  = container.getAttribute('data-maxwidth')  || '860';
      var nav       = container.getAttribute('data-nav')       || 'auto';

      await ensureTippy(theme, animation);
      if (typeof window.tippy !== 'function') return;

      var tpl = contentId ? document.getElementById(contentId) : null;
      var node = (function (tpl) {
        var root = document.createElement('div');
        if (tpl && tpl.content) root.appendChild(tpl.content.cloneNode(true));
        else if (tpl) root.innerHTML = tpl.innerHTML;
        return root;
      })(tpl);

      var slides = node.querySelectorAll('.tip-slide, .tooltip-slide');
      var content = node;
      if (slides.length && nav !== 'false') {
        var wrapper = document.createElement('div');
        wrapper.className = 'qtip-card';
        var header = document.createElement('div');
        header.className = 'qtip-header';
        header.innerHTML = [
          '<div class="qtip-nav">',
          '  <button class="qtip-prev" aria-label="Previous slide">&larr;</button>',
          '  <button class="qtip-next" aria-label="Next slide">&rarr;</button>',
          '</div>',
          '<div class="qtip-counter"></div>'
        ].join('');
        var body = document.createElement('div');
        body.className = 'qtip-slides';
        slides.forEach(function (s) { body.appendChild(s.cloneNode(true)); });
        wrapper.appendChild(header); wrapper.appendChild(body);
        var current = 0, total = body.children.length;
        function show(i){
          Array.prototype.forEach.call(body.children, function(el, idx){
            el.style.display = (idx===i) ? 'block' : 'none';
          });
          header.querySelector('.qtip-counter').textContent = (i+1)+'/'+total;
          header.querySelector('.qtip-prev').disabled = (i===0);
          header.querySelector('.qtip-next').disabled = (i===total-1);
        }
        header.addEventListener('click', function (e) {
          if (e.target.closest('.qtip-prev') && current>0){ current--; show(current); }
          if (e.target.closest('.qtip-next') && current<total-1){ current++; show(current); }
        });
        wrapper.tabIndex = 0;
        wrapper.addEventListener('keydown', function (e) {
          if (e.key==='ArrowLeft' && current>0){ current--; show(current); }
          if (e.key==='ArrowRight' && current<total-1){ current++; show(current); }
        });
        show(current);
        content = wrapper;
      }

      window.tippy(btn, {
        content: content,
        allowHTML: true,
        interactive: true,
        trigger: trigger,
        appendTo: function() { return document.body; },
        maxWidth: maxWidth,
        placement: placement,
        theme: theme,
        animation: animation,
        inertia: true,
        onShown(instance) { typesetMath(instance.popper); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();