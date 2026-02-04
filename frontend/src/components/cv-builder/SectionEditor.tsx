'use client';

import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SortableCardProps {
    id: string;
    index: number;
    dragLabel: string;
    onRemove: (index: number) => void;
    onDragStart: (id: string) => (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (id: string) => (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (id: string) => (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    onKeyReorder: (direction: 'up' | 'down') => void;
    children: React.ReactNode;
    cardClassName?: string;
    isDragging: boolean;
    isDragOver: boolean;
}

function SortableCard({
    id,
    index,
    dragLabel,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onKeyReorder,
    children,
    cardClassName,
    isDragging,
    isDragOver,
}: SortableCardProps) {
    return (
        <Card
            onDragOver={onDragOver(id)}
            onDrop={onDrop(id)}
            onDragEnd={onDragEnd}
            className={cn(
                'p-4 relative group hover:shadow-md transition-all',
                isDragging && 'opacity-70 ring-2 ring-primary/30',
                isDragOver && 'border-primary/50',
                cardClassName
            )}
        >
            <div className="absolute left-2 top-2 flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    aria-label={dragLabel}
                    draggable
                    onDragStart={onDragStart(id)}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            onKeyReorder('up');
                        }
                        if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            onKeyReorder('down');
                        }
                    }}
                >
                    <GripVertical className="w-4 h-4" />
                </Button>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
                aria-label="Eliminar entrada"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="space-y-3 pl-8 pr-6">{children}</div>
        </Card>
    );
}

interface SectionEditorProps<T extends { id: string }> {
    items: T[];
    addLabel: React.ReactNode;
    dragHint: string;
    dragLabel: (item: T, index: number) => string;
    onReorder: (items: T[]) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
    renderFields: (item: T, index: number) => React.ReactNode;
    cardClassName?: string;
    addButtonClassName?: string;
}

export function SectionEditor<T extends { id: string }>({
    items,
    addLabel,
    dragHint,
    dragLabel,
    onReorder,
    onAdd,
    onRemove,
    renderFields,
    cardClassName,
    addButtonClassName,
}: SectionEditorProps<T>) {
    const [draggedId, setDraggedId] = React.useState<string | null>(null);
    const [dragOverId, setDragOverId] = React.useState<string | null>(null);

    const moveItem = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
        const nextItems = [...items];
        const [removed] = nextItems.splice(oldIndex, 1);
        nextItems.splice(newIndex, 0, removed);
        onReorder(nextItems);
    };

    const handleDragStart = (id: string) => (event: React.DragEvent<HTMLDivElement>) => {
        setDraggedId(id);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (id: string) => (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOverId(id);
    };

    const handleDrop = (id: string) => (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const activeId = draggedId || event.dataTransfer.getData('text/plain');
        if (!activeId || activeId === id) return;
        const oldIndex = items.findIndex((item) => item.id === activeId);
        const newIndex = items.findIndex((item) => item.id === id);
        if (oldIndex === -1 || newIndex === -1) return;
        moveItem(oldIndex, newIndex);
        setDraggedId(null);
        setDragOverId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{dragHint}</p>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <SortableCard
                        key={item.id}
                        id={item.id}
                        index={index}
                        dragLabel={dragLabel(item, index)}
                        onRemove={onRemove}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        onKeyReorder={(direction) => {
                            if (direction === 'up' && index > 0) {
                                moveItem(index, index - 1);
                            }
                            if (direction === 'down' && index < items.length - 1) {
                                moveItem(index, index + 1);
                            }
                        }}
                        cardClassName={cardClassName}
                        isDragging={draggedId === item.id}
                        isDragOver={dragOverId === item.id}
                    >
                        {renderFields(item, index)}
                    </SortableCard>
                ))}
            </div>
            <Button onClick={onAdd} className={cn('w-full h-9 gap-2', addButtonClassName)} variant="outline">
                {addLabel}
            </Button>
        </div>
    );
}
