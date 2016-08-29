import { UPDATE_MAP_POSITION, SET_SPACE_AS_CENTER } from '../actions/actionTypes';

export const initialState = {
  translateX: 0,
  translateY: 0,
  scale: 1,
  forceMapUpdate: false,
};

const map = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_MAP_POSITION: {
      const { translateX, translateY, scale } = action.position;
      const forceMapUpdate = false;
      return Object.assign({}, state, { translateX, translateY, scale, forceMapUpdate });
    }
    case SET_SPACE_AS_CENTER: {
      const { spacePositionX, spacePositionY } = action;
      const { scale } = state;
      const finalTranslateX = ((window.innerWidth / 2) - spacePositionX) / scale;
      const finalTranslateY = ((window.innerHeight / 2) - spacePositionY) / scale;
      const forceMapUpdate = true;
      return Object.assign({}, state, {
        translateX: finalTranslateX,
        translateY: finalTranslateY,
        forceMapUpdate });
    }
    default:
      return state;
  }
};

export default map;
