const a = require('./utils.js');

function sleep (fn, par, par2) {
    return new Promise((resolve) => {
      // wait 3s before calling fn(par)
      setTimeout(() => resolve(fn(par, par2)), 1000)
    })
  }

async function myfunc() {
    await Promise.all(u.map(async uu => {
        const x = await sleep(a.getInfo, uu, u);
        console.log(x);
        console.log('\n\n');
    }));
    console.log('test123');
} 



let u = [];
for (let i = 0; i < 8; ++i) {
    u.push({ id: i, name: `${i}123` });
}

function finddd(a) {
    return a.id > 1;
}

a.allocate(u);
myfunc();

// console.log(u);

// console.log(a.isGood(u[0]));
// 
// console.log(u.find(finddd));