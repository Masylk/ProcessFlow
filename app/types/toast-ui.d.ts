declare module '@toast-ui/react-image-editor' {
  import { RefObject } from 'react';

  interface ImageEditorOptions {
    includeUI?: {
      loadImage?: {
        path: string;
        name: string;
      };
      theme?: Record<string, string>;
      menu?: string[];
      initMenu?: string;
      menuBarPosition?: string;
      uiSize?: {
        width: string;
        height: string;
      };
    };
    cssMaxWidth?: number;
    cssMaxHeight?: number;
    selectionStyle?: {
      cornerSize?: number;
      rotatingPointOffset?: number;
    };
  }

  interface ImageEditorInstance {
    toDataURL(): string;
    destroy(): void;
  }

  interface ImageEditorComponent {
    getInstance(): ImageEditorInstance;
  }

  const ImageEditor: React.ForwardRefExoticComponent<
    ImageEditorOptions & React.RefAttributes<ImageEditorComponent>
  >;

  export default ImageEditor;
} 