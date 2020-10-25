import MyPromise from './index';

const myPromise = new MyPromise((resovle, reject) => {
  // setTimeout(() => {
    resovle(1);
  // }, 3000);
});

myPromise.then(res => {
  console.log('get res ', res)
  return 2
})
// .then()
.then((res: any) => {
  console.log('get res ', res)
  return new MyPromise((resolve => resolve(777777)))
}, (x: any) => console.log(x)).then((res: any) => {
  console.log('get res ', res)
  return 4
}).then((res: any) => {
  console.log('get res ', res)
  return 5
})


// const thenableTest = {
//   then(resovle: any, reject: any) {
//     resovle(100)
//   }
// };

// const myPromise = new MyPromise((resovle, reject) => {
//   setTimeout(() => {
//     resovle(1);
//   }, 1000);
// });

// myPromise.then(res => {
//   return thenableTest;
// }).then(res => {
//   console.log('end...get...', res)

// })



// const val1 = 100;
// const val2 = 'jerk';
// const prom1 = new MyPromise((resovle) => {
//   setTimeout(() => {
//     resovle(val1)
//   }, 1000)
// });
// const prom2 = new MyPromise((resovle) => {
//   setTimeout(() => {
//     resovle(val2)
//   }, 1500)
// });

// MyPromise.all([prom1, prom2]).then(res => {
//   console.log('res， ', res)

// })

// console.log('start...')
// console.log('start...')

