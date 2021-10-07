import { metaTemplate } from 'src/templates/utils';

export const parseError = (error: any): { status: number; message: string } => {
  let status = typeof error?.status === 'number' ? error.status : 500;
  let message =
    typeof error?.message === 'string' ? error.message : 'Request Failed.';
  if (typeof error === 'string') message = error;

  return { status, message };
};

export const metaMiddleWare = (req: any, res: any, next: any) => {
  const { userAgent, query, path, requestContext } = req;
  const { share } = query;

  if (share === undefined) return next();

  if (/^(facebookexternalhit)|(Twitterbot)|(Pinterest)/gi.test(userAgent)) {
    const baseUrl = `https://${
      process.env.PRODUCTION ? requestContext.domainName : req.headers.host
    }/dev`;

    const imageSrc = Object.entries(query)
      .reduce((newUrl, [key, value]: any) => {
        if (value) newUrl.searchParams.set(key, value);
        return newUrl;
      }, new URL(baseUrl + path))
      .toString();

    return res.html(metaTemplate(imageSrc));
  }

  return res.redirect('https://quest.stellar.org/');
};
