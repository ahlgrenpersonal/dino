// Keep every target connected while other fingers or animations are still using it.
export function renderBubbles(stage, popped, poppedIndex = null) {
  if (!stage.querySelector('.bubble-field')) {
    stage.innerHTML = `<div class="bubble-field">${[0, 1, 2].map(index => `<button class="bubble" data-pop="${index}" aria-label="Pop bubble ${index + 1}"></button>`).join('')}<span class="bubble-status" role="status"></span></div>`;
  }
  for (const button of stage.querySelectorAll('[data-pop]')) {
    const index = Number(button.dataset.pop), isPopped = popped.includes(index);
    button.disabled = isPopped;
    button.classList.toggle('popped', isPopped);
    if (!isPopped) button.classList.remove('burst');
    else if (index === poppedIndex) button.classList.add('burst');
    const text = isPopped ? 'Pop!' : '';
    if (button.textContent !== text) button.textContent = text;
  }
  const remaining = 3 - popped.length;
  stage.querySelector('.bubble-status').textContent = remaining ? `${remaining} ${remaining === 1 ? 'bubble' : 'bubbles'} left` : 'All popped! More bubbles?';
}
