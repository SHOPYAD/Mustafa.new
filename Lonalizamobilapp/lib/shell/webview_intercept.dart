import 'dart:convert';

/// JS injected into the WebView so SPA navigations and raw nginx HTML
/// can talk to the native shell. Isolated from product UI.
class WebViewIntercept {
  static const String scrollAndShellCss = r'''
    (function() {
      try {
        document.documentElement.classList.add('lonaliza-app-shell');
        document.body.classList.add('lonaliza-app-shell');
        if (!document.getElementById('lonaliza-native-scroll-rules')) {
          var s = document.createElement('style');
          s.id = 'lonaliza-native-scroll-rules';
          s.textContent = `
            *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
            * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            html, body {
              overscroll-behavior-y: contain;
              -webkit-overflow-scrolling: touch;
            }
            html.lonaliza-app-shell {
              background-color: #140522;
            }
          `;
          document.head.appendChild(s);
        }
      } catch (e) {}
    })();
  ''';

  static const String nginxAndReadyProbe = r'''
    (function() {
      try {
        var title = (document.title || '');
        var text = '';
        try { text = (document.body && (document.body.innerText || document.body.textContent) || '').slice(0, 800); } catch (e) {}
        var hay = (title + ' ' + text).toLowerCase();
        var nginx = (
          hay.indexOf('502 bad gateway') !== -1 ||
          hay.indexOf('503 service') !== -1 ||
          hay.indexOf('504 gateway') !== -1 ||
          hay.indexOf('500 internal server') !== -1 ||
          ((hay.indexOf('nginx') !== -1) && (
            hay.indexOf('bad gateway') !== -1 ||
            hay.indexOf('service temporarily unavailable') !== -1 ||
            hay.indexOf('gateway time-out') !== -1 ||
            hay.indexOf('gateway timeout') !== -1
          ))
        );
        if (nginx && window.LonalizaNativeBridge) {
          try {
            document.documentElement.style.background = '#140522';
            if (document.body) {
              document.body.style.background = '#140522';
              document.body.style.color = 'transparent';
            }
          } catch (e) {}
          window.LonalizaNativeBridge.postMessage(JSON.stringify({
            type: 'httpError',
            status: 502,
            source: 'html-detect'
          }));
          return;
        }
        var ping = function(kind) {
          if (window.LonalizaNativeBridge) {
            window.LonalizaNativeBridge.postMessage(JSON.stringify({
              type: kind,
              href: location.href
            }));
          }
        };
        ping('pageReady');
        requestAnimationFrame(function() {
          requestAnimationFrame(function() { ping('paint'); });
        });
      } catch (e) {}
    })();
  ''';

  static const String spaNavHooks = r'''
    (function() {
      try {
        if (window.__lonalizaShellHooks) return;
        window.__lonalizaShellHooks = true;
        var notify = function(type) {
          try {
            if (window.LonalizaNativeBridge) {
              window.LonalizaNativeBridge.postMessage(JSON.stringify({
                type: type,
                href: location.href
              }));
            }
          } catch (e) {}
        };
        var notifyPaint = function() {
          requestAnimationFrame(function() {
            requestAnimationFrame(function() { notify('paint'); });
          });
        };
        var wrap = function(fnName) {
          var orig = history[fnName];
          if (typeof orig !== 'function') return;
          history[fnName] = function() {
            notify('navStart');
            var result = orig.apply(this, arguments);
            notifyPaint();
            return result;
          };
        };
        wrap('pushState');
        wrap('replaceState');
        window.addEventListener('popstate', function() {
          notify('navStart');
          notifyPaint();
        });
      } catch (e) {}
    })();
  ''';

  /// Durable goHome / navigate bridge. Queues until Next.js hydrates.
  /// Same-origin `<a>` clicks never cold-fetch HTML.
  static const String clientRouterInstall = r'''
    (function() {
      try {
        if (window.__lonalizaBridgeReady) return;
        window.__lonalizaBridgeReady = true;
        window.__lonalizaNavQueue = window.__lonalizaNavQueue || [];
        var toPath = function(input) {
          try {
            var u = new URL(input, location.href);
            return u.pathname + u.search + u.hash;
          } catch (e) { return input; }
        };
        var withApp = function(path) {
          try {
            var u = new URL(path, location.origin);
            if (!u.searchParams.has('app')) u.searchParams.set('app', '1');
            return u.pathname + u.search + u.hash;
          } catch (e) { return path; }
        };
        var ping = function(type) {
          try {
            if (window.LonalizaNativeBridge) {
              window.LonalizaNativeBridge.postMessage(JSON.stringify({
                type: type,
                href: location.href
              }));
            }
          } catch (e) {}
        };
        var apply = function(path, replace) {
          var next = withApp(toPath(path));
          var router = window.__lonalizaRouter;
          var impl = window.__lonalizaNavigateImpl;
          if (typeof impl === 'function') {
            ping('navStart');
            impl(next, {replace: !!replace});
            return true;
          }
          if (router) {
            ping('navStart');
            if (replace && typeof router.replace === 'function') router.replace(next);
            else if (typeof router.push === 'function') router.push(next);
            else return false;
            return true;
          }
          window.__lonalizaNavQueue.push({path: next, replace: !!replace});
          return false;
        };
        window.__lonalizaNavigate = function(path, opts) {
          apply(path, !!(opts && opts.replace));
        };
        window.__lonalizaGoHome = function() {
          apply('/?app=1', true);
        };
        window.__lonalizaFlushNav = function() {
          var q = window.__lonalizaNavQueue || [];
          window.__lonalizaNavQueue = [];
          for (var i = 0; i < q.length; i++) apply(q[i].path, q[i].replace);
        };
        setTimeout(function() {
          var q = window.__lonalizaNavQueue || [];
          if (!q.length) return;
          if (window.__lonalizaRouter || typeof window.__lonalizaNavigateImpl === 'function') {
            window.__lonalizaFlushNav();
            return;
          }
          var last = q[q.length - 1];
          window.__lonalizaNavQueue = [];
          if (last && last.path && window.LonalizaNativeBridge) {
            window.LonalizaNativeBridge.postMessage(JSON.stringify({
              type: 'fullReload',
              href: last.path
            }));
          }
        }, 6000);
        document.addEventListener('click', function(ev) {
          if (ev.defaultPrevented) return;
          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          if (ev.button !== 0) return;
          var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
          if (!a) return;
          if (a.target === '_blank' || a.hasAttribute('download')) return;
          var href = a.getAttribute('href') || '';
          if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
          if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
          if (href.indexOf('sms:') === 0 || href.indexOf('smsto:') === 0) return;
          if (href.indexOf('whatsapp:') === 0 || href.indexOf('intent:') === 0) return;
          if (href.indexOf('market:') === 0) return;
          try {
            var url = new URL(href, location.href);
            if (url.origin !== location.origin) return;
            var path = url.pathname.toLowerCase();
            if (path.indexOf('/api/') === 0) return;
            if (path.indexOf('/auth/google') !== -1) return;
            if (/iyzico|iyzipay|3dsecure|\/3ds/i.test(url.href)) return;
            ev.preventDefault();
            apply(url.pathname + url.search + url.hash, false);
          } catch (e) {}
        }, true);
      } catch (e) {}
    })();
  ''';

