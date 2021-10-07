import { APIGatewayProxyHandler } from 'aws-lambda';
import api, { Request, Response, NextFunction } from 'lambda-api';

import generateQuestComplete from 'src/templates/QuestComplete/QuestComplete';
import { parseError } from 'src/utils/utils';

const router = api();

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const parsedError = parseError(error);
  res.status(parsedError.status).json(parsedError);
  next();
});

router.get('/completion', async (req, res) => {
  const { query } = req;
  const image = await generateQuestComplete(query as any);

  res.type('png');
  return res.header('cache-control', 'public, max-age=2592000').send(image);
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
