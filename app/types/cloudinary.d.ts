interface Window {
  cloudinary: {
    createMediaEditor: (config: {
      cloud: {
        cloudName: string;
      };
      image: string;
    }) => {
      show: () => void;
      on: (event: string, callback: (data: any) => void) => void;
    };
  };
} 