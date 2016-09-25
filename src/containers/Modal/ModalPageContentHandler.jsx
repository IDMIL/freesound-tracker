import React from 'react';
import Modal from 'components/Modal';
import { MODAL_PAGES } from 'constants';
import SaveSessionModalContainer from './SaveSessionModalContainer';
import NewSessionModalContainer from './NewSessionModalContainer';
import LoadSessionModalContainer from './LoadSessionModalContainer';

const propTypes = {
  currentPage: React.PropTypes.string,
};

const ModalContentContainer = (props) => {
  switch (props.currentPage) {
    case MODAL_PAGES.NEW_SESSION:
      return <NewSessionModalContainer />;
    case MODAL_PAGES.SAVE_SESSION:
      return <SaveSessionModalContainer />;
    case MODAL_PAGES.LOAD_SESSION:
      return <LoadSessionModalContainer />;
    default:
      return <Modal />;
  }
};

ModalContentContainer.propTypes = propTypes;
export default ModalContentContainer;
