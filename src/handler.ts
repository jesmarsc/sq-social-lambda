import { APIGatewayProxyEvent } from 'aws-lambda';
import { performance } from 'perf_hooks';
import { fabric } from 'fabric';

import {
  cloneObject,
  loadFabricImage,
  loadFabricImageLocal,
} from './templates/utils';

import { baseUrl } from './constants/url';
import series1 from './series/series1-data.json';
import series2 from './series/series2-data.json';
import series3 from './series/series3-data.json';

import UbuntuBold from './fonts/Ubuntu-Bold.ttf';

import questCompleteBackground from './assets/quest-complete.png';
import xlmCoin from './assets/xlm_coin.png';

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

let backgroundImage: fabric.Image;
let badgeImageCache: { [publicKey: string]: fabric.Image } = {};
let coinImage: fabric.Image;

const generateCompletionImage = async (
  set: number,
  quest: number,
  position?: number
) => {
  const series = seriesData[set - 1];
  const badgeIssuer = series.challenges[quest - 1].badges.main;

  if (!backgroundImage) {
    backgroundImage = await loadFabricImageLocal(questCompleteBackground);
  }

  if (!badgeImageCache[badgeIssuer]) {
    badgeImageCache[badgeIssuer] = await loadFabricImage(
      `${baseUrl}/badge/${badgeIssuer}?v=${set}`
    );
    badgeImageCache[badgeIssuer].set({ originX: 'center' });
    badgeImageCache[badgeIssuer].scaleToWidth(64);
  }

  const badgeImage = badgeImageCache[badgeIssuer];

  const canvas = new fabric.StaticCanvas(null, {
    width: backgroundImage.getScaledWidth(),
    height: backgroundImage.getScaledHeight(),
    renderOnAddRemove: false,
  });

  canvas.setBackgroundImage(backgroundImage, () => {});

  const imageText = new fabric.Text('', {
    fontFamily: 'Ubuntu',
    fontWeight: 'bold',
    fontSize: 22,
    fill: 'white',
    shadow: '1 1 2',
    originX: 'center',
  });

  const badgeText = await cloneObject(imageText);
  badgeText.set({ text: '+1 NFT', top: badgeImage.getScaledHeight() + 8 });

  const badgeGroup = new fabric.Group([badgeImage, badgeText]);

  const rewards = new fabric.Group([badgeGroup], {
    padding: 8,
  });

  if (position && series.prizes.length > 0) {
    if (!coinImage) {
      coinImage = await loadFabricImageLocal(xlmCoin);
      coinImage.set({ originX: 'center' });
      coinImage.scaleToWidth(64);
    }

    const coinText = await cloneObject(imageText);
    coinText.set({
      text: `+${series.prizes[position - 1] || 0} XLM`,
      top: badgeImage.getScaledHeight() + 8,
    });

    const coinGroup = new fabric.Group([coinImage, coinText], {
      top: rewards.get('top'),
      left: rewards.get('left')! + 118,
    });

    rewards.addWithUpdate(coinGroup);

    const positionText = await cloneObject(imageText);
    const positionString = position.toString();
    const positionSuffix =
      pluralSuffix[pluralRules.select(position).toString()];

    positionText.set({
      top: rewards.get('top')! - 8,
      left: rewards.getCenterPoint().x,
      originY: 'bottom',
      text: `${positionString}${positionSuffix} Place`,
    });

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

  canvas.add(rewards);
  rewards.set({
    originY: 'center',
    top: canvas.getHeight() * 0.65,
  });
  rewards.centerH();

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
  const { queryStringParameters } = event;
  const { set, quest, position } = queryStringParameters as any;

  const time1 = performance.now();
  const response = await generateCompletionImage(set, quest, position);
  const time2 = performance.now();
  console.log('execution time:', time2 - time1);

  return response;
};

export default handler;
