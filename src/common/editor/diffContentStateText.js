import * as jsDiff from 'diff';
import OperationWrapper from './OperationWrapper';

const diffContentStateText = (previousContentState, contentState) => {
  console.time('diffContentStateText'); //eslint-disable-line

  const differences = jsDiff.diffChars(
    previousContentState.getPlainText(),
    contentState.getPlainText()
  );

  const operations = differences.reduce((wrapper, diff) => {
    if (diff.added) {
      return wrapper.insert(diff.value);
    }
    if (diff.removed) {
      return wrapper.delete(diff.count);
    }
    return wrapper.skip(diff.count);
  }, new OperationWrapper());

  console.timeEnd('diffContentStateText'); //eslint-disable-line
  return operations;
};

export default diffContentStateText;
