import { fabric } from 'fabric';
import fs from 'fs/promises';

import { baseUrl } from '../constants/url';

export const loadFabricImage = (url: string) =>
  new Promise<fabric.Image>((resolve) =>
    fabric.Image.fromURL(url, (image) => resolve(image))
  );

export const loadFabricImageLocal = (path: string) =>
  loadFabricImage(`file://${__dirname}/../${path}`);

const generateBackground = async (width: number, height: number) => {
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
    gradientUnits: 'percentage',
    coords: { x1: 0, y1: height, x2: width, y2: 0 },
    colorStops: [
      { offset: 0, color: '#f7b500' },
      { offset: 0.5, color: '#b620e0' },
      { offset: 1, color: '#32c5ff' },
    ],
  });

  canvas.setBackgroundColor(backgroundGradient, () => {});

  const spaceBackgroundFill = new fabric.Rect({
    width: width - 8,
    height: height - 8,
    fill: '#111420',
    absolutePositioned: true,
  });

  canvas.add(spaceBackgroundFill);
  spaceBackgroundFill.center();

  const starObject: fabric.Object = await new Promise((resolve, reject) => {
    fabric.loadSVGFromString(starsSvg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      resolve(obj);
    });
  });

  starObject.set({
    clipPath: spaceBackgroundFill,
    originY: 'bottom',
    top: canvas.getHeight(),
  });
  starObject.scaleToWidth(canvas.getWidth());
  canvas.add(starObject);

  const moonObject: fabric.Object = await new Promise((resolve, reject) => {
    fabric.loadSVGFromString(moonSvg, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      resolve(obj);
    });
  });

  moonObject.set({
    clipPath: spaceBackgroundFill,
    originX: 'center',
    originY: 'center',
    top: canvas.getHeight() + 100,
  });
  canvas.add(moonObject);
  moonObject.centerH();

  const image = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

  await fs.writeFile('src/assets/background-image.png', image, {
    encoding: 'base64',
  });
};

generateBackground(600, 315);
