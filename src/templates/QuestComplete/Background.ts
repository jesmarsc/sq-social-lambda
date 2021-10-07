import { fabric } from 'fabric';
import fs from 'fs/promises';

import { gradientColorStops } from '../../constants/styles';
import { loadLocalFabricImage } from '../utils';

// @ts-ignore: Missing types
fabric.nodeCanvas.registerFont('src/assets/fonts/Ubuntu-Bold.ttf', {
  family: 'Ubuntu',
  weight: 'bold',
  style: 'normal',
});

const QuestCompletion = async (width: number, height: number) => {
  const canvas = new fabric.StaticCanvas(null, {
    width,
    height,
    renderOnAddRemove: false,
  });

  const backgroundImage = await loadLocalFabricImage('assets/moon-bg.png');

  const textGradient = new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'percentage',
    coords: { x1: 0, y1: 0.75, x2: 1, y2: 0.25 },
    colorStops: gradientColorStops,
  });

  const subtitle = new fabric.Text('I COMPLETED A', {
    fill: '#FFF',
    fontFamily: 'Ubuntu',
    fontSize: 22,
    originX: 'center',
    fontWeight: 'bold',
    charSpacing: 15,
    shadow: '1 2',
  });

  const title = new fabric.Text('STELLAR QUEST', {
    top: subtitle.height,
    fill: textGradient,
    fontFamily: 'Ubuntu',
    fontSize: 48,
    originX: 'center',
    fontWeight: 'bold',
    shadow: '2 4 4',
  });

  const header = new fabric.Group([subtitle, title], {
    top: canvas.getHeight() * 0.12,
  });

  // const footer = new fabric.Text('SERIES 3 AVAILABLE NOW', {
  //   top: canvas.getHeight() - 8,
  //   fill: 'black',
  //   fontFamily: 'Ubuntu',
  //   fontSize: 16,
  //   originY: 'bottom',
  //   fontWeight: 'bold',
  //   shadow: '0 0 2 purple',
  // });
  // canvas.add(footer);
  // footer.centerH();

  canvas.add(backgroundImage, header);
  header.centerH();

  const image = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

  await fs.writeFile('src/assets/completion-bg.png', image, {
    encoding: 'base64',
  });
};

QuestCompletion(600, 315);
