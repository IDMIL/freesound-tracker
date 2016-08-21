import { combineReducers } from 'redux';
import { FETCH_SOUNDS_SUCCESS, UPDATE_SOUNDS_POSITION, UPDATE_MAP_POSITION,
  SELECT_SOUND_BY_ID }
  from '../actions/actionTypes';
import { MAP_SCALE_FACTOR } from '../constants';

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

export const computeSoundGlobalPosition = (tsnePosition, spacePosition, mapPosition) => {
  const { translateX, translateY, scale } = mapPosition;
  const cx = ((tsnePosition.x + (windowWidth / (MAP_SCALE_FACTOR * 2))) *
    MAP_SCALE_FACTOR * scale * spacePosition.x) + translateX;
  const cy = ((tsnePosition.y + (windowHeight / (MAP_SCALE_FACTOR * 2))) *
    MAP_SCALE_FACTOR * scale * spacePosition.y) + translateY;
  return { cx, cy };
};

const mapSoundsToObject = (sounds, queryID) => sounds.reduce((curState, curSound) => {
  const soundObj = (queryID) ? Object.assign({}, curSound, { queryID }) : curSound;
  return Object.assign({}, curState, { [curSound.id]: soundObj });
}, {});

const byID = (state = {}, action) => {
  switch (action.type) {
    case FETCH_SOUNDS_SUCCESS: {
      const receivedSounds = mapSoundsToObject(action.sounds, action.queryID);
      return Object.assign({}, state, receivedSounds);
    }
    case UPDATE_SOUNDS_POSITION: {
      const updatedSounds = mapSoundsToObject(action.sounds);
      return Object.assign({}, state, updatedSounds);
    }
    case UPDATE_MAP_POSITION: {
      const mapPosition = action.position;
      const updatedSounds = Object.keys(state).reduce((curState, soundID) => {
        const sound = state[soundID];
        const { tsnePosition, spacePosition } = sound;
        const updateSound = Object.assign({}, sound, {
          position: computeSoundGlobalPosition(tsnePosition, spacePosition, mapPosition),
        });
        return Object.assign({}, curState, { [soundID]: updateSound });
      }, {});
      return Object.assign({}, state, updatedSounds);
    }
    default:
      return state;
  }
};

const selectedSound = (state = 0, action) => {
  switch (action.type) {
    case SELECT_SOUND_BY_ID:
      return action.soundID;
    default:
      return state;
  }
};

export default combineReducers({ byID, selectedSound });
