import { Panel, useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng } from 'html-to-image';

import './ExportBtn.styles.css';

function downloadImage(dataUrl:string) {
    const a = document.createElement('a');

    a.setAttribute('e', 'reactflow.png');
    a.setAttribute('href', dataUrl);
    a.click();
}

const imageWidth = 1024;
const imageHeight = 768;

function ExportButton() {
    const { getNodes } = useReactFlow();
    const onClick = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng((document.querySelector('.react-flow__viewport') as HTMLElement), {
      backgroundColor: 'whitesmoke',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  };

  return (
    <Panel position="top-center">
      <button className="export-btn" onClick={onClick}>
        Export Image
      </button>
    </Panel>
  );
}

export default ExportButton;
