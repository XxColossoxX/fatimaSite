const revealElements = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('[data-counter]');
const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('mainMenu');
const scrollBar = document.getElementById('scrollBar');
const whatsappForm = document.getElementById('whatsappForm');
const header = document.getElementById('topo');
const faqItems = document.querySelectorAll('.faq-item');
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const devInfoToggle = document.getElementById('devInfoToggle');
const devPanel = document.getElementById('devPanel');
const devContactForm = document.getElementById('devContactForm');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

const animateCounter = (element) => {
  const target = Number(element.dataset.counter || 0);
  const duration = 1200;
  const start = performance.now();

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.7 }
);

counters.forEach((counter) => counterObserver.observe(counter));

if (menuToggle && menu) {
  const closeMenu = () => {
    menu.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        closeMenu();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (window.innerWidth >= 768) return;
    if (!menu.classList.contains('open')) return;
    if (menu.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
  });
}

window.addEventListener(
  'scroll',
  () => {
    const fullHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = fullHeight > 0 ? (window.scrollY / fullHeight) * 100 : 0;
    scrollBar.style.width = `${Math.min(progress, 100)}%`;
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }
  },
  { passive: true }
);

if (faqItems.length > 0) {
  const setPanelState = (item, expanded, instant = false) => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-content');
    if (!trigger || !panel) return;

    if (instant) {
      panel.style.transition = 'none';
    }

    item.classList.toggle('open', expanded);
    trigger.setAttribute('aria-expanded', String(expanded));
    panel.style.maxHeight = expanded ? `${panel.scrollHeight}px` : '0px';

    if (instant) {
      requestAnimationFrame(() => {
        panel.style.transition = '';
      });
    }
  };

  faqItems.forEach((item, index) => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    setPanelState(item, item.classList.contains('open') || index === 0, true);

    trigger.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('open');

      faqItems.forEach((other) => {
        if (other !== item) {
          setPanelState(other, false);
        }
      });

      setPanelState(item, shouldOpen);
    });
  });

  window.addEventListener('resize', () => {
    faqItems.forEach((item) => {
      if (item.classList.contains('open')) {
        const panel = item.querySelector('.faq-content');
        if (panel) {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }
      }
    });
  });
}

if (whatsappForm) {
  whatsappForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = (document.getElementById('nome')?.value || '').trim();
    const telefone = (document.getElementById('telefone')?.value || '').trim();
    const parentesco = (document.getElementById('parentesco')?.value || '').trim();
    const periodo = (document.getElementById('periodo')?.value || 'A combinar').trim();
    const mensagemExtra = (document.getElementById('mensagem')?.value || '').trim();

    const linhas = [
      'Olá Fatima, vim pelo site e gostaria de um atendimento.',
      `Nome: ${nome || 'Não informado'}`,
      `Telefone: ${telefone || 'Não informado'}`,
      `Parentesco: ${parentesco || 'Não informado'}`,
      `Período desejado: ${periodo}`,
      `Detalhes: ${mensagemExtra || 'Sem detalhes adicionais.'}`
    ];

    const texto = encodeURIComponent(linhas.join('\n'));
    const url = `https://wa.me/5511992349916?text=${texto}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

// Animação de scroll com GSAP ao navegar para seções
if (anchorLinks.length > 0) {
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();

      const headerOffset = header ? header.offsetHeight : 0;
      const extraOffset = 26;
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - extraOffset;

      // Anima scroll com GSAP
      gsap.to(window, {
        duration: 0.8,
        scrollTo: { y: Math.max(y, 0), autoKill: true },
        ease: "power2.inOut",
        onComplete: () => {
          // Re-anima elementos reveal da seção alvo quando termina o scroll
          const sectionRevealElements = target.querySelectorAll('.reveal');
          sectionRevealElements.forEach((el) => {
            el.classList.remove('in-view');
            revealObserver.observe(el);
          });
        }
      });

      history.pushState(null, '', hash);
    });
  });
}

if (devInfoToggle && devPanel) {
  devInfoToggle.addEventListener('click', () => {
    const isOpen = devPanel.classList.toggle('open');
    devInfoToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

if (devContactForm) {
  devContactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nome = (document.getElementById('devNome')?.value || '').trim();
    const mensagem = (document.getElementById('devMensagem')?.value || '').trim();

    const linhas = [
      mensagem || 'Olá Pedro Henrique Ribeiro, vi um dos seus projetos e gostaria de entrar em contato.',
      `Nome: ${nome || 'Não informado'}`
    ];

    const texto = encodeURIComponent(linhas.join('\n'));
    const url = `https://wa.me/5511992349916?text=${texto}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

// Funções do modal do desenvolvedor
function openContactDeveloperModal() {
  const modal = document.getElementById('contactDeveloperModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeContactDeveloperModal() {
  const modal = document.getElementById('contactDeveloperModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function handleDeveloperContact(event) {
  event.preventDefault();
  const subject = (document.getElementById('developerSubject')?.value || '').trim();
  
  if (!subject) {
    alert('Por favor, preencha o assunto');
    return;
  }

  const texto = encodeURIComponent(`Olá Pedro! Vim pelo site. Assunto: ${subject}`);
  const url = `https://wa.me/5511992349916?text=${texto}`;
  
  closeContactDeveloperModal();
  document.getElementById('contactDeveloperForm').reset();
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Fechar modal ao clicar no backdrop
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contactDeveloperModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeContactDeveloperModal();
      }
    });
  }

  // Fechar modal com ESC
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeContactDeveloperModal();
    }
  });
});
