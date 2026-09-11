/* =========================================================
   凪 -nagi- facial salon  —  main.js
   - ヘッダーのスクロール追従（境界線の表示）
   - モバイルナビの開閉（aria / Escape / 背景タップ対応）
   - スクロールで各セクションをフェードイン
   - FAQ：ひとつ開くと他を閉じる
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;

  /* ---------- header: stuck state ---------- */
  var header = doc.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.toggleAttribute('data-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  var toggle = doc.querySelector('[data-nav-toggle]');
  var list = doc.querySelector('[data-nav-list]');

  if (toggle && list) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.visually-hidden').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
      list.toggleAttribute('data-open', open);
      body.toggleAttribute('data-nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    body.addEventListener('click', function (e) {
      if (
        body.hasAttribute('data-nav-open') &&
        !e.target.closest('[data-nav-list]') &&
        !e.target.closest('[data-nav-toggle]')
      ) {
        setNav(false);
      }
    });

    // 幅が広がったら状態をリセット
    var mq = window.matchMedia('(min-width: 761px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
      if (mq.matches) setNav(false);
    });
  }

  /* ---------- reveal on scroll ----------
     方針: 初回表示（静止状態）では全セクションを見せる。
     画面より下にあるものだけを非表示にして、スクロールで出す。
     JS が無い / reduced-motion / IO 非対応 のときは何もしない＝常に表示。 */
  var reveals = doc.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && 'IntersectionObserver' in window && reveals.length) {
    doc.documentElement.classList.add('js-anim');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    var vh = window.innerHeight || doc.documentElement.clientHeight;
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.9) {
        el.classList.add('is-in');   // すでに見えている範囲は即表示
      } else {
        el.classList.add('reveal--armed');
        io.observe(el);
      }
    });
  }

  /* ---------- FAQ: accordion (one open at a time) ---------- */
  var faq = doc.querySelector('[data-faq]');
  if (faq) {
    var items = faq.querySelectorAll('details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (other) {
          if (other !== d) other.open = false;
        });
      });
    });
  }
})();
