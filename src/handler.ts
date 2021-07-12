import { APIGatewayProxyHandler } from 'aws-lambda';
import api from 'lambda-api';

import generateQuestComplete from 'src/templates/QuestComplete/QuestComplete';

const router = api({ version: 'v1.0', base: 'v1' });

router.get('/completion', async (req, res) => {
  const { query } = req;
  const image = await generateQuestComplete(query as any);

  return res.header('content-type', 'image/png').send(image);
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
