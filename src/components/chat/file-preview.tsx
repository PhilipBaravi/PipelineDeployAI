import { FileText } from "lucide-react";

interface FilePreviewProps {
  file: {
    name: string;
    size: number;
    type: string;
  };
}

export function FilePreview({ file }: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
      <FileText className="h-4 w-4" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </div>
      </div>
    </div>
  );
}
