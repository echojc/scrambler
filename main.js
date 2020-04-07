const cubies = {
  'A': [0,47,36],
  'B': [2,11,45],
  'C': [8,20,9],
  'D': [6,38,18],
  'E': [36,0,47],
  'F': [38,18,6],
  'G': [44,27,24],
  'H': [42,53,33],
  'I': [18,6,38],
  'J': [20,9,8],
  'K': [26,29,15],
  'L': [24,44,27],
  'M': [9,8,20],
  'N': [11,45,2],
  'O': [17,35,51],
  'P': [15,26,29],
  'Q': [45,2,11],
  'R': [47,36,0],
  'S': [53,33,42],
  'T': [51,17,35],
  'U': [27,24,44],
  'V': [29,15,26],
  'W': [35,51,17],
  'X': [33,42,53],
};

const groups = [
  ['G','L','U'],
  ['H','S','X'],
  ['T','O','W'],
  ['K','P','V'],
  ['D','F','I'],
  ['B','N','Q'],
  ['A','R','E'],
  ['C','M','J'],
];

function gen(cycles) {

  // build the memo sequence
  const chosen = [];
  while (cycles.length > 0) {
    const cycle = cycles[Math.floor(Math.random() * cycles.length)];
    chosen.push(cycle);
    const dupes = groups.
                    filter(_ => _.some(_ => cycle.includes(_))).
                    reduce((a, n) => a.concat(n), []);

    cycles = cycles.filter(_ => !dupes.includes(_[0]) && !dupes.includes(_[1]));
  }

  console.log(chosen)

  const cube = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'.split('');

  // execute the swaps in reverse
  for (let i = chosen.length - 1; i >= 0; i--) {
    const buf = cubies['C'];
    const a = cubies[chosen[i][1]]; // reverse
    const b = cubies[chosen[i][0]];

    const tmp = [cube[buf[0]], cube[buf[1]], cube[buf[2]]];
    cube[buf[0]] = cube[b[0]];
    cube[buf[1]] = cube[b[1]];
    cube[buf[2]] = cube[b[2]];
    cube[b[0]] = cube[a[0]];
    cube[b[1]] = cube[a[1]];
    cube[b[2]] = cube[a[2]];
    cube[a[0]] = tmp[0];
    cube[a[1]] = tmp[1];
    cube[a[2]] = tmp[2];
  }

  return cube.reduce((a, n) => a + n, '');
}

function xp(xs, ys) {
  const out = {};
  for (let x of xs.toUpperCase()) {
    for (let y of ys.toUpperCase()) {
      if (x === y) continue;
      out[x + y] = true;
      out[y + x] = true;
    }
  }
  return Object.keys(out);
}

function sq(xs) {
  return xp(xs, xs);
}

//function scramble(cycles) {
//  const solve = Cube.fromString(gen(cycles.reduce((a, n) => a.concat(n), []))).solve();
//  const scramble = Cube.inverse(solve);
//  return scramble;
//}

const div = document.getElementById('main');
const cycles = document.getElementById('cycles');
const btn = document.getElementById('gen');
const add = document.getElementById('plus');

div.innerText = 'Initialising generator...';
btn.disabled = true;

console.log('solver: init...');
//Cube.initSolver();
Cube.asyncInit('./lib/worker.js', function() {
  console.log('solver: inited!');
  div.innerText = 'Ready!';

  btn.onclick = function() {
    const cs = {};
    cycles.childNodes.forEach(cc => {
      const is = cc.getElementsByTagName('input');
      xp(is[0].value, is[1].value).forEach(cycle => cs[cycle] = true);
    });
    const c = Cube.fromString(gen(Object.keys(cs)));
    Cube._asyncSolve(c, function(alg) {
      div.innerText = Cube.inverse(alg);
    });
  };

  btn.disabled = false;
});

function addCycle(a, b) {
  const nn = document.getElementById('template').children[0].cloneNode(true);
  nn.getElementsByTagName('button')[0].onclick = function() {
    cycles.removeChild(nn);
  };
  nn.childNodes.forEach(_ => _.disabled = false);
  if (a) {
    const is = nn.getElementsByTagName('input');
    is[0].value = a;
    if (b) {
      is[1].value = b;
    }
  }
  cycles.appendChild(nn);
};

add.onclick = () => addCycle();

addCycle('hlpt', 'hlpt');
