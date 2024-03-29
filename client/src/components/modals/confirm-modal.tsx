import React from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';

import { getAppElement } from '@/utils/get-app-element';

interface ConfirmModalProps {
  isOpen: boolean;
  closeModal: () => void;
  contentLabel?: string;
  onConfirm: () => void;
  message?: JSX.Element | null;
  error?: JSX.Element | string | null;
  disableButtons?: boolean;
}

const customStyles: Modal.Styles = {
  overlay: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '0.375rem',
  },
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'none',
    border: 'none',
    padding: 0,
    overflow: 'visible',
    maxWidth: '100%',
  },
};

const ConfirmModal = ({
  isOpen,
  closeModal,
  contentLabel,
  message = null,
  error = null,
  onConfirm,
  disableButtons = false,
}: ConfirmModalProps) => {
  const closingDuration = 100;
  const springProps = useSpring({
    transform: isOpen ? 'scale3d(1,1,1)' : 'scale3d(0,0,0)',
    config: { tension: 300, friction: 22, duration: isOpen ? undefined : closingDuration },
  });
  return (
    <Modal
      appElement={getAppElement()}
      parentSelector={() => document.querySelector('#card-root') as HTMLElement}
      isOpen={isOpen}
      closeTimeoutMS={closingDuration + 10}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel={contentLabel}
    >
      <animated.div
        style={springProps}
        className="bg-gray-100 p-6 border border-gray rounded-md w-96 max-w-full text-center shadow-modal max-h-screen overflow-auto"
      >
        {message}
        <div className="mt-4 text-error">{error}</div>
        <div className="mt-4">
          <button
            type="button"
            className="btn bg-gray mr-3"
            onClick={closeModal}
            disabled={disableButtons}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn bg-error"
            onClick={onConfirm}
            disabled={disableButtons}
          >
            Delete
          </button>
        </div>
      </animated.div>
    </Modal>
  );
};

export default ConfirmModal;
