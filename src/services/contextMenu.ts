import { Predicates } from '@/types/db';

export enum KVBContextMenuActionId {
  Edit = 'edit',
  Copy = 'copy',
  OpenUrl = 'open_url',
  ShowQr = 'show_qr',
  Custom = 'custom',
}

export type ContextMenuPayload = string | number | boolean | null | undefined;

export interface ContextMenuActionDescriptor<
  TActionId extends string = string,
  TPayload = ContextMenuPayload,
> {
  id: TActionId;
  label: string;
  iconName?: string;
  payload?: TPayload;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ContextMenuSelection<
  TActionId extends string = string,
  TPayload = ContextMenuPayload,
> {
  actionId: TActionId;
  payload?: TPayload;
}

interface ContextActionInput {
  key: string;
  value: string;
  predicateObjects: Predicates[];
}

const normalize = (value: string) => value.trim().toLowerCase();

const parseObjectTypes = (objectLabel: string | null): string[] =>
  (objectLabel ?? '')
    .split(',')
    .map(normalize)
    .filter(Boolean);

const hasObjectType = (
  objectTypes: string[],
  expected: 'social media' | 'link' | 'url'
) => objectTypes.some((t) => t === expected);

const isUrlLike = (value: string): boolean => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
};

const toOpenableUrl = (value: string): string => {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

export const resolveProfileFieldContextActions = ({
  key,
  value,
  predicateObjects,
}: ContextActionInput): ContextMenuActionDescriptor<KVBContextMenuActionId>[] => {
  const matchingPredicate = predicateObjects.find(
    (p) => normalize(p.label) === normalize(key)
  );
  const objectTypes = parseObjectTypes(matchingPredicate?.objectLabel ?? null);
  const openableValue = toOpenableUrl(value);

  const actions: ContextMenuActionDescriptor<KVBContextMenuActionId>[] = [
    {
      id: KVBContextMenuActionId.Copy,
      label: 'Copy',
      iconName: 'Copy',
      payload: value,
    },
  ];

  if (
    isUrlLike(value) ||
    hasObjectType(objectTypes, 'link') ||
    hasObjectType(objectTypes, 'url')
  ) {
    actions.unshift({
      id: KVBContextMenuActionId.OpenUrl,
      label: 'Open URL',
      iconName: 'ExternalLink',
      payload: openableValue,
    });
  }

  if (hasObjectType(objectTypes, 'social media')) {
    actions.push({
      id: KVBContextMenuActionId.ShowQr,
      label: 'Show QR',
      iconName: 'QrCode',
      payload: value,
    });
  }

  return actions;
};
