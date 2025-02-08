// /pages/_document.tsx (or /app/_document.tsx in App Router)

import Document, { Html, Head, Main, NextScript } from 'next/document';
import { injectContentsquareScript } from '@contentsquare/tag-sdk';

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  componentDidMount() {
    injectContentsquareScript({
      siteId: '5287815',
      async: true,
      defer: false,
    });
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* You can include additional meta tags or external stylesheets here */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
