import { fabric } from 'fabric';
import { performance } from 'perf_hooks';

import { loadLocalFabricImage } from 'src/templates/utils';

import series1 from 'src/series/series1-data.json';
import series2 from 'src/series/series2-data.json';
import series3 from 'src/series/series3-data.json';

import UbuntuBold from 'src/assets/fonts/Ubuntu-Bold.ttf';

import background from 'src/assets/completion-bg.png';
import token from 'src/assets/token.png';
import badge from 'src/assets/badge.png';

// @ts-ignore: Missing types
fabric.nodeCanvas.registerFont(UbuntuBold, {
  family: 'Ubuntu',
  weight: 'bold',
  style: 'normal',
});

const seriesData = [series1, series2, series3];

const pluralRules = new Intl.PluralRules('en-US', { type: 'ordinal' });
const pluralSuffix: { [key: string]: string } = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

const textOptions = {
  fontFamily: 'Ubuntu',
  fontWeight: 'bold',
  fontSize: 22,
  fill: 'white',
  shadow: '1 1 2',
  originX: 'center',
};

// let badgeImageCache: { [publicKey: string]: string } = {};
const imageElementCache: { [imageSrc: string]: HTMLImageElement } = {};

const getElement = async (src: string) => {
  if (!imageElementCache[src]) {
    const image = await loadLocalFabricImage(src);
    imageElementCache[src] = image.getElement() as HTMLImageElement;
  }

  return imageElementCache[src];
};

const generateQuestComplete = async (params: {
  set: number;
  quest: number;
  position?: number;
}) => {
  const { set, quest, position } = params;

  if (!set || !quest) {
    throw { status: 400, message: 'Set or quest query parameter is missing.' };
  }

  const series = seriesData[set - 1];
  if (!series) throw { status: 404, message: 'Series not found.' };

  const badgeIssuer = series?.challenges[quest - 1]?.badges.main;
  if (!badgeIssuer) throw { status: 404, message: 'Quest not found.' };

  if (position) {
    if (series.prizes.length === 0)
      throw {
        status: 400,
        message: 'Position not applicable to this series/quest.',
      };
    if (position <= 0 || position > series.prizes.length)
      throw {
        status: 400,
        message: `Position must be between 1 and ${series.prizes.length}`,
      };
  }

  // if (!badgeImageCache[badgeIssuer]) {
  //   const badge = await loadFabricImage(
  //     `${baseUrl}/badge/${badgeIssuer}?v=${set}`
  //   );
  //   badge.scaleToWidth(64);
  //   badgeImageCache[badgeIssuer] = badge.toDataURL({});
  // }

  const backgroundImage = new fabric.Image(await getElement(background));

  const canvas = new fabric.StaticCanvas(null, {
    width: backgroundImage.width,
    height: backgroundImage.height,
    renderOnAddRemove: false,
  });

  const badgeImage = new fabric.Image(await getElement(badge), {
    originX: 'center',
  });
  badgeImage.scaleToWidth(64);

  const badgeText = new fabric.Text('+1 NFT', {
    ...textOptions,
    top: badgeImage.getScaledHeight() + 8,
  });

  const badgeGroup = new fabric.Group([badgeImage, badgeText]);

  const rewards = new fabric.Group([badgeGroup], {
    padding: 8,
  });

  if (position) {
    const tokenImage = new fabric.Image(await getElement(token), {
      originX: 'center',
    });
    tokenImage.scaleToWidth(64);

    const coinText = new fabric.Text(`+${series.prizes[position - 1]} XLM`, {
      ...textOptions,
      top: tokenImage.getScaledHeight() + 8,
    });

    const coinGroup = new fabric.Group([tokenImage, coinText], { left: 96 });

    rewards.addWithUpdate(coinGroup);

    const positionString = position.toString();
    const positionSuffix =
      pluralSuffix[pluralRules.select(position).toString()];

    const positionText = new fabric.Text(
      `${positionString}${positionSuffix} Place`,
      {
        ...textOptions,
        originY: 'bottom',
        top: -4,
        left: rewards.getCenterPoint().x,
      }
    );

    positionText.setSuperscript(
      positionString.length,
      positionString.length + positionSuffix.length
    );

    rewards.addWithUpdate(positionText);
  }

  const rewardsBackground = new fabric.Rect({
    top: -2,
    width: rewards.getScaledWidth() + 32,
    height: rewards.getScaledHeight() + 16,
    fill: 'black',
    opacity: 0.5,
    rx: 4,
    ry: 4,
    originX: 'center',
    originY: 'center',
  });

  rewards.add(rewardsBackground);
  rewardsBackground.sendToBack();

  canvas.setBackgroundImage(backgroundImage, () => {});

  canvas.add(rewards);
  rewards.set({
    originY: 'center',
    top: canvas.getHeight() * 0.65,
  });
  rewards.centerH();

  // const time1 = performance.now();

  // canvas.renderAll();
  // const element = canvas.getElement();
  // const blob = await new Promise<Blob>((resolve, reject) => {
  //   element.toBlob((blob) => {
  //     resolve(blob!);
  //   });
  // });

  // console.log(performance.now() - time1);

  // const stream = canvas.createPNGStream();

  // const buffer = await new Promise<Buffer>((resolve, reject) => {
  //   const _buffer: any[] = [];

  //   stream.on('data', (data: any) => {
  //     _buffer.push(data);
  //   });

  //   stream.on('end', () => resolve(Buffer.concat(_buffer)));
  // });

  // return buffer;

  const image = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

  return image;
};

export default generateQuestComplete;
