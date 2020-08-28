import {IHttpResult} from "./IHttpResult" ;

export class UtilsService {

    // a mettre dans la lib utils
	public static resultToObjWEmptyError<T>(message: string): {(dataResult: IHttpResult<T>): Promise<T>;} {
		return (dataResult: IHttpResult<T>): Promise<T> => {
			if (dataResult.code == 200) {
				if (dataResult.response && dataResult.response.length > 0) {
					return Promise.resolve(dataResult.response[0]);
				} else {
					throw new Error(`${message} : empty response`);
				}
			} else {
				throw new Error(`${message} : ${dataResult.message}`);
			}
		}
	}

	public static resultToObj<T>(message: string):{(dataResult: IHttpResult<T>): Promise<T>;} {
		return (dataResult: IHttpResult<T>): Promise<T> => {
			if (dataResult.code == 200) {
				if (dataResult.response && dataResult.response.length > 0) {
					return Promise.resolve(dataResult.response[0]);
				} else {
					return Promise.resolve(null);
				}
			} else {
				throw new Error(`${message} : ${dataResult.message}`);
			}
		}
	}

	public static resultToArr<T>(message: string):{(dataResult: IHttpResult<T>): Promise<T[]>;} {
		return (dataResult: IHttpResult<T>): Promise<T[]> => {
			if (dataResult.code == 200) {
				if (dataResult.response && dataResult.response.length > 0) {
					return Promise.resolve(dataResult.response);
				} else {
					return Promise.resolve([]);
				}
			} else {
				throw new Error(`${message} : ${dataResult.message}`);
			}
		}
	}

	public static resultToArrWEmptyError<T>(message: string):{(dataResult: IHttpResult<T>): Promise<T[]>;}  {
		return (dataResult: IHttpResult<T>): Promise<T[]> => {
			if (dataResult.code == 200) {
				if (dataResult.response && dataResult.response.length > 0) {
					return Promise.resolve(dataResult.response);
				} else {
					throw new Error(`${message} : empty response`);
				}
			} else {
				throw new Error(`${message} : ${dataResult.message}`);
			}
		}
	}
}