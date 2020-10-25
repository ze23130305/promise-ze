import {
  PromiseStatus,
  ITHenCallback,
  ICatchCallback,
  IConstructorParamFunc,
  IReject,
  IResolve,
} from '../interface';

export default class Mypromise {
  private status: PromiseStatus

  private value: any

  private reason: any

  private resolve: IResolve

  private reject: IReject

  private fulfilledQueue: Array<ITHenCallback> = []

  private rejectedQueue: Array<ICatchCallback> = []

  constructor(fuc: IConstructorParamFunc) {
    this.status = PromiseStatus.Pending;
    this.value = null;
    this.resolve = (value) => {
      setTimeout(() => {
        this.status = PromiseStatus.Fullfiled;
        this.value = value;

        while (this.fulfilledQueue.length) {
          const fulfilleFn = this.fulfilledQueue.shift();
          fulfilleFn && fulfilleFn(value)
        }
      })
    }

    this.reject = (value) => {
      setTimeout(() => {
        this.status = PromiseStatus.Rejected;
        this.reason = value;
  
        while (this.fulfilledQueue.length) {
          const rejectedFn = this.rejectedQueue.shift();
          rejectedFn && rejectedFn(value)
        }
      })
    }

    try {
      fuc(this.resolve, this.reject);
    } catch (err) {
      this.status = PromiseStatus.Rejected;
      this.reject(err)
    }
  }

  private handlePromise: any = (promise1: Mypromise, x: any, resolve: IResolve, reject: IReject) => {
    if (x === promise1) {
      throw new Error('循环调用');
    }
    if (x instanceof Mypromise) {
      const status: PromiseStatus = x.status;
      const value = x.value;
      const reason = x.reason;
      const fulfilledQueue = x.fulfilledQueue;
      const rejectedQueue = x.rejectedQueue;
      switch (status) {
        case PromiseStatus.Fullfiled:
          resolve(value)
          break;
        case PromiseStatus.Rejected:
          reject(reason)
          break;
        default:
          // todo?
          // fulfilledQueue.push(() => {
          //   this.handlePromise(promise1, x, resolve, reject)
          // })
          // rejectedQueue.push(() => {
          //   this.handlePromise(promise1, x, resolve, reject)
          // })
          // x.then((y) => this.handlePromise(promise1, y, resolve, reject), );
          break;
      }
    }

    if (typeof x === 'object' || typeof x === 'function') {
      try{
        const then = x.then;
        if (typeof then === 'function') {
          then.call(x, (y: any) => resolve(y), (e: any) => reject(e))
        }
      } catch (err) {
        reject(err)
      }
    }else {
      resolve(x)
    }
  }

  then(onFulfilled: ITHenCallback = (x) => x, onRejected: ICatchCallback = err => { throw err }): any {
    const promise1 = new Mypromise((r, j) => {
      switch (this.status) {
        case PromiseStatus.Fullfiled:
          this.handlePromise(promise1, onFulfilled(this.value), r, j);
          break;
        case PromiseStatus.Rejected:
          this.handlePromise(promise1, onRejected(this.reason), r, j);
          break;
        default:
          this.fulfilledQueue.push(() => {
            this.handlePromise(promise1, onFulfilled(this.value), r, j);
          })
          this.rejectedQueue.push(() => {
            this.handlePromise(promise1, onRejected(this.reason), r, j);
          })
          break;
      }
    })
    return promise1;
  }

  public static all(promises: Array<Mypromise>): Mypromise {
    const len = promises.length;
    const res = new Array(len)
    let num:number = 0;
    return new Mypromise((r, j) => {
      promises.forEach((curPromise, i) => {
        curPromise.then(curRes => {
          res[i] = curRes;
          if (++num === len) {
            r(res);
          }
        })
      })
    })
  }
}
