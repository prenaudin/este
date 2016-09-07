import * as jsDiff from 'diff';

const diffContentStateText = (previousContentState, contentState) => {
  console.time('diffContentStateText');
  const diff = jsDiff.diffChars(
    previousContentState.getPlainText(),
    contentState.getPlainText()
  );
  console.timeEnd('diffContentStateText');
  return diff;
};

export default diffContentStateText;
