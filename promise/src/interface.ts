import { resolve } from "path";

// Promise的三种状态
export enum PromiseStatus {
  Pending = 'Pending',
  Fullfiled = 'Fullfiled',
  Rejected = 'Rejected',
}


export type ITHenCallback = (res?: any) => any;

export type ICatchCallback = (res: any) => void;

export type IResolve = (res?:any) => void;

export type IReject = (res?:any) => void;


export type IConstructorParamFunc = (resolve: IResolve, reject: IReject) => void;