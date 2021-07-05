import { APIGatewayProxyEvent } from 'aws-lambda';
import { performance } from 'perf_hooks';
import { fabric } from 'fabric';

import { loadFabricImage, loadFabricImageLocal } from './templates/utils';
import seriesThreeData from './series-3-data.json';
import UbuntuRegular from './fonts/Ubuntu-Regular.ttf';
import UbuntuBold from './fonts/Ubuntu-Bold.ttf';
import background from './assets/background-image.png';
import badge from './assets/badge.png';
import xlmCoin from './assets/xlm_coin.png';
import { baseUrl } from './constants/url';

// @ts-ignore: Missing types
fabric.nodeCanvas.registerFont(UbuntuRegular, {
  family: 'Ubuntu',
  weight: 'regular',
  style: 'normal',
});

// @ts-ignore: Missing types
fabric.nodeCanvas.registerFont(UbuntuBold, {
  family: 'Ubuntu',
  weight: 'bold',
  style: 'normal',
});

let backgroundImage: fabric.Image;
const badgeImageCache: { [publicKey: string]: fabric.Image } = {};

const generateCompletionImage = async (quest: number, position?: number) => {
  const badgeIssuer = seriesThreeData.challenges[quest].badges.main;

  if (!backgroundImage) {
    backgroundImage = await loadFabricImageLocal(background);
  }

  // if (!badgeImageCache[badgeIssuer]) {
  //   badgeImageCache[badgeIssuer] = await loadFabricImage(
  //     `${baseUrl}/badge/${badgeIssuer}?v=3`
  //   );
  // }

  const canvas = new fabric.StaticCanvas(null, {
    width: 600,
    height: 315,
    renderOnAddRemove: false,
  });

  canvas.setBackgroundImage(backgroundImage, () => {});
  const backgroundGradient = new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'percentage',
    coords: { x1: 0, y1: 0.75, x2: 1, y2: 0.25 },
    colorStops: [
      { offset: 0, color: '#f7b500' },
      { offset: 0.5, color: '#b620e0' },
      { offset: 1, color: '#32c5ff' },
    ],
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
    fill: backgroundGradient,
    fontFamily: 'Ubuntu',
    fontSize: 48,
    originX: 'center',
    fontWeight: 'bold',
    shadow: '2 4 4',
  });

  const header = new fabric.Group([subtitle, title], {
    top: canvas.getHeight() * 0.12,
  });

  canvas.add(header);
  header.centerH();

  const badgeImage = await loadFabricImageLocal(badge);
  badgeImage.set({ originX: 'center' });

  const badgeText = new fabric.Text('+1 NFT', {
    top: badgeImage.getScaledHeight(),
    fill: '#FFF',
    fontFamily: 'Ubuntu',
    fontSize: 20,
    originX: 'center',
    fontWeight: 'bold',
    shadow: '1 1 2',
  });

  const badgeGroup = new fabric.Group([badgeImage, badgeText]);

  const coinImage = await loadFabricImageLocal(xlmCoin);
  coinImage.set({ originX: 'center' });
  coinImage.scaleToWidth(64);

  const coinText = new fabric.Text('+100 XLM', {
    top: coinImage.getScaledHeight(),
    fill: '#FFF',
    fontFamily: 'Ubuntu',
    fontSize: 20,
    originX: 'center',
    fontWeight: 'bold',
    shadow: '1 1 2',
  });

  const coinGroup = new fabric.Group([coinImage, coinText], {
    left: 96,
  });

  const rewards = new fabric.Group([badgeGroup, coinGroup], {
    top: canvas.getHeight() * 0.5,
    padding: 8,
  });

  canvas.add(rewards);
  rewards.centerH();

  const rewardsBackground = new fabric.Rect({
    top: -4,
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

  const footer = new fabric.Text('SERIES 4 NOW LIVE', {
    top: canvas.getHeight() - 8,
    fill: 'black',
    fontFamily: 'Ubuntu',
    fontSize: 16,
    originY: 'bottom',
    fontWeight: 'bold',
    shadow: '0 0 2 purple',
  });

  canvas.add(footer);
  footer.centerH();

  canvas.renderAll();

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
  const { quest, position } = queryStringParameters as any;

  const time1 = performance.now();
  const response = await generateCompletionImage(quest, position);
  const time2 = performance.now();
  console.log(time2 - time1);

  return response;
};

export default handler;
