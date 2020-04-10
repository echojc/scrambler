// cycles a into b
function swapCorners(cube, a, b, buffer) {
  if (buffer == null) buffer = 'C';

  const indexes = {
    'A': [ 0,47,36], 'B': [ 2,11,45], 'C': [ 8,20, 9], 'D': [ 6,38,18],
    'E': [36, 0,47], 'F': [38,18, 6], 'G': [44,27,24], 'H': [42,53,33],
    'I': [18, 6,38], 'J': [20, 9, 8], 'K': [26,29,15], 'L': [24,44,27],
    'M': [ 9, 8,20], 'N': [11,45, 2], 'O': [17,35,51], 'P': [15,26,29],
    'Q': [45, 2,11], 'R': [47,36, 0], 'S': [53,33,42], 'T': [51,17,35],
    'U': [27,24,44], 'V': [29,15,26], 'W': [35,51,17], 'X': [33,42,53],
  };

  for (let i = 0; i < 3; i++) {
    const tmp = cube[indexes[buffer][i]];
    cube[indexes[buffer][i]] = cube[indexes[b][i]];
    cube[indexes[b][i]] = cube[indexes[a][i]];
    cube[indexes[a][i]] = tmp;
  }
  return cube;
}

function chooseRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function otherFacesOnCubie(faces) {
  const groups = {
    'G': ['G','L','U'], 'L': ['G','L','U'], 'U': ['G','L','U'],
    'H': ['H','S','X'], 'S': ['H','S','X'], 'X': ['H','S','X'],
    'T': ['T','O','W'], 'O': ['T','O','W'], 'W': ['T','O','W'],
    'K': ['K','P','V'], 'P': ['K','P','V'], 'V': ['K','P','V'],
    'D': ['D','F','I'], 'F': ['D','F','I'], 'I': ['D','F','I'],
    'B': ['B','N','Q'], 'N': ['B','N','Q'], 'Q': ['B','N','Q'],
    'A': ['A','R','E'], 'R': ['A','R','E'], 'E': ['A','R','E'],
    'C': ['C','M','J'], 'M': ['C','M','J'], 'J': ['C','M','J'],
  };

  return faces.split('').map(f => groups[f]).reduce((a, n) => a.concat(n), []);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// cornerPairs is { pairs: string[], mustInclude: bool }[]
function generateMemo(cornerPairs) {
  // build the memo sequence
  const memo = [];

  // try to pick one from each required cycle
  const requiredCornerPairs = cornerPairs.filter(_ => _.mustInclude);
  for (const requiredPair of requiredCornerPairs) {
    // skip if there are no more pairs in this cycle available
    if (requiredPair.pairs.length == 0) {
      continue;
    }

    const pair = chooseRandom(requiredPair.pairs);
    memo.push(pair);

    // filter out all pairs that move the same cubie
    const dupes = otherFacesOnCubie(pair);
    for (const pair of cornerPairs) {
      pair.pairs = pair.pairs.filter(p => dupes.every(_ => !p.includes(_)));
    }
  }

  // fill out the rest of the memo with whatever is left
  let allPairs = cornerPairs.
                     map(_ => _.pairs).
                     filter(_ => _.length > 0).
                     reduce((a, n) => a.concat(n), []);

  while (allPairs.length > 0) {
    const pair = chooseRandom(allPairs);
    memo.push(pair);

    // filter remaining pairs
    const dupes = otherFacesOnCubie(pair);
    allPairs = allPairs.filter(p => dupes.every(_ => !p.includes(_)));
  }

  shuffle(memo);
  console.log(memo)
  return memo;
}

function generateScrambledCube(cornerMemo) {
  const cube = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'.split('');
  // swap in reverse so cornerMemo becomes the memo for the solve
  for (let i = cornerMemo.length - 1; i >= 0; i--) {
    swapCorners(cube, cornerMemo[i][1], cornerMemo[i][0]);
  }
  return cube.join('');
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

const div = document.getElementById('main');
const cycles = document.getElementById('cycles');
const btn = document.getElementById('gen');
const add = document.getElementById('plus');

div.innerText = 'Initialising generator...';
btn.disabled = true;

console.log('solver: init...');
Cube.asyncInit('./lib/worker.js', function() {
  console.log('solver: inited!');
  div.innerText = 'Ready!';

  btn.onclick = function() {
    const cornerPairs = [];
    cycles.childNodes.forEach(cc => {
      const pairs = {};
      const is = cc.getElementsByTagName('input');
      xp(is[0].value, is[1].value).forEach(pair => pairs[pair] = true);
      cornerPairs.push({ pairs: Object.keys(pairs), mustInclude: is[2].checked });
    });

    const memo = generateMemo(cornerPairs);
    const c = Cube.fromString(generateScrambledCube(memo));
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
