import ScanUpload from '../ScanUpload';

export default function ScanUploadExample() {
  return (
    <ScanUpload
      onFileSelect={(file) => console.log('File selected:', file.name)}
    />
  );
}
