import MyPromise, {
  PromiseStatus
} from '../src';

describe('构造Promise', () => {
  const myPromise = new MyPromise((r, j) => {});

  test('构造一个Promise,是一个对象 ', () => {
    const isObject = typeof myPromise === "object";
    expect(isObject).toBeTruthy();
  });

  test('构造一个Promise,是一个有then方法的thenable对象 ', () => {
    const thenMethed = myPromise['then'];
    expect(thenMethed).not.toBeUndefined();
    const isThenFunction = thenMethed instanceof Function;
    expect(isThenFunction).toBeTruthy();
  });
});

describe('功能用例', () => {

  const delayTime = 1000;
  const testGetValue1 = 666;
  const testGetValue2 = 'jerk';
  const testGetValue3 = 'j8';
  const testGetValue4 = true;


  test('构造promise,在模拟的异步操作之后可以拿到值 ', done => {
    const myPromise = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
      }, delayTime);
    });
    myPromise.then((res) => {
      expect(res).toBe(testGetValue1)
      done();
    })
  });

  test('构造promise,在同步操作之后可以拿到值 ', done => {
    const myPromise = new MyPromise((resovle, reject) => {
      resovle(testGetValue1);
    });
    // 这里需要模拟then的回调函数是异步执行的，用timeout 0 模拟微任务
    myPromise.then((res) => {
      expect(res).toBe(testGetValue1)
      done();
    })
  });


  test('状态正确: resovle对应Fullfiled, reject对应Rejected ', done => {
    const myPromiseFullfill = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
      }, delayTime);
    });

    const myPromiseRejected = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        reject(new Error('Rejected a Error'));
      }, delayTime);
    });
    // 初始应该都是pending
    expect(myPromiseFullfill.getCurrentStatus()).toBe(PromiseStatus.Pending);
    expect(myPromiseRejected.getCurrentStatus()).toBe(PromiseStatus.Pending);

    // 对应的then和catch都应该是正确的状态
    myPromiseFullfill.then(() => {
      expect(myPromiseFullfill.getCurrentStatus()).toBe(PromiseStatus.Fullfiled);
    })
    myPromiseRejected.catch(() => {
      expect(myPromiseRejected.getCurrentStatus()).toBe(PromiseStatus.Rejected);
    })

    // 结束后应为正确的状态
    setTimeout(() => {
      expect(myPromiseFullfill.getCurrentStatus()).toBe(PromiseStatus.Fullfiled);
      expect(myPromiseRejected.getCurrentStatus()).toBe(PromiseStatus.Rejected);
      done();
    }, delayTime + 1000);
  })

  test('resolve只能有一次', done => {
    const myPromise = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
        resovle(testGetValue2); // more resovle 没用
      }, delayTime);
    });
    myPromise.then((res) => {
      expect(res).toBe(testGetValue1)
      done();
    })
  });

  test('promise可以链式调用 ', done => {

    const myPromise = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
      }, delayTime);
    });

    const thenCb1 = res => {
      expect(res).toBe(testGetValue1);
      return testGetValue2
    };
    const thenCb2 = res => {
      expect(res).toBe(testGetValue2);
      return testGetValue3
    };
    const thenCb3 = res => {
      expect(res).toBe(testGetValue3);
      return testGetValue4;
    }

    const thenCb4 = res => {
      expect(res).toBe(testGetValue4);
      done();
    };

    myPromise
      .then(thenCb1)
      .then(thenCb2)
      .then(thenCb3)
      .then(thenCb4)
  })

  test('promise支持空的then函数', done => {
    const myPromise = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
      }, delayTime);
    });

    myPromise.then(res => {
        expect(res).toBe(testGetValue1);
        return testGetValue2
      })
      // 空then 将值透传
      .then()
      .then(res => {
        expect(res).toBe(testGetValue2);
        return testGetValue3;
      }).then(res => {
        expect(res).toBe(testGetValue3);
        return testGetValue4;
      }).then(res => {
        expect(res).toBe(testGetValue4);
      });

    setTimeout(() => {
      done()
    }, delayTime + 1000)

  });

  test('then方法可以return thenable对象', done => {

    const thenableTest = {
      then(resovle, reject) {
        resovle(testGetValue2)
      }
    };
    const myPromise = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
      }, delayTime);
    });
    myPromise.then(res => {
      return thenableTest;
    }).then(res => {
      expect(res).toBe(testGetValue2);
      done();
    })
  });


  test('then方法可以return promise对象', done => {

    const myPromise = new MyPromise((resovle, reject) => {
      setTimeout(() => {
        resovle(testGetValue1);
      }, delayTime);
    });
    myPromise.then(res => {
      return new MyPromise((resovle, reject) => {
        resovle(testGetValue2 + res)
      });
    }).then(res => {
      expect(res).toBe(testGetValue2 + testGetValue1);
      done();
    })
  });

  test('支持resovle一个 promise对象', done => {

    const myPromise = new MyPromise((resovle, reject) => {
      resovle(new MyPromise((r, j) => {
        r(testGetValue4)
      }))
    });
    myPromise.then(res => {
      expect(res).toBe(testGetValue4);
      done();
    })
  });

});


describe('静态方法', () => {
  const val1 = 100;
  const val2 = 20;
  test('静态方法 all', done => {
    const prom1 = new MyPromise((resovle) => {
      setTimeout(() => {
        resovle(val1)
      }, 0)
    });
    const prom2 = new MyPromise((resovle) => {
      setTimeout(() => {
        resovle(val2)
      }, 0)
    });
    MyPromise.all([prom1, prom2]).then(res => {
      expect(res[0]).toBe(val1);
      expect(res[1]).toBe(val2);
      done();
    })
    
    // setTimeout(() => done(), 1000);
  });
})