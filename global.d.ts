// global.d.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

interface Window {
  amplitude: {
    add: (plugin: any) => void;
    init: (apiKey: string, config?: any) => void;
    logEvent: (eventName: string, eventProperties?: any) => void;
    // Add other methods or properties you might use from amplitude
  };
  sessionReplay: {
    plugin: (config: { sampleRate: number }) => any;
    // Extend with more properties if needed
  };
}
