import isEqual from 'lodash/isEqual';

export const isSkip = (op) => typeof op === 'number' && op > 0;
export const isInsert = (op) => typeof op === 'string';
export const isDelete = (op) => typeof op === 'number' && op < 0;

class OperationWrapper {
  constructor(ops = []) {
    this.ops = ops;
  }

  getBaseLength() {
    return this.ops.reduce((result, op) => {
      if (isSkip(op)) {
        return result + op;
      } else if (isInsert(op)) {
        return result;
      }
      return result - op;
    }, 0);
  }

  getTargetLength() {
    return this.ops.reduce((result, op) => {
      if (isSkip(op)) {
        return result + op;
      } else if (isInsert(op)) {
        return result + op.length;
      }
      return result;
    }, 0);
  }

  skip(n) {
    if (n === 0) { return this; }
    if (isSkip(this.ops[this.ops.length - 1])) { // The last op is a skip op => we can merge
      this.ops[this.ops.length - 1] += n;
    } else {
      this.ops.push(n);
    }
    return this;
  }

  insert(string) {
    if (string === '') { return this; }
    const { ops } = this;
    if (isInsert(ops[ops.length - 1])) { // Merge insert op.
      ops[ops.length - 1] += string;
    } else if (isDelete(ops[ops.length - 1])) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (isInsert(ops[ops.length - 2])) {
        ops[ops.length - 2] += string;
      } else {
        ops[ops.length] = ops[ops.length - 1];
        ops[ops.length - 2] = string;
      }
    } else {
      ops.push(string);
    }
    return this;
  }

  delete(n) {
    if (n === 0) { return this; }
    if (n > 0) { n = -n; }
    if (isDelete(this.ops[this.ops.length - 1])) {
      this.ops[this.ops.length - 1] += n;
    } else {
      this.ops.push(n);
    }
    return this;
  }

  equals(other) {
    if (this.getBaseLength() !== other.getBaseLength()) { return false; }
    if (this.getTargetLength() !== other.getTargetLength()) { return false; }
    if (this.ops.length !== other.ops.length) { return false; }
    return isEqual(this.ops, other.ops);
  }

  // Apply an operation to a string, returning a new string. Throws an error if
  // there's a mismatch between the input string and the operation.
  apply(baseString) {
    if (baseString.length !== this.getBaseLength()) {
      throw new Error('The operation\'s base length must be equal to the string\'s length.');
    }
    let strIndex = 0;
    return this.ops.reduce((result, op) => {
      if (isSkip(op)) {
        result += baseString.slice(strIndex, strIndex + op);
        strIndex += op;
      } else if (isInsert(op)) {
        result += op;
      } else {
        strIndex += -op;
      }
      return result;
    }, '');
  }

  // Compose merges two consecutive operations into one operation, that
  // preserves the changes of both. Or, in other words, for each input string S
  // and a pair of consecutive operations A and B,
  // apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
  compose(opW2) {
    const opW1 = this;
    if (opW1.getTargetLength() !== opW2.getBaseLength()) {
      throw new Error('The base length of the second operation has to be ' +
        'the target length of the first operation');
    }

    const opW = new OperationWrapper(); // the combined operation
    const { ops: ops1 } = opW1;
    const { ops: ops2 } = opW2; // for fast access
    let i1 = 0;
    let i2 = 0; // current index into ops1 respectively ops2
    let op1 = ops1[i1++];
    let op2 = ops2[i2++]; // current ops
    // end condition: both ops1 and ops2 have been processed
    while (typeof op1 !== 'undefined' || typeof op2 !== 'undefined') {
      if (isDelete(op1)) {
        opW.delete(op1);
        op1 = ops1[i1++];
        continue; // eslint-disable-line
      }
      if (isInsert(op2)) {
        opW.insert(op2);
        op2 = ops2[i2++];
        continue; // eslint-disable-line
      }

      if (typeof op1 === 'undefined') {
        throw new Error('Cannot compose operations: first operation is too short.');
      }
      if (typeof op2 === 'undefined') {
        throw new Error('Cannot compose operations: first operation is too long.');
      }

      if (isSkip(op1) && isSkip(op2)) {
        if (op1 > op2) {
          opW.skip(op2);
          op1 -= op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          opW.skip(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          opW.skip(op1);
          op2 -= op1;
          op1 = ops1[i1++];
        }
      } else if (isInsert(op1) && isDelete(op2)) {
        if (op1.length > -op2) {
          op1 = op1.slice(-op2);
          op2 = ops2[i2++];
        } else if (op1.length === -op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 += op1.length;
          op1 = ops1[i1++];
        }
      } else if (isInsert(op1) && isSkip(op2)) {
        if (op1.length > op2) {
          opW.insert(op1.slice(0, op2));
          op1 = op1.slice(op2);
          op2 = ops2[i2++];
        } else if (op1.length === op2) {
          opW.insert(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          opW.insert(op1);
          op2 -= op1.length;
          op1 = ops1[i1++];
        }
      } else if (isSkip(op1) && isDelete(op2)) {
        if (op1 > -op2) {
          opW.delete(op2);
          op1 += op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          opW.delete(op2);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          opW.delete(op1);
          op2 += op1;
          op1 = ops1[i1++];
        }
      } else {
        throw new Error(`This shouldn't happen:
          op1: ${JSON.stringify(op1)},
          op2: ${JSON.stringify(op2)}`);
      }
    }
    return opW;
  }

  // Transform takes two operations A and B that happened concurrently and
  // produces two operations A' and B' (in an array) such that
  // `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
  // heart of OT.
  static transform(opW1, opW2) {
    if (opW1.getBaseLength() !== opW2.getBaseLength()) {
      throw new Error('Both operations have to have the same base length');
    }

    const opW1Prime = new OperationWrapper();
    const opW2Prime = new OperationWrapper();
    const { ops: ops1 } = opW1;
    const { ops: ops2 } = opW2;
    let i1 = 0;
    let i2 = 0;
    let op1 = ops1[i1++];
    let op2 = ops2[i2++];
    // end condition: both ops1 and ops2 have been processed
    while (typeof op1 !== 'undefined' || typeof op2 !== 'undefined') {
      // At every iteration of the loop, the imaginary cursor that both
      // opW1 and opW2 have that operates on the input string must
      // have the same position in the input string.
      //
      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding Prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (isInsert(op1)) {
        opW1Prime.insert(op1);
        opW2Prime.skip(op1.length);
        op1 = ops1[i1++];
        continue; // eslint-disable-line
      }
      if (isInsert(op2)) {
        opW1Prime.skip(op2.length);
        opW2Prime.insert(op2);
        op2 = ops2[i2++];
        continue; // eslint-disable-line
      }

      if (typeof op1 === 'undefined') {
        throw new Error('Cannot compose operations: first operation is too short.');
      }
      if (typeof op2 === 'undefined') {
        throw new Error('Cannot compose operations: first operation is too long.');
      }

      let minl;
      if (isSkip(op1) && isSkip(op2)) {
        // Simple case: skip/skip
        if (op1 > op2) {
          minl = op2;
          op1 -= op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 -= op1;
          op1 = ops1[i1++];
        }
        opW1Prime.skip(minl);
        opW2Prime.skip(minl);
      } else if (isDelete(op1) && isDelete(op2)) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (-op1 > -op2) {
          op1 -= op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 -= op1;
          op1 = ops1[i1++];
        }
      // next two cases: delete/skip and skip/delete
      } else if (isDelete(op1) && isSkip(op2)) {
        if (-op1 > op2) {
          minl = op2;
          op1 += op2;
          op2 = ops2[i2++];
        } else if (-op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = -op1;
          op2 += op1;
          op1 = ops1[i1++];
        }
        opW1Prime.delete(minl);
      } else if (isSkip(op1) && isDelete(op2)) {
        if (op1 > -op2) {
          minl = -op2;
          op1 += op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          minl = op1;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 += op1;
          op1 = ops1[i1++];
        }
        opW2Prime.delete(minl);
      } else {
        throw new Error('The two operations aren\'t compatible');
      }
    }

    return [opW1Prime, opW2Prime];
  }

  fromJSON(ops) {
    return ops.reduce((opW, op) => {
      if (typeof op === 'number') {
        if (op > 0) {
          opW.skip(op);
        } else {
          opW.delete(op);
        }
      } else {
        opW.insert(op);
      }
      return opW;
    }, this);
  }

  toJSON() {
    const ops = [...this.ops];
    // Return an array with /something/ in it,
    // since an empty array will be treated as null by Firebase.
    if (ops.length === 0) {
      ops.push(0);
    }
    return ops;
  }
}

export default OperationWrapper;
