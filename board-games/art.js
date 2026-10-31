// Original vector character art. Every expression shares the same friendly silhouette.
export const expressions = ['hello','curious','think','squint','wobble','gasp','focus','silly-tongue','silly-squish','silly-cross','support','draw'];
export function avatarSVG(face = 'hello') {
  const silly = face.startsWith('silly');
  const eyes = {
    hello: '<ellipse cx="108" cy="128" rx="7" ry="12"/><ellipse cx="162" cy="128" rx="7" ry="12"/>',
    curious: '<ellipse cx="108" cy="124" rx="8" ry="13"/><ellipse cx="163" cy="132" rx="6" ry="9"/>',
    think: '<circle cx="113" cy="125" r="7"/><circle cx="166" cy="125" r="7"/>',
    squint: '<path d="m98 129 17-3m38 0 17 3"/>',
    wobble: '<ellipse cx="107" cy="124" rx="6" ry="12"/><ellipse cx="165" cy="133" rx="7" ry="10"/>',
    gasp: '<circle cx="108" cy="126" r="9"/><circle cx="163" cy="126" r="9"/>',
    focus: '<path d="m99 124 17 6m38 0 17-6"/>',
    'silly-tongue': '<path d="m98 129q10-15 20 0"/><circle cx="161" cy="127" r="8"/>',
    'silly-squish': '<path d="m98 120 14 8-14 8m73-16-14 8 14 8"/>',
    'silly-cross': '<circle cx="116" cy="129" r="8"/><circle cx="153" cy="129" r="8"/>',
    support: '<path d="m98 130q10-13 20 0m34 0q10-13 20 0"/>',
    draw: '<path d="m98 129q10-15 20 0m34 0q10-15 20 0"/>'
  };
  const sillyMouths = {
    'silly-tongue':'<path d="M117 151q19 27 38 0Z" fill="#343657"/><path d="M131 163q16-8 15 10t-15-1Z" fill="#f396ac" stroke="none"/>',
    'silly-squish':'<path d="m116 154q9 12 18 0t20 0" fill="none"/><ellipse cx="90" cy="149" rx="17" ry="12" fill="#efa6ac" stroke="none"/><ellipse cx="182" cy="149" rx="17" ry="12" fill="#efa6ac" stroke="none"/>',
    'silly-cross':'<path d="M116 151q22 4 41-3-1 33-22 28-16-3-19-25Z" fill="#343657"/><path d="m128 154 12-1-1 11-10-1Z" fill="#fff9e8" stroke="none"/>'
  };
  const mouth = silly ? sillyMouths[face] : face === 'gasp' ? '<ellipse cx="135" cy="157" rx="10" ry="13" fill="#343657"/>' : face === 'focus' ? '<ellipse cx="135" cy="157" rx="6" ry="8" fill="none"/>' : face === 'think' ? '<path d="m126 156q10-5 19 0" fill="none"/>' : face === 'wobble' ? '<path d="m118 153q8 14 17 0t18 0" fill="none"/>' : '<path d="M118 150q17 21 35 0" fill="none"/>';
  return `<svg viewBox="0 0 280 270" role="img" aria-label="Noodle making a ${face.replaceAll('-', ' ')} face"><defs><linearGradient id="body" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#8cdec6"/><stop offset="1" stop-color="#48baa5"/></linearGradient></defs>
  <ellipse cx="141" cy="244" rx="85" ry="10" fill="#dcd9c2" opacity=".5"/><g class="noodle-body ${silly ? 'goofy' : ''}">
  <path d="M78 133Q31 113 35 149q7 22 42 20m124-36q48-20 44 16-7 22-42 20" fill="#60c8ae" stroke="#369e8e" stroke-width="3"/>
  <path d="m92 212-8 26q16 11 35 0l3-23m34 0 3 23q20 10 35-1l-9-26" fill="#47b39c" stroke="#369e8e" stroke-width="3"/>
  <path d="M65 166Q51 83 94 70q-10-28 5-33 16-5 25 24 19-12 37 2 16-27 29-19 13 10-3 32 33 18 29 88-3 64-75 65-70 2-76-63Z" fill="url(#body)" stroke="#369e8e" stroke-width="3"/>
  <path d="m121 69q-6-30 10-35-1 14 9 18 4-25 18-24-8 24-1 35" fill="#f9bc5a" stroke="#e9a243" stroke-width="2"/>
  <ellipse cx="139" cy="193" rx="43" ry="25" fill="#a4e6cc" opacity=".7"/><ellipse cx="87" cy="150" rx="14" ry="9" fill="#efa6ac" opacity=".75"/><ellipse cx="185" cy="150" rx="14" ry="9" fill="#efa6ac" opacity=".75"/>
  <g fill="#343657" stroke="#343657" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${eyes[face] || eyes.hello}${mouth}</g>
  <g fill="#3eaa99" opacity=".6"><circle cx="78" cy="177" r="5"/><circle cx="88" cy="190" r="3"/><circle cx="197" cy="175" r="4"/></g>
  ${face === 'think' ? '<path d="m190 171 18-20q11-9 16 0t-13 23" fill="#69cdb3" stroke="#369e8e" stroke-width="3"/>' : ''}
  </g>${silly ? '<g fill="#f4b750"><path d="m34 64 4 9 10 2-8 6 2 10-9-5-8 5 2-10-7-7 10-1Z"/><path d="m232 89 3 7 8 1-6 6 1 8-7-4-7 4 2-8-6-6 8-1Z"/></g>' : ''}</svg>`;
}
export function pieceSVG(piece) {
  return piece === 'X' ? '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="m29 27 44 46m0-46L29 73" stroke="#c9634c" stroke-width="20" stroke-linecap="round"/><path d="m28 24 44 46m0-46L28 70" stroke="#f38a6c" stroke-width="17" stroke-linecap="round"/><path d="m29 25 14 14" stroke="#ffb196" stroke-width="4" stroke-linecap="round"/></svg>' : '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="51" cy="53" r="27" fill="none" stroke="#3c9e92" stroke-width="19"/><circle cx="50" cy="49" r="27" fill="none" stroke="#68c5b6" stroke-width="17"/><path d="M30 39q4-10 14-12" fill="none" stroke="#a0e5d6" stroke-width="4" stroke-linecap="round"/></svg>';
}
