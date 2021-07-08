import { APIGatewayProxyEvent } from 'aws-lambda';
import { performance } from 'perf_hooks';
import { fabric } from 'fabric';

import { loadFabricImage, loadFabricImageLocal } from './templates/utils';

import { baseUrl } from './constants/url';
import series1 from './series/series1-data.json';
import series2 from './series/series2-data.json';
import series3 from './series/series3-data.json';

import UbuntuBold from './fonts/Ubuntu-Bold.ttf';

import questCompleteBackground from './assets/quest-complete.png';
import xlmCoin from './assets/xlm_coin.png';
import badge from './assets/badge.png';

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

const imageElementCache: { [imageSrc: string]: HTMLImageElement } = {};

const getElement = async (src: string) => {
  if (!imageElementCache[src]) {
    const image = await loadFabricImageLocal(src);
    imageElementCache[src] = image.getElement() as HTMLImageElement;
  }

  return imageElementCache[src];
};

// let badgeImageCache: { [publicKey: string]: string } = {};

const generateCompletionImage = async (params: {
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

  if (position && (position <= 0 || position > series.prizes.length)) {
    throw { status: 400, message: 'Position not within prizes range.' };
  }

  // if (!badgeImageCache[badgeIssuer]) {
  //   const badge = await loadFabricImage(
  //     `${baseUrl}/badge/${badgeIssuer}?v=${set}`
  //   );
  //   badge.scaleToWidth(64);
  //   badgeImageCache[badgeIssuer] = badge.toDataURL({});
  // }

  const backgroundImage = new fabric.Image(
    await getElement(questCompleteBackground)
  );

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
    const coinImage = new fabric.Image(await getElement(xlmCoin), {
      originX: 'center',
    });
    coinImage.scaleToWidth(64);

    const coinText = new fabric.Text(`+${series.prizes[position - 1]} XLM`, {
      ...textOptions,
      top: coinImage.getScaledHeight() + 8,
    });

    const coinGroup = new fabric.Group([coinImage, coinText], { left: 96 });

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

  /* ~40ms */
  const image = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
    },
    body: image,
    isBase64Encoded: true,
  };

  return response;
};

const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const { queryStringParameters } = event;

    const execTime = performance.now();
    const response = await generateCompletionImage(
      queryStringParameters as any
    );
    console.log(performance.now() - execTime);

    return response;
  } catch (error: any) {
    let message = error?.message || 'Request failed.';

    if (typeof error === 'string') message = error;

    const statusCode = error?.status || 400;

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: statusCode,
        message,
      }),
    };
  }
};

export default handler;