  /// Capture WhatsApp / tel / mailto / intent before Chromium tries to load them.
  static const String externalSchemeHandoff = r'''
    (function() {
      try {
        if (window.__lonalizaExternalHandoff) return;
        window.__lonalizaExternalHandoff = true;
        var isExternal = function(href) {
          if (!href) return false;
          var low = String(href).toLowerCase();
          if (low.indexOf('whatsapp:') === 0 || low.indexOf('intent:') === 0 ||
              low.indexOf('tel:') === 0 || low.indexOf('mailto:') === 0 ||
              low.indexOf('sms:') === 0 || low.indexOf('smsto:') === 0 ||
              low.indexOf('market:') === 0) return true;
          try {
            var u = new URL(href, location.href);
            var host = (u.host || '').toLowerCase();
            if (host === 'wa.me' || host === 'www.wa.me' || host === 'api.whatsapp.com') return true;
          } catch (e) {}
          return false;
        };
        var handoff = function(href) {
          if (!window.LonalizaNativeBridge) return false;
          try {
            var abs = href;
            try { abs = new URL(href, location.href).href; } catch (e) {}
            window.LonalizaNativeBridge.postMessage(JSON.stringify({
              type: 'openExternal',
              href: abs
            }));
            return true;
          } catch (e) { return false; }
        };
        var origOpen = window.open;
        window.open = function(url) {
          if (url && isExternal(url) && handoff(url)) return null;
          return origOpen.apply(this, arguments);
        };
        document.addEventListener('click', function(ev) {
          if (ev.defaultPrevented) return;
          var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
          if (!a) return;
          var href = a.getAttribute('href') || '';
          if (!isExternal(href)) return;
          ev.preventDefault();
          handoff(href);
        }, true);
      } catch (e) {}
    })();
  ''';

  static String goHomeScript([String fallbackUrl = 'https://lonaliza.com/?app=1']) {
    final fallbackJson = jsonEncode(fallbackUrl);
    return '''
      (function() {
        try {
          if (window.__lonalizaGoHome) { window.__lonalizaGoHome(); return; }
          if (window.__lonalizaNavigate) { window.__lonalizaNavigate('/?app=1', {replace: true}); return; }
          if (window.__lonalizaRouter && window.__lonalizaRouter.replace) {
            window.__lonalizaRouter.replace('/?app=1');
            return;
          }
          (window.__lonalizaNavQueue = window.__lonalizaNavQueue || []).push({path: '/?app=1', replace: true, fallback: $fallbackJson});
        } catch (e) {}
      })();
    ''';
  }

  static String navigateScript(
    String pathWithQuery,
    String fallbackUrl, {
    bool replace = true,
  }) {
    final pathJson = jsonEncode(pathWithQuery);
    final fallbackJson = jsonEncode(fallbackUrl);
    final replaceJs = replace ? 'true' : 'false';
    return '''
      (function() {
        try {
          var path = $pathJson;
          var replace = $replaceJs;
          var fallback = $fallbackJson;
          if (window.__lonalizaGoHome && (path === '/' || path.indexOf('/?') === 0)) {
            window.__lonalizaGoHome();
            return;
          }
          if (window.__lonalizaNavigate) {
            window.__lonalizaNavigate(path, {replace: replace});
            return;
          }
          if (window.__lonalizaRouter) {
            if (replace && window.__lonalizaRouter.replace) window.__lonalizaRouter.replace(path);
            else window.__lonalizaRouter.push(path);
            return;
          }
          (window.__lonalizaNavQueue = window.__lonalizaNavQueue || []).push({path: path, replace: replace, fallback: fallback});
        } catch (e) {
          (window.__lonalizaNavQueue = window.__lonalizaNavQueue || []).push({path: $pathJson, replace: $replaceJs});
        }
      })();
    ''';
  }

  static const String pageAliveProbe = r'''
    (function() {
      try {
        var title = (document.title || '');
        var text = (document.body && (document.body.innerText || '') || '').slice(0, 400);
        var ready = document.readyState;
        return JSON.stringify({ title: title, text: text, ready: ready, href: location.href });
      } catch (e) {
        return JSON.stringify({ title: '', text: '', ready: 'error' });
      }
    })();
  ''';
}
