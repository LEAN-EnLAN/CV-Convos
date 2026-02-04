'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Upload, FileText, X, Loader2, Sparkles,
    FileCheck, Zap, Shield, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { buildApiUrl } from '@/lib/api/base';
import { getAiConfigErrorMessage } from '@/lib/ai-errors';
import { CVData } from '@/types/cv';
import { resolveApiErrorMessage } from '@/lib/error-utils';

interface FileUploaderProps {
    onSuccess: (data: CVData) => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 12;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const features = [
    {
        icon: Zap,
        title: "Generación Instantánea",
        description: "CV profesional en segundos"
    },
    {
        icon: Shield,
        title: "100% Privado",
        description: "Tus datos no se almacenan"
    },
    {
        icon: Clock,
        title: "Ahorrá Tiempo",
        description: "Sin formularios interminables"
    }
];

export function FileUploader({ onSuccess }: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const formatFileSize = (sizeInBytes: number) => {
        const sizeInMb = sizeInBytes / (1024 * 1024);
        if (sizeInMb >= 1) {
            return `${sizeInMb.toFixed(2)} MB`;
        }
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles, fileRejections) => {
            if (files.length + acceptedFiles.length > MAX_FILES) {
                toast.error(`Límite de ${MAX_FILES} archivos por sesión`);
                return;
            }

            if (fileRejections.length > 0) {
                fileRejections.forEach(({ file, errors }) => {
                    const hasSizeError = errors.some((error) => error.code === 'file-too-large');
                    if (hasSizeError) {
                        toast.error(`"${file.name}" supera el límite de ${MAX_FILE_SIZE_MB} MB`);
                        return;
                    }
                    toast.error(`"${file.name}" no es un formato soportado`);
                });
            }

            setFiles((prev) => [...prev, ...acceptedFiles]);
            if (acceptedFiles.length > 0) {
                toast.success(`${acceptedFiles.length} archivo(s) agregado(s)`);
            }
        },
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
        },
        maxSize: MAX_FILE_SIZE_BYTES,
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };



    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);


        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        try {
            const response = await fetch(buildApiUrl('/api/generate-cv'), {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(100);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = resolveApiErrorMessage(errorData, 'Error al generar el CV');
                throw new Error(errorMessage);
            }

            const data = await response.json();

            setTimeout(() => {
                onSuccess(data);
                toast.success('¡Tu CV profesional está listo!');
            }, 500);
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            const aiConfigMessage = getAiConfigErrorMessage(message);
            if (aiConfigMessage) {
                toast.error(aiConfigMessage);
            } else if (message === 'Failed to fetch') {
                toast.error('No se pudo conectar con el servidor. Verificá que el backend esté corriendo en el puerto 8000.');
            } else {
                toast.error(message || 'Error al generar el CV. Intentá de nuevo.');
            }
        } finally {
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 600);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-6xl mx-auto px-6 py-12">
                    {/* Header */}
                    <header className="flex items-center gap-3 mb-16">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-xl font-bold text-primary-foreground">CV</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">CV-ConVos</h1>
                            <p className="text-xs text-muted-foreground">CV-ConVos: tu historia</p>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    <Sparkles className="w-4 h-4" />
                                    Potenciado por IA
                                </div>
                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                                    Transformá tu carrera{' '}
                                    <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                                        con un CV que destaque
                                    </span>
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-lg">
                                    Subí tus documentos anteriores, certificados o perfil de LinkedIn.
                                    Nuestra IA construye tu historia profesional en segundos.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="grid sm:grid-cols-3 gap-4">
                                {features.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <feature.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{feature.title}</h3>
                                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Upload Card */}
                        <div className="relative">
                            <Card className="relative overflow-hidden border-2 border-dashed hover:border-primary/50 transition-colors duration-300 bg-card/80 backdrop-blur-sm">
                                <div
                                    {...getRootProps()}
                                    className={`p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl ${isDragActive ? 'bg-primary/5 scale-[0.99]' : ''
                                        }`}
                                    tabIndex={0}
                                    role="button"
                                    aria-label="Zona de carga de archivos. Arrastrá o hacé clic para subir tus documentos."
                                >
                                    <input {...getInputProps()} tabIndex={-1} aria-label="Seleccionar archivos" />

                                    <div className="space-y-6">
                                        <div className={`
                                            w-20 h-20 mx-auto rounded-2xl flex items-center justify-center
transition-all duration-200
                                            ${isDragActive
                                                ? 'bg-primary text-primary-foreground scale-105'
                                                : 'bg-primary/10'
                                            }
                                        `}>
                                            <Upload className={`w-10 h-10 text-primary`} />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xl font-semibold">
                                                {isDragActive
                                                    ? '¡Soltá los archivos acá!'
                                                    : 'Arrastrá tus archivos'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                o hacé clic para seleccionar
                                            </p>
                                            <p className="text-xs text-muted-foreground/70">
                                                PDF, DOCX o TXT • Hasta {MAX_FILES} archivos • Máx. {MAX_FILE_SIZE_MB} MB c/u
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="h-px bg-border" />

                                        <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border group hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                            <FileCheck className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive"
                                                        aria-label={`Eliminar archivo ${file.name}`}
                                                    >
                                                        <X className="w-4 h-4 text-destructive" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progress Bar */}
                                        {isUploading && (
                                            <div className="space-y-2">
                                                <Progress value={uploadProgress} className="h-2" />
                                                <p className="text-sm text-center text-muted-foreground animate-pulse">
                                                    Procesando tu archivo...
                                                </p>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                            disabled={isUploading}
                                            size="lg"
                                            className="w-full h-14 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-5 w-5" />
                                                    Generar CV Profesional
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </Card>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10" />
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-accent/10 rounded-full blur-xl -z-10" />
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
