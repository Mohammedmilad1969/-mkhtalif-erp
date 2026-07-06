'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api, { getApiErrorMessage } from '@/lib/api';

interface FileUploadProps {
  leadId: string;
  onSuccess?: () => void;
}

export default function FileUpload({ leadId, onSuccess }: FileUploadProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    try {
      const { data } = await api.post(`/leads/${leadId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const files = Array.isArray(data) ? data : data?.data || [];
      setUploaded(files.map((f: any) => f.fileName));
      setFiles([]);
      queryClient.invalidateQueries({ queryKey: ['lead-attachments', leadId] });
      queryClient.invalidateQueries({ queryKey: ['lead-timeline', leadId] });
      toast({ title: t('common.success'), description: t('crm.filesUploaded') });
      onSuccess?.();
    } catch (err) {
      toast({ title: t('common.error'), description: getApiErrorMessage(err, t('common.operationFailed')), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (uploaded.length > 0) {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle className="h-12 w-12 text-primary mx-auto" />
        <p>{uploaded.length} file(s) uploaded</p>
        <Button variant="outline" onClick={() => setUploaded([])}>
          {t('common.uploadMore')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-muted-foreground/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-primary">{t('crm.dropHere')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('crm.dragDropFiles')}<br />
            <span className="text-xs">{t('crm.maxFileSize')}</span>
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <File className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button onClick={uploadFiles} disabled={uploading} className="w-full">
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('common.uploading')}</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> {t('common.upload')} ({files.length})</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
