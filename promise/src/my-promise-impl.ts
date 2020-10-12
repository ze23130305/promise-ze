import { resolve } from 'path';
import {
  PromiseStatus,
  ITHenCallback,
  ICatchCallback,
  IConstructorParamFunc,
  IReject,
  IResolve,
} from './interface';

export default class MyPromise {
  // 静态方法
  public static all(promiseArray: Array<MyPromise>) {
    return new MyPromise((r, j) => {
      const resArray: any[] = [];
      let successTimes = 0;
      function processRes(index: number, data: any) {
        resArray[index] = data;
        successTimes += 1;
        if(successTimes === promiseArray.length) {
          r(resArray);
          console.log('r(resArray)', resArray)
        }
      }
      for (let i = 0; i < promiseArray.length; i++) {
        const promise = promiseArray[i];
        promise.then(data => {
          processRes(i, data);
        }, err=> {
          j(err)
        })
      }
    });
  }

  private status: PromiseStatus;

  private value: any;


  private thenCallbackQueue: Array<ITHenCallback>;

  private catchCallbackQueue: Array<ICatchCallback>;

  private resovle: IResolve;

  private reject: IReject;

  constructor(func: IConstructorParamFunc) {

    this.status = PromiseStatus.Pending;
    this.value = null;
    this.thenCallbackQueue = [];
    this.catchCallbackQueue = [];
    // resovle
    this.resovle = (res: any) => {
      if (this.status !== PromiseStatus.Pending) return;

      // 如果这参数传进来也是一个promise
      if ((typeof res === 'object' || typeof res === 'function') && res.then){
        this.promiseResolutionProcedure(this, res, this.resovle, this.reject)
        return;
      }
      // 用timeout 0 模拟微任务
      setTimeout(() => {
        this.value = res;
        this.status = PromiseStatus.Fullfiled;
        const resovleThen = this.thenCallbackQueue.pop();
        if (resovleThen && resovleThen instanceof Function) {
          resovleThen();
        }
      }, 0);
    }

    // reject
    this.reject = (res: any) => {
      
      this.value = res;
      this.status = PromiseStatus.Rejected;
      const rejectCatch = this.catchCallbackQueue.pop();
      if (rejectCatch && rejectCatch instanceof Function) {
        rejectCatch(res);
      }

      this.status = PromiseStatus.Rejected;

    }


    func(this.resovle, this.reject);
  }

  then(thenCallback?: ITHenCallback, rejectCallback?: ICatchCallback) {
    const callback = thenCallback ?? (v => v);
    const promise2 = new MyPromise((r, j) => {
      this.thenCallbackQueue.push(() => {
        const returnValue = callback(this.value);
        this.promiseResolutionProcedure(promise2, returnValue, r, j)
      })
    });
    return promise2;
  }

  catch(catchCallback: ICatchCallback) {
    this.catchCallbackQueue.push(catchCallback);

  }

  public getCurrentValue() { return this.value }


  public getCurrentStatus() { return this.status }

  // 处理过程
  private promiseResolutionProcedure(promise2: MyPromise, returnValue: any, r: IResolve, j: IReject) {
    if (promise2 === returnValue) {
      throw new Error('循环引用promise')
    }
    // 如果是promise
    if (returnValue instanceof MyPromise) {
      const returnPromise = returnValue as MyPromise;
      if (returnPromise.getCurrentStatus() === PromiseStatus.Pending) {
        returnPromise.then(y => {
          this.promiseResolutionProcedure(promise2, y, r, j)
        }, j)
      } else {
        returnPromise.getCurrentStatus() === PromiseStatus.Fullfiled && r(returnPromise.getCurrentValue())
        returnPromise.getCurrentStatus() === PromiseStatus.Rejected && j(returnPromise.getCurrentValue())

      }
    }

    // 如果then返回的是一thenable
    if (
      returnValue &&
      returnValue.then &&
      (typeof returnValue === 'object' || typeof returnValue === 'function') &&
      (typeof returnValue.then === 'function')
    ) {
      returnValue.then((y: any) => {
        this.promiseResolutionProcedure(promise2, y, r, j)
      }, j)
    } else {
      r(returnValue);
    }
  }

}
