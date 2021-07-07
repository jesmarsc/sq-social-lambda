import { fabric } from 'fabric';
import fs from 'fs/promises';

import { gradientColorStops } from '../constants/styles';

const MoonBackground = async (width: number, height: number) => {
  const moonSvg = await fs.readFile('src/assets/moon.svg', {
    encoding: 'utf-8',
  });

  const starsSvg = await fs.readFile('src/assets/stars.svg', {
    encoding: 'utf-8',
  });

  const canvas = new fabric.StaticCanvas(null, {
    width,
    height,
    renderOnAddRemove: false,
  });

  const backgroundGradient = new fabric.Gradient({
    type: 'linear',
    coords: { x1: 0, y1: height, x2: width, y2: 0 },
    colorStops: gradientColorStops,
  });

  const spaceBackgroundFill = new fabric.Rect({
    width: width - 8,
    height: height - 8,
    fill: '#111420',
    absolutePositioned: true,
  });

  const starsObject: fabric.Object = await new Promise((resolve, reject) => {
    fabric.loadSVGFromString(starsSvg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      resolve(obj);
    });
  });

  starsObject.set({
    top: height,
    originY: 'bottom',
    clipPath: spaceBackgroundFill,
  });
  starsObject.scaleToWidth(width);

  const moonObject: fabric.Object = await new Promise((resolve, reject) => {
    fabric.loadSVGFromString(moonSvg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      resolve(obj);
    });
  });

  moonObject.set({
    top: height + 96,
    originX: 'center',
    originY: 'center',
    clipPath: spaceBackgroundFill,
  });

  canvas.setBackgroundColor(backgroundGradient, () => {});

  canvas.add(spaceBackgroundFill, starsObject, moonObject);
  spaceBackgroundFill.center();
  moonObject.centerH();

  const image = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

  await fs.writeFile('src/assets/moon-background.png', image, {
    encoding: 'base64',
  });
};

MoonBackground(600, 315);
