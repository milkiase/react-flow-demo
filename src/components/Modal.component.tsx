import {shallow} from 'zustand/shallow';
import useStore from "../store/store";

import "./Modal.styes.css";

function Modal() {
  const {setShowModal, modalInfo} = useStore((state)=> ({setShowModal: state.setShowModal, modalInfo: state.modalInfo}), shallow)
  return (
    <div className="modal-container">
      <div className="modal" onClick={()=> setShowModal(false)}>
        <h3>{modalInfo}</h3>
        <p>Click me to exit !</p>
      </div>
    </div>
  );
}

export default Modal;
