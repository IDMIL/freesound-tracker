import { default as UUID } from 'node-uuid';
import { audioContext, playAudio, stopAudio } from './audio';
import makeActionCreator from './makeActionCreator';
import { elementWithId } from '../utils/arrayUtils';
import { getRandomElement } from '../utils/misc';
import * as at from './actionTypes';

export const setPathSync = makeActionCreator(at.SET_PATH_SYNC,
  'pathID', 'syncMode');

export const startStopPath = makeActionCreator(at.STARTSTOP_PATH,
  'pathID', 'isPlaying');

export const setPathCurrentlyPlaying = makeActionCreator(at.SET_PATH_CURRENTLY_PLAYING,
  'pathID', 'soundIDx', 'willFinishAt');

export const selectPath = makeActionCreator(at.SELECT_PATH,
  'pathID');

export const setPathActive = makeActionCreator(at.SET_PATH_ACTIVE,
  'pathID', 'isActive');

export const deleteSoundFromPath = makeActionCreator(at.DELETE_SOUND_FROM_PATH,
  'soundID', 'pathID');

export const addSoundToPath = (soundID, pathID) => (dispatch, getStore) => dispatch({
  type: at.ADD_SOUND_TO_PATH,
  soundID,
  pathID: pathID || getStore().paths.selectedPath,
});

export const addRandomSoundToPath = (pathID) => (dispatch, getStore) => {
  const store = getStore();
  const space = elementWithId(store.spaces.spaces, store.spaces.currentSpace, 'queryID');
  const spaceSounds = space.sounds;
  dispatch({
    type: at.ADD_SOUND_TO_PATH,
    soundID: spaceSounds[0],
    pathID: pathID || getStore().paths.selectedPath,
  });
};

export const clearAllPaths = makeActionCreator(at.CLEAR_ALL_PATHS);

export const setPathWaitUntilFinished = makeActionCreator(at.SET_PATH_WAIT_UNTIL_FINISHED,
  'pathID', 'waitUntilFinished');

export const playNextSoundFromPath = (pathID, time) =>
  (dispatch, getStore) => {
    const store = getStore();
    const path = elementWithId(store.paths.paths, pathID);
    if (path) {
      if (path.isPlaying) {
        let nextSoundToPlayIdx;
        if ((path.currentlyPlaying.soundIDx === undefined) ||
          (path.currentlyPlaying.soundIDx + 1 >= path.sounds.length)) {
          nextSoundToPlayIdx = 0;
        } else {
          nextSoundToPlayIdx = path.currentlyPlaying.soundIDx + 1;
        }
        const nextSoundToPlay = store.sounds.byID[path.sounds[nextSoundToPlayIdx]];
        const nextSoundToPlayDuration = nextSoundToPlay.duration;
        const willFinishAt = (time === undefined) ?
          audioContext.currentTime + nextSoundToPlayDuration : time + nextSoundToPlayDuration;
        dispatch(setPathCurrentlyPlaying(path.id, nextSoundToPlayIdx, willFinishAt));
        if (path.syncMode === 'no') {
          dispatch(playAudio(nextSoundToPlay, undefined, undefined, () => {
            dispatch(playNextSoundFromPath(pathID));
          }));
        } else {
          // If synched to metronome, sounds will be triggered by onAudioTick events
          if (time !== undefined) {
            dispatch(playAudio(path.sounds[nextSoundToPlayIdx], { time }));
          }
        }
      }
    }
  };

export const triggerSoundHelper = (pathID, time) =>
  (dispatch, getStore) => {
    const store = getStore();
    const path = elementWithId(store.paths.paths, pathID);
    if (path.waitUntilFinished) {
      // Check if sound will be finished at time
      if ((path.currentlyPlaying.willFinishAt === undefined)
        || (path.currentlyPlaying.willFinishAt <= time)) {
        dispatch(playNextSoundFromPath(path.id, time));
      }
    } else {
      dispatch(playNextSoundFromPath(path.id, time));
    }
  };

const shouldTriggerSoundHelper = (path, tick) => (
  (path.syncMode === 'beat' && tick % 4 === 0) ||
  (path.syncMode === '2xbeat' && tick % 8 === 0) ||
  (path.syncMode === 'bar' && tick === 0)
);

export const onAudioTickPath = (pathID, bar, beat, tick, time) =>
  (dispatch, getStore) => {
    const store = getStore();
    const path = elementWithId(store.paths.paths, pathID);
    if (path && path.isPlaying) {
      if (shouldTriggerSoundHelper(path, tick)) {
        dispatch(triggerSoundHelper(pathID, time));
      }
    }
  };

const linkPathToMetronome = (pathID, tickEvt, dispatch) => {
  const { bar, beat, tick, time } = tickEvt.detail;
  dispatch(onAudioTickPath(pathID, bar, beat, tick, time));
};

export const addPath = (sounds) => (dispatch) => {
  const pathID = UUID.v4();
  dispatch({
    type: at.ADD_PATH,
    sounds,
    pathID,
  });
  // link new path to metronome ticks
  window.addEventListener('tick', (evt) => linkPathToMetronome(pathID, evt, dispatch), false);
};

export const removePath = (pathID) => (dispatch) => {
  // remove listener for tick events
  window.removeEventListener('tick', (evt) => linkPathToMetronome(pathID, evt, dispatch), false);
  dispatch({ type: at.REMOVE_PATH, pathID });
};
