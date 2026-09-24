document.body.classList.add('has-js');

const menuButton = document.querySelector('.menu-toggle');
const menuLinks = document.querySelector('.nav-links');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuLinks.classList.toggle('open', open);
});
menuLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const revealElements = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('visible'));
}

const tabs = [...document.querySelectorAll('.model-tab')];
const modelImage = document.querySelector('#model-image');
const modelTitle = document.querySelector('#model-title');
const modelSubtitle = document.querySelector('#model-subtitle');
const modelDescription = document.querySelector('#model-description');
const modelFeatures = document.querySelector('#model-features');
const modelCount = document.querySelector('#model-count');
const modelLink = document.querySelector('#model-link');
let imageRequest = 0;

function selectModel(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  const data = tab.dataset;
  modelTitle.textContent = data.title;
  modelSubtitle.textContent = data.subtitle;
  modelDescription.textContent = data.description;
  modelCount.textContent = `${data.index} / 05`;
  modelLink.href = data.url;
  modelFeatures.replaceChildren(...data.features.split('|').map(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    return li;
  }));

  const request = ++imageRequest;
  modelImage.classList.add('changing');
  const nextImage = new Image();
  nextImage.onload = () => {
    if (request !== imageRequest) return;
    modelImage.src = data.image;
    modelImage.alt = data.alt;
    requestAnimationFrame(() => modelImage.classList.remove('changing'));
  };
  nextImage.onerror = () => modelImage.classList.remove('changing');
  nextImage.src = data.image;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectModel(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    selectModel(tabs[next]);
  });
});

const steps = [...document.querySelectorAll('.story-step')];
const stageImages = [...document.querySelectorAll('.story-stage > img')];
const stageLabels = ['Binnenmaat', 'Uitvoering', 'Controle', 'Productie'];
const stageNumber = document.querySelector('#stage-number');
const stageLabel = document.querySelector('#stage-label');
let activeStep = -1;
let scrollFrame = 0;

function updateStory() {
  scrollFrame = 0;
  if (!steps.length) return;
  const middle = innerHeight * 0.52;
  let closest = 0;
  let distance = Infinity;
  steps.forEach((step, index) => {
    const bounds = step.getBoundingClientRect();
    const current = Math.abs(bounds.top + bounds.height / 2 - middle);
    if (current < distance) { distance = current; closest = index; }
  });
  if (closest === activeStep) return;
  activeStep = closest;
  steps.forEach((step, index) => step.classList.toggle('active', index === closest));
  stageImages.forEach((image, index) => image.classList.toggle('active', index === closest));
  stageNumber.textContent = `${String(closest + 1).padStart(2, '0')} / 04`;
  stageLabel.textContent = stageLabels[closest];
}

addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateStory); }, { passive: true });
addEventListener('resize', updateStory);
updateStory();
