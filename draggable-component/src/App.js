import { useRef } from "react";
import "./styles.css";
import { useDrag } from "./useDrag";

export default function App() {
  const draggableRef = useRef(null);

  const { position, handleMouseDown } = useDrag({
    ref: draggableRef
  });

  return (
    <div className="App">
      <div
        className="draggable"
        ref={draggableRef}
        style={{
          top: position.y,
          left: position.x
        }}
      >
        <div className="draggable-panel" onMouseDown={handleMouseDown}>
          Draggable panel
        </div>
        <div className="draggable-content">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book
        </div>
      </div>
    </div>
  );
}
