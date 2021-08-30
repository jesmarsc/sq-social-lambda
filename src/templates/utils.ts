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

export const metaTemplate = (imageSrc: string) => {
  return `
    <head>
      <meta property="og:title" content="Stellar Quest" />
      <meta property="og:site_name" content="Stellar Quest" />
      <meta name="twitter:title" content="Stellar Quest" />

      <meta property="og:description" content="Learn Stellar, Collect NFTs, Earn XLM!" />
      <meta name="twitter:description" content="Learn Stellar, Collect NFTs, Earn XLM!" />
      <meta name="description" content="Learn Stellar, Collect NFTs, Earn XLM!" />

      <meta property="og:image" content="${imageSrc}" />
      <meta name="twitter:image:src" content="${imageSrc}" />

      <meta property="og:url" content="https://quest.stellar.org/" />
      
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </head>
    <body>
      <h1>Stellar Quest</h1>
      <img src="${imageSrc}" alt="Stellar Quest"/>
      <p>Learn Stellar, Collect NFTs, Earn XLM!</p>
    </body>
  `;
};
