import { APIGatewayProxyHandler } from 'aws-lambda';
import api from 'lambda-api';

import generateQuestComplete from 'src/templates/QuestComplete/QuestComplete';
import { metaTemplate } from 'src/templates/utils';

const router = api();

router.use((req, res, next) => {
  const { userAgent, query, path, requestContext } = req;
  const { share } = query;

  if (share === undefined) return next();

  if (/^(facebookexternalhit)|(Twitterbot)|(Pinterest)/gi.test(userAgent)) {
    const baseUrl = `https://${
      process.env.PRODUCTION ? requestContext.domainName : req.headers.host
    }/dev`;

    const imageSrc = Object.entries(query)
      .reduce((newUrl, [key, value]) => {
        if (value) newUrl.searchParams.set(key, value);
        return newUrl;
      }, new URL(baseUrl + path))
      .toString();

    return res.html(metaTemplate(imageSrc));
  }

  return res.redirect('https://quest.stellar.org/');
});

router.get('/completion', async (req, res) => {
  const { query } = req;
  const image = await generateQuestComplete(query as any);

  res.type('png');
  return res.send(image);
});

const handler: APIGatewayProxyHandler = async (event, context) => {
  try {
    const response = await router.run(event, context);

    if (response.multiValueHeaders?.['content-type'].includes('image/png')) {
      response.isBase64Encoded = true;
    }

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
