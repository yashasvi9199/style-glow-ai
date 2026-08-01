export interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}
