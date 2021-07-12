import { fabric } from 'fabric';

export const loadFabricImage = (
  url: string,
  options?: fabric.IImageOptions
) => {
  return new Promise<fabric.Image>((resolve, reject) =>
    fabric.Image.fromURL(
      url,
      (image) => {
        // Fabric ignores error handling so just check any property to see if an image was successfully loaded.
        // image._element will be null if not successful.
        if (!image.getElement().src) {
          reject({ message: 'Failed to load image.', statusCode: 404 });
        }
        resolve(image);
      },
      options
    )
  );
};

export const loadLocalFabricImage = (
  path: string,
  options?: fabric.IImageOptions
) => loadFabricImage(`file://${__dirname}/../${path}`, options);

export const cloneObject = <Type extends fabric.Object>(object: Type) =>
  new Promise<Type>((resolve) => object.clone((clone: Type) => resolve(clone)));
