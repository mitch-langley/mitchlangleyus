(() => {
  const disclosures = [...document.querySelectorAll('[data-nav-disclosure]')];

  for (const disclosure of disclosures) {
    disclosure.addEventListener('toggle', () => {
      if (!disclosure.open) return;
      const group = disclosure.closest('[data-disclosure-group]');
      for (const other of disclosures) {
        if (other !== disclosure && other.closest('[data-disclosure-group]') === group) {
          other.open = false;
        }
      }
    });
  }

  document.addEventListener('pointerdown', (event) => {
    for (const disclosure of disclosures) {
      if (disclosure.open && !disclosure.contains(event.target)) disclosure.open = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = disclosures.filter((disclosure) => disclosure.open);
    if (!open.length) return;
    const focused = open.find((disclosure) => disclosure.contains(document.activeElement));
    for (const disclosure of open) disclosure.open = false;
    if (focused) focused.querySelector('summary').focus();
    event.preventDefault();
  });

  const header = document.querySelector('.doc-head');
  if (header) {
    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
    };
    updateHeaderHeight();
    if ('ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);
  }
})();
