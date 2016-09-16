import { UPDATE_METRONOME_STATUS, SET_TEMPO, START_METRONOME,
  STOP_METRONOME, SET_PLAY_SOUND } from './actions';
import { DEFAULT_TEMPO } from '../../constants';
import sessions from '../Sessions/reducer';

export const initialState = {
  bar: 1,
  beat: 0,
  tick: 0,
  tempo: DEFAULT_TEMPO,
  isPlaying: false,
  shouldPlaySound: false,
};

function metronome(state = initialState, action) {
  switch (action.type) {
    case UPDATE_METRONOME_STATUS: {
      return Object.assign({}, state, {
        bar: action.bar,
        beat: action.beat,
        tick: action.tick,
      });
    }
    case SET_TEMPO: {
      return Object.assign({}, state, {
        tempo: action.tempo,
      });
    }
    case SET_PLAY_SOUND: {
      return Object.assign({}, state, {
        shouldPlaySound: action.shouldPlaySound,
      });
    }
    case START_METRONOME: {
      return Object.assign({}, state, { isPlaying: true });
    }
    case STOP_METRONOME: {
      return Object.assign({}, state, { isPlaying: false });
    }
    default:
      return state;
  }
}

export default sessions(metronome);
