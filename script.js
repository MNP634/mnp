/**
 * MNP – Mbuyane Ntsako Pardon
 * script.js — Minimal interaction layer
 *
 * Handles:
 *  1. Navigation: mobile toggle + header scroll state
 *  2. FAQ: accessible accordion
 *  3. Contact form: client-side validation + submission feedback
 */

(function () {
  'use strict';

  /* ============================================================
     1. NAVIGATION
  ============================================================ */
  const header    = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  // Mobile nav open/close
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    // Close nav when a link is clicked (smooth scroll target)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
      }
    });
  }

  // Header scroll state (adds .scrolled class for stronger background)
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }


  /* ============================================================
     2. FAQ ACCORDION
  ============================================================ */
  const faqList = document.getElementById('faq-list');

  if (faqList) {
    faqList.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const answerId   = btn.getAttribute('aria-controls');
        const answer     = document.getElementById(answerId);

        // Collapse all other open items first
        faqList.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(function (openBtn) {
          if (openBtn !== btn) {
            openBtn.setAttribute('aria-expanded', 'false');
            const openAnswer = document.getElementById(openBtn.getAttribute('aria-controls'));
            if (openAnswer) openAnswer.hidden = true;
          }
        });

        // Toggle this item
        btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        if (answer) answer.hidden = isExpanded;
      });
    });
  }


  /* ============================================================
     3. CONTACT FORM — validation & submission feedback
  ============================================================ */
  const form          = document.getElementById('contact-form');
  const submitBtn     = document.getElementById('form-submit');
  const successMsg    = document.getElementById('form-success');
  const errorMsg      = document.getElementById('form-error-global');

  if (form) {
    // Live validation helper
    function validateField(input, errorEl, rule) {
      if (!input || !errorEl) return true;
      const message = rule(input.value.trim());
      if (message) {
        input.classList.add('invalid');
        errorEl.textContent = message;
        return false;
      }
      input.classList.remove('invalid');
      errorEl.textContent = '';
      return true;
    }

    // Validation rules
    const rules = {
      'contact-name': function (v) {
        if (!v) return 'Please enter your full name.';
        return '';
      },
      'contact-email': function (v) {
        if (!v) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
        return '';
      },
      'contact-message': function (v) {
        if (!v) return 'Please include a brief message.';
        if (v.length < 10) return 'Message is too short — please add a little more detail.';
        return '';
      }
    };

    // Attach blur-time validation to each field
    Object.keys(rules).forEach(function (id) {
      const input   = document.getElementById(id);
      const errorEl = document.getElementById('error-' + id.replace('contact-', ''));
      if (input) {
        input.addEventListener('blur', function () {
          validateField(input, errorEl, rules[id]);
        });
        // Clear error on input
        input.addEventListener('input', function () {
          if (input.classList.contains('invalid')) {
            validateField(input, errorEl, rules[id]);
          }
        });
      }
    });

    // Form submit — works with FormSubmit.co (free, no signup required)
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Run all validations
      let valid = true;
      Object.keys(rules).forEach(function (id) {
        const input   = document.getElementById(id);
        const errorEl = document.getElementById('error-' + id.replace('contact-', ''));
        if (!validateField(input, errorEl, rules[id])) valid = false;
      });

      if (!valid) return;

      // Disable button during submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      if (successMsg) successMsg.hidden = true;
      if (errorMsg)   errorMsg.hidden   = true;

      try {
        const data     = new FormData(form);
        const response = await fetch(form.action, {
          method:  'POST',
          body:    data,
          headers: { 'Accept': 'application/json' }
        });

        // FormSubmit.co returns { success: "true" } on success
        if (response.ok) {
          const json = await response.json().catch(function () { return { success: 'true' }; });
          if (json.success === 'true' || json.success === true) {
            form.reset();
            if (successMsg) {
              successMsg.hidden = false;
              successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            throw new Error('Unexpected response from form service');
          }
        } else {
          throw new Error('Form service responded with ' + response.status);
        }
      } catch (err) {
        if (errorMsg) errorMsg.hidden = false;
        console.error('Form submission error:', err);
      } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

})();
