import { combineReducers } from 'redux';
import { FETCH_SOUNDS_REQUEST, FETCH_SOUNDS_SUCCESS, FETCH_SOUNDS_FAILURE,
  UPDATE_MAP_POSITION }
  from '../actions/actionTypes';

const computeSpacePosition = (spaceIndex) => ({ x: (spaceIndex + 1), y: 1 });

const spaceInitialState = {
  sounds: [],
  isFetching: true,
  query: undefined,
  queryParams: {
    maxResults: undefined,
    minDuration: undefined,
    maxDuration: undefined,
    descriptor: undefined,
  },
  queryID: undefined,
  error: undefined,
  position: {
    x: 0,
    y: 0,
  },
};

const singleSpace = (state = spaceInitialState, action, spacesInMap) => {
  switch (action.type) {
    case FETCH_SOUNDS_REQUEST: {
      const spacePosition = computeSpacePosition(spacesInMap);
      const { query, queryParams, queryID } = action;
      return Object.assign({}, state, {
        query,
        queryParams,
        queryID,
        position: spacePosition,
      });
    }
    case FETCH_SOUNDS_SUCCESS: {
      const { queryID, sounds } = action;
      if (queryID !== state.queryID) {
        return state;
      }
      return Object.assign({}, state, {
        isFetching: false,
        sounds: sounds.map(sound => sound.id),
      });
    }
    default:
      return state;
  }
};

const spaces = (state = [], action) => {
  switch (action.type) {
    case FETCH_SOUNDS_REQUEST: {
      const spacesInMap = state.length;
      const space = singleSpace(spaceInitialState, action, spacesInMap);
      return [...state, space];
    }
    case FETCH_SOUNDS_SUCCESS: {
      return state.map(space => singleSpace(space, action));
    }
    case FETCH_SOUNDS_FAILURE: {
      // remove space from state if query failed
      return state.filter(space => space.queryID !== action.queryID);
    }
    default:
      return state;
  }
};

const currentSpace = (state = '', action) => {
  switch (action.type) {
    case FETCH_SOUNDS_SUCCESS:
      return action.queryID;
    case UPDATE_MAP_POSITION:
      // TODO: update current space when user moves to another one
      return state;
    default:
      return state;
  }
};

export default combineReducers({ spaces, currentSpace });
