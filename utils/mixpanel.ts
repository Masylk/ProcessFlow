import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

mixpanel.init(MIXPANEL_TOKEN, { debug: true, track_pageview: true });

const Mixpanel = {
  track: (event: string, properties?: Record<string, any>) => {
    mixpanel.track(event, properties);
  },
  identify: (userId: string) => {
    mixpanel.identify(userId);
  },
  alias: (userId: string) => {
    mixpanel.alias(userId);
  },
  people: {
    set: (properties: Record<string, any>) => {
      mixpanel.people.set(properties);
    },
  },
};

export default Mixpanel;
