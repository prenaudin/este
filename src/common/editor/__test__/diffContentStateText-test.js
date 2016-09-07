import diffContentStateText from '../diffContentStateText';
import { ContentState } from 'draft-js';
import test from 'ava';

const textsToOperation = (previousText, text) => (
  diffContentStateText(
    ContentState.createFromText(previousText),
    ContentState.createFromText(text)
  )
);

test('it describes a word append to the text', t => {
  const operations = textsToOperation('Hello', 'Hello there');
  t.deepEqual(operations.toJSON(), [
    5, ' there',
  ]);
});

test('it describes a word deletion to the text', t => {
  const operations = textsToOperation('Hello there', 'Hello');
  t.deepEqual(operations.toJSON(), [
    5, -6,
  ]);
});

test('it describes a word insertion in the middle of a text', t => {
  const operations = textsToOperation('Hello there', 'Hello, are you there');
  t.deepEqual(operations.toJSON(), [
    5, ',', 1, 'are you ', 5,
  ]);
});

test('it describes a space insertion', t => {
  const operations = textsToOperation('Hello there ', 'Hello there  ');
  t.deepEqual(operations.toJSON(), [
    12, ' ',
  ]);
});
