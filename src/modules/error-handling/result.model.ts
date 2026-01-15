interface IResult<TValue, TError> {
  /**
   * Used to check if a `Result` is an `OK`
   *
   * @returns `true` if the result is an `OK` variant of Result
   */
  isSuccess(): this is Success<TValue, TError>;

  /**
   * Used to check if a `Result` is an `Err`
   *
   * @returns `true` if the result is an `Err` variant of Result
   */
  isFailure(): this is Failure<TValue, TError>;
}

export class Success<TValue, TError> implements IResult<TValue, TError> {
  readonly value: TValue;

  constructor(value: TValue) {
    this.value = value;
  }

  isSuccess(): this is Success<TValue, TError> {
    return true;
  }

  isFailure(): this is Failure<TValue, TError> {
    return !this.isSuccess();
  }
}

export class Failure<TValue, TError> implements IResult<TValue, TError> {
  readonly error: TError;

  constructor(error: TError) {
    this.error = error;
  }

  isSuccess(): this is Success<TValue, TError> {
    return false;
  }

  isFailure(): this is Failure<TValue, TError> {
    return !this.isSuccess();
  }
}

/**
 * 📢 The actual Result type. Public for consumers
 */
export type Result<TValue, TError> =
  | Success<TValue, TError>
  | Failure<TValue, TError>;
