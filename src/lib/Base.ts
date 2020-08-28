import { IBase } from './IBase'

export class Base implements IBase {
  public _id: string = ObjectId.stringObjectId()
  public _class: string

  constructor(obj: any = {}) {
    if (obj._id) {
      this._id = obj._id
    }
    if (obj._class) {
      this._class = obj._class
    }
  }

  public static async check(
    target: any,
    isCompleteObj: boolean = true,
    path: string = ''
  ): Promise<boolean> {
    return true
  }
  public static create(target: any, path: string = ''): Promise<Base> {
    return Base.check(target, true, path).then(() => {
      return new Base(target)
    })
  }

  public static stringObjectId(): string {
    var _increment = Math.floor(Math.random() * 16777216)
    var _pid = Math.floor(Math.random() * 65536)
    var _machine = Math.floor(Math.random() * 16777216)
    var _timestamp = Math.floor(new Date().valueOf() / 1000)

    if (_increment > 0xffffff) {
      _increment = 0
    }
    var timestamp = _timestamp.toString(16)
    var machine = _machine.toString(16)
    var pid = _pid.toString(16)
    var increment = _increment.toString(16)
    return (
      '00000000'.substr(0, 8 - timestamp.length) +
      timestamp +
      '000000'.substr(0, 6 - machine.length) +
      machine +
      '0000'.substr(0, 4 - pid.length) +
      pid +
      '000000'.substr(0, 6 - increment.length) +
      increment
    )
  }
   
}

export class ObjectId {
  constructor() {}

  static stringObjectId(): string {
    var _increment = Math.floor(Math.random() * 16777216)
    var _pid = Math.floor(Math.random() * 65536)
    var _machine = Math.floor(Math.random() * 16777216)
    var _timestamp = Math.floor(new Date().valueOf() / 1000)

    if (_increment > 0xffffff) {
      _increment = 0
    }
    var timestamp = _timestamp.toString(16)
    var machine = _machine.toString(16)
    var pid = _pid.toString(16)
    var increment = _increment.toString(16)
    return (
      '00000000'.substr(0, 8 - timestamp.length) +
      timestamp +
      '000000'.substr(0, 6 - machine.length) +
      machine +
      '0000'.substr(0, 4 - pid.length) +
      pid +
      '000000'.substr(0, 6 - increment.length) +
      increment
    )
  }
}
