import { APIGatewayProxyHandler } from 'aws-lambda';
import api, { Request, Response, NextFunction } from 'lambda-api';

import generateQuestComplete from 'src/templates/QuestComplete/QuestComplete';
// import { metaTemplate } from 'src/templates/utils';
import { parseError } from 'src/utils/utils';

const router = api();

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const parsedError = parseError(error);
  res.status(parsedError.status).json(parsedError);
  next();
});

// router.use((req, res, next) => {
//   const { userAgent, query, path, requestContext } = req;
//   const { share } = query;

//   if (share === undefined) return next();

//   if (/^(facebookexternalhit)|(Twitterbot)|(Pinterest)/gi.test(userAgent)) {
//     const baseUrl = `https://${
//       process.env.PRODUCTION ? requestContext.domainName : req.headers.host
//     }/dev`;

//     const imageSrc = Object.entries(query)
//       .reduce((newUrl, [key, value]) => {
//         if (value) newUrl.searchParams.set(key, value);
//         return newUrl;
//       }, new URL(baseUrl + path))
//       .toString();

//     return res.html(metaTemplate(imageSrc));
//   }

//   return res.redirect('https://quest.stellar.org/');
// });

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
    const parsedError = parseError(error);

    return {
      statusCode: parsedError.status,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedError),
    };
  }
};

export default handler;
