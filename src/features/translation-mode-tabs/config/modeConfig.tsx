import type { TranslationMode } from '@shared/lib/store/useTranslatorStore';
import { TextMode, ImagesMode, DocumentMode, SongMode } from '../ui/modes';
import { DocumentsIcon, ImagesIcon, SongIcon, TextIcon } from '@/widgets/translator/ui';
import { ComponentType, ReactNode } from 'react';

export interface ModeConfig {
  label: string;
  icon: ReactNode;
  Component: ComponentType;
}

const TAB_ICONS: Record<TranslationMode, ReactNode> = {
  text: <TextIcon />,
  images: <ImagesIcon />,
  document: <DocumentsIcon />,
  song: <SongIcon />,
};

export const TRANSLATION_MODE_CONFIG: Record<TranslationMode, ModeConfig> = {
  text: {
    label: 'Text',
    icon: TAB_ICONS.text,
    Component: TextMode,
  },
  images: {
    label: 'Images',
    icon: TAB_ICONS.images,
    Component: ImagesMode,
  },
  document: {
    label: 'Documents',
    icon: TAB_ICONS.document,
    Component: DocumentMode,
  },
  song: {
    label: 'Song',
    icon: TAB_ICONS.song,
    Component: SongMode,
  },
};

export const TRANSLATION_MODES_ORDER: TranslationMode[] = ['text', 'images', 'document', 'song'];
