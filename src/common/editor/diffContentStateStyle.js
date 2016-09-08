/* @flow */
import { Record, Set, List } from 'immutable';
import immutableDiff from 'immutablediff';
import { ContentState } from 'draft-js';

const Character = Record({
  position: -1,
  value: ' ',
  style: Set(),
  entity: null,
});

const convertContentBlockToCharacterList = (contentBlock, blockOffset) => {
  let offset = 0;
  return contentBlock.get('characterList').map((characterMetadata) => (
    new Character({
      value: contentBlock.getText()[offset],
      position: blockOffset + offset++,
      style: characterMetadata.getStyle(),
      entity: characterMetadata.getEntity(),
    })
  ));
};

const convertContentStateToCharacterList = (contentState) => {
  let blockOffset = 0;
  return contentState.getBlockMap().reduce((characterList, contentBlock) => {
    const blockCharacterList = convertContentBlockToCharacterList(contentBlock, blockOffset);
    blockOffset += contentBlock.getLength() + 1;
    return characterList
      .concat(blockCharacterList)
      .push(new Character({ value: '\n', position: blockOffset - 1 }));
  }, List());
};

const diffContentStateStyle = (previousContentState: ContentState, contentState: ContentState) => {
  const differences = immutableDiff(
    convertContentStateToCharacterList(previousContentState),
    convertContentStateToCharacterList(contentState),
  );
  return differences;
};

export default diffContentStateStyle;
