import { fabric } from 'fabric';

export const loadFabricImage = (url: string) =>
  new Promise<fabric.Image>((resolve) =>
    fabric.Image.fromURL(url, (image) => resolve(image))
  );

export const loadFabricImageLocal = (path: string) =>
  loadFabricImage(`file://${__dirname}/../${path}`);

export const cloneObject = <Type extends fabric.Object>(object: Type) =>
  new Promise<Type>((resolve) => object.clone((clone: Type) => resolve(clone)));
