import {
  PromiseStatus,
  ITHenCallback,
  ICatchCallback,
  IConstructorParamFunc,
  IReject,
  IResolve,
} from '../interface';

export default class Mypromuse {
  private status: PromiseStatus

  private value: any

  private resolve: IResolve

  private reject: IReject

  constructor(fuc: IConstructorParamFunc) {
    this.status = PromiseStatus.Pending;
    this.value = null;
    this.resolve = (value) => {
      this.status = PromiseStatus.Fullfiled;
      this.value = value;
    }

    this.reject = (value) => {
      this.status = PromiseStatus.Rejected;
      this.value = value;
    }

    fuc(this.resolve, this.reject);
  }

  then(thenCallback: ITHenCallback) {
    thenCallback(this.value)
  }
  
}